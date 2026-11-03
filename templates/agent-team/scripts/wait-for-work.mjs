#!/usr/bin/env node
// Blocks until there is new work for one role, so an idle agent chat picks up handoffs within minutes.
// Run it in the FOREGROUND only. It gives up after --max-min, exits when the chat that started it is gone,
// and a second copy for the same role exits at once, so nothing is ever left running.
//
// Work is: an item newly labelled for you (owner:<role>; the coordinator uses coordinatorLabel); a comment on
// an item you own where someone else spoke last and didn't hand it to another role; a comment addressed to
// you anywhere ("→ Role", "Role:" mid-text, "@role"); a comment or review on a PR whose title names one of
// your issues ("#123 …"); and your own "Next read <ISO>Z" coming due. At start it refuses to wait (exit 6)
// while you own items you can act on, and offers the oldest `ready` issue in your lane when you own none.
//
// Zero dependencies: Node >= 20 and an authenticated `gh` CLI. Config: team.config.json next to this script,
// or --config <path>. Exported functions are pure and tested in wait-for-work.test.mjs.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

export const USAGE = `Usage: node scripts/wait-for-work.mjs --me <role> [--max-min 30] [--poll-sec 300] [--config path] [--probe] [--force]

  --me <role>      role key from team.config.json "roles" (e.g. dev, dev2, qa)
  --max-min <n>    give up after n minutes (default 30)
  --poll-sec <n>   seconds between polls (default 300, minimum 30)
  --config <path>  config file (default: team.config.json next to this script)
  --probe          one read-only pass: no lock, no saved state, no waiting
  --force          wait even though you own actionable items (skips exit 6)

Exit codes: 0 work found (printed), 2 usage/config error, 3 nothing new before --max-min,
4 another waiter for this role is running, 5 the chat that started it is gone,
6 you already own actionable items (top 3 printed; work them instead of waiting).`;

export const EXIT = { WORK: 0, USAGE: 2, TIMEOUT: 3, LOCKED: 4, ORPHANED: 5, OWNS_WORK: 6 };

export const DEFAULTS = {
  boardIssue: null,
  coordinatorRole: null,
  coordinatorLabel: "decision",
  holdLabels: ["waiting-owner", "blocked", "parked", "later", "decision", "standing"],
  quietLabels: ["waiting-owner", "blocked", "parked", "later"],
  timerHoldLabels: ["waiting-owner", "parked", "later"],
  readyLabel: "ready",
  priorityLabel: null,
  laneOf: {},
  roleCardsPath: "docs/team/orchestration.md",
  ignoreBots: true,
  ignoreMarkers: [],
  worktreeRoot: "~/work-wt",
  baseBranch: "next",
  productionBranch: "main",
};

/** Config with defaults filled in; throws a readable error on anything the waiter can't work with. */
export function normalizeConfig(raw) {
  if (!raw || typeof raw !== "object") throw new Error("config must be a JSON object");
  const config = { ...DEFAULTS, ...raw };
  if (typeof config.repo !== "string" || !/^[\w.-]+\/[\w.-]+$/.test(config.repo) || config.repo === "owner/name") {
    throw new Error(`config "repo" must be "owner/name" of your repository (got ${JSON.stringify(config.repo)})`);
  }
  if (!config.roles || typeof config.roles !== "object" || !Object.keys(config.roles).length) {
    throw new Error('config "roles" must map role keys to display names, e.g. {"dev": "Dev"}');
  }
  for (const [key, name] of Object.entries(config.roles)) {
    if (!/^[a-z][a-z0-9_-]*$/.test(key)) throw new Error(`role key "${key}" must be lower-case letters, digits, - or _`);
    if (typeof name !== "string" || !name.trim()) throw new Error(`role "${key}" needs a display name`);
  }
  if (config.coordinatorRole && !(config.coordinatorRole in config.roles)) {
    throw new Error(`coordinatorRole "${config.coordinatorRole}" is not in roles`);
  }
  return config;
}

/** Reads and normalizes the config: an explicit path, else team.config.json beside this script. */
export function loadConfig(explicitPath, scriptDir = dirname(fileURLToPath(import.meta.url))) {
  const path = resolve(explicitPath ?? join(scriptDir, "team.config.json"));
  if (!existsSync(path)) {
    throw new Error(`no config at ${path}; copy team.config.example.json to team.config.json and edit it, or pass --config`);
  }
  return { config: normalizeConfig(JSON.parse(readFileSync(path, "utf8"))), path };
}

/** The label that puts an item in `role`'s queue. */
export const ownerLabel = (config, role) => (role === config.coordinatorRole ? config.coordinatorLabel : `owner:${role}`);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * A negative lookahead so `name` doesn't match the start of a longer configured name: "Dev" must not match
 * "Dev 2" (or "Dev2"), "QA" not "QA 2", "Dev" not "DevOps". Empty when no other name extends this one.
 */
export function notOtherRole(name, allNames) {
  const parts = allNames.filter((other) => other !== name && other.startsWith(name)).map((other) => {
    const suffix = other.slice(name.length);
    const lead = /^\s/.test(suffix) ? "\\s?" : "";
    return `${lead}${escapeRe(suffix.trimStart())}(?!\\w)`;
  });
  return parts.length ? `(?!${parts.join("|")})` : "";
}

/** The three regexes that relate a comment to one role. */
export function roleRegexes(config, role) {
  const names = Object.values(config.roles);
  const name = escapeRe(config.roles[role]);
  const not = notOtherRole(config.roles[role], names);
  const at = `@${escapeRe(role)}(?!\\w)`;
  return {
    // Signed: "Dev 2: …", "**QA** review of …", "> Reviewer: …".
    writtenBy: new RegExp(`^[\\s*#>_\`-]*${name}(?!\\w)${not}`),
    // Addressed: "→ Dev 2", "-> Dev 2", "… Dev 2: …" mid-text, "QA, …", "@dev2".
    addressedTo: new RegExp(`(?:^|[\\s>(*_-])${name}${not}\\*{0,2}\\s*[:,]|(?:→|->)\\s*\\**${name}(?!\\w)${not}|${at}`, "m"),
    // Handed over: arrows and mentions only. "QA: …" at the start is the author signing, not an address.
    handedTo: new RegExp(`(?:→|->)\\s*\\**${name}(?!\\w)${not}|${at}`),
  };
}

/** How a comment relates to `role`, plus the label sets the turn logic needs. */
export function matchers(config, role) {
  if (!(role in config.roles)) throw new Error(`unknown role "${role}"`);
  const me = roleRegexes(config, role);
  const others = Object.keys(config.roles).filter((r) => r !== role).map((r) => roleRegexes(config, r));
  const own = ownerLabel(config, role);
  return {
    role,
    name: config.roles[role],
    writtenByMe: (body) => me.writtenBy.test(body ?? ""),
    addressedToMe: (body) => me.addressedTo.test(body ?? ""),
    handedToOther: (body) => others.some((o) => o.handedTo.test(body ?? "")),
    // Holds stop an item counting as actionable; your own queue label never holds your own item.
    holds: new Set(config.holdLabels.filter((l) => l !== own)),
    quiet: new Set(config.quietLabels.filter((l) => l !== own)),
    timerHolds: new Set(config.timerHoldLabels),
    priorityLabel: config.priorityLabel,
  };
}

/** @param {{ labels?: Array<string | { name: string }> }} item */
export const labelNames = (item) => (item.labels ?? []).map((l) => (typeof l === "string" ? l : l.name));

/** Issue numbers a PR title names ("#274 Reliable scheduler" → [274]). */
export function linkedIssues(title) {
  return [...(title ?? "").matchAll(/#(\d+)\b/g)].map((m) => Number(m[1]));
}

/** "Next read 2026-10-25T16:00Z" / "Next check 2026-10-26 14:24Z": when a scheduled check is due (ms), else null. */
export function snoozedUntil(body) {
  const m = /\bnext (?:read|check)\b[^0-9\n]{0,12}(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::\d{2})?\s*Z/i.exec(body ?? "");
  const t = m ? Date.parse(`${m[1]}T${m[2]}Z`) : NaN;
  return Number.isNaN(t) ? null : t;
}

/**
 * When your OWN last word schedules a read ("Next read <ISO>Z"), its due time (ms), else null. Someone else's
 * time never schedules you. The timer survives holds like `blocked` (a timed read often waits on the outside
 * world) but not timerHoldLabels (`waiting-owner`, `parked`, `later`): only a person lifts those.
 */
export function scheduledRead(lastBody, m, labels = []) {
  if (lastBody == null || !m.writtenByMe(lastBody) || labels.some((l) => m.timerHolds.has(l))) return null;
  return snoozedUntil(lastBody);
}

/**
 * True when an owned item's ball is in your court. Order matters:
 * 1. your own scheduled read decides alone: quiet until due, then yours (even if `blocked`);
 * 2. quiet labels (`waiting-owner`, `blocked`, `parked`, `later`) keep it quiet, even when a reply names you;
 * 3. nobody spoke yet: yours;
 * 4. your own last word: still yours unless it handed the item to another role ("→ QA");
 * 5. addressed to you: yours;
 * 6. co-owned item (two or more owner: labels): an un-arrowed FYI is not every owner's turn;
 * 7. anyone else's last word: yours unless it handed the item to another role.
 */
export function waitingOnMe(lastBody, m, labels = [], now = Date.now()) {
  const due = scheduledRead(lastBody, m, labels);
  if (due !== null) return now >= due;
  if (labels.some((l) => m.quiet.has(l))) return false;
  if (lastBody == null) return true;
  if (m.writtenByMe(lastBody)) return !m.handedToOther(lastBody);
  if (m.addressedToMe(lastBody)) return true;
  if (labels.filter((l) => l.startsWith("owner:")).length > 1) return false;
  return !m.handedToOther(lastBody);
}

/** Owned items whose last word the backlog scan must read: timerHoldLabels can't be lifted by a time, so skip them. */
export function backlogReads(items, m) {
  return items.filter((i) => !labelNames(i).some((n) => m.timerHolds.has(n)));
}

/**
 * The owned items that stop you waiting: everything in your queue except held items and scheduled reads not yet
 * due (`snoozed`). A due read (`due`) lifts any hold that isn't a timer hold. A co-owned item counts only when it
 * is your turn (`myTurn`). Your turns first, then the priority label, then oldest.
 */
export function actionableOwned(items, m, { snoozed = new Set(), myTurn = new Set(), due = new Set() } = {}) {
  const rank = (i) => (myTurn.has(i.number) ? 0 : m.priorityLabel && labelNames(i).includes(m.priorityLabel) ? 1 : 2);
  return items
    .filter((i) => {
      const names = labelNames(i);
      const held = (n) => m.holds.has(n) && !(due.has(i.number) && !m.timerHolds.has(n));
      if (names.some(held) || snoozed.has(i.number)) return false;
      return names.filter((n) => n.startsWith("owner:")).length < 2 || myTurn.has(i.number);
    })
    .sort((a, b) => rank(a) - rank(b) || a.number - b.number);
}

/**
 * Unclaimed, briefed issues in the role's lane: `readyLabel` + laneOf[role], no owner: label, no hold, not
 * declined by this role (`declined:<role>`). Priority label first, then oldest; at most `max`.
 */
export function readyPool(issues, config, role, max = 1) {
  const lane = config.laneOf?.[role];
  if (!lane) return [];
  const m = matchers(config, role);
  const pri = (i) => Number(Boolean(config.priorityLabel) && labelNames(i).includes(config.priorityLabel));
  return issues
    .filter((i) => {
      const names = labelNames(i);
      return !i.pull_request && names.includes(config.readyLabel) && names.includes(lane)
        && !names.some((n) => n.startsWith("owner:") || n === config.coordinatorLabel || m.holds.has(n) || n === `declined:${role}`);
    })
    .sort((a, b) => pri(b) - pri(a) || a.number - b.number)
    .slice(0, max);
}

/** A comment that is not a word from the team: bot accounts (when ignoreBots) and configured marker prefixes. */
export function isNoise(comment, config) {
  const body = comment?.body ?? "";
  if (config.ignoreBots && comment?.user?.type === "Bot") return true;
  return (config.ignoreMarkers ?? []).some((marker) => body.startsWith(marker));
}

/** Comments created since the wait began; `?since=` filters on updated_at, so edits would otherwise look new. */
export function freshComments(comments, since) {
  return (comments ?? []).filter((c) => (c.created_at ?? "") >= since);
}

/** The latest word on an item across issue comments and PR reviews (empty-bodied reviews and noise left out). */
export function latestWord(comments = [], reviews = [], noise = () => false) {
  const words = [
    ...comments.filter((c) => !noise(c)).map((c) => ({ body: c.body ?? "", at: c.created_at, url: c.html_url })),
    ...reviews.filter((r) => (r.body ?? "").trim() && !noise(r)).map((r) => ({ body: r.body, at: r.submitted_at, url: r.html_url })),
  ].filter((w) => w.at).sort((a, b) => a.at.localeCompare(b.at));
  return words.at(-1) ?? null;
}

const PAGE = 100;

/**
 * The latest word on one item. GitHub lists issue comments oldest first, so read the page holding the newest
 * comment (from the item's `comments` count), keep reading while a page is full (a comment may land after the
 * count), then step back a page at a time while nothing read is a word (deletions, bot-only pages).
 */
export async function lastWordOn(api, repo, item, noise = () => false) {
  const read = async (path, page) => (await api(`${path}?per_page=${PAGE}&page=${page}`)) ?? [];
  const pages = async (path, first, counts) => {
    let page = first;
    let rows = await read(path, page);
    let all = rows;
    while (rows.length === PAGE) { rows = await read(path, ++page); all = all.concat(rows); }
    for (let back = first - 1; back >= 1 && !all.some(counts); back--) all = (await read(path, back)).concat(all);
    return all;
  };
  const comments = item.comments === 0 ? []
    : await pages(`repos/${repo}/issues/${item.number}/comments`, Math.max(1, Math.ceil((item.comments ?? 1) / PAGE)), (c) => !noise(c));
  const reviews = item.pull_request ? await pages(`repos/${repo}/pulls/${item.number}/reviews`, 1, () => true) : [];
  return latestWord(comments, reviews, noise);
}

/**
 * Startup / due-time scan of your queue: whose turn each owned item is, its timed reads and the earliest future
 * read (`nextDue`, ms or Infinity) so the wait loop can rescan exactly when one comes due.
 */
export async function scanBacklog(items, { api, repo, m, noise = () => false, now = Date.now() }) {
  const snoozed = new Set();
  const myTurn = new Set();
  const dueNow = new Set();
  const turns = [];
  let nextDue = Infinity;
  for (const item of backlogReads(items, m)) {
    const last = await lastWordOn(api, repo, item, noise);
    const labels = labelNames(item);
    const due = scheduledRead(last?.body ?? null, m, labels);
    if (due !== null) {
      if (now < due) { snoozed.add(item.number); nextDue = Math.min(nextDue, due); } else dueNow.add(item.number);
    }
    if (waitingOnMe(last?.body ?? null, m, labels, now)) { myTurn.add(item.number); turns.push({ item, last }); }
  }
  return { snoozed, myTurn, dueNow, turns, nextDue };
}

/** How far back a restarted waiter looks for comments addressed to it between runs. */
export const HANDOFF_LOOKBACK_MS = 24 * 3_600_000;
/** The saved poll cursor trails the request by this much, so clock skew can't drop a comment (ids dedupe). */
export const CURSOR_SKEW_MS = 120_000;
export const issueOf = (comment) => Number((comment.issue_url ?? "").split("/").pop());

/**
 * Comments addressed to you that landed between two waiter runs on items you don't own (owned items are the
 * backlog scan's job). Window: [saved cursor, this run's start), at most a day back. Reported ids never repeat.
 */
export function missedHandoffs(comments, { cursor, since, ids = new Set(), owned = new Set(), m, noise = () => false }) {
  if (!cursor) return [];
  const from = new Date(Math.max(Date.parse(cursor), Date.parse(since) - HANDOFF_LOOKBACK_MS)).toISOString();
  return comments.filter((c) => {
    const body = c.body ?? "";
    const at = c.created_at ?? "";
    return at >= from && at < since && !ids.has(c.id) && !owned.has(issueOf(c)) && !noise(c)
      && !m.writtenByMe(body) && m.addressedToMe(body);
  }).sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
}

/** Repo-wide comments created at or after `from`, newest first, at most `maxPages` pages. */
export async function commentsSince(api, repo, from, maxPages = 5) {
  const comments = [];
  for (let page = 1; page <= maxPages; page++) {
    const rows = (await api(`repos/${repo}/issues/comments?since=${from}&sort=created&direction=desc&per_page=${PAGE}&page=${page}`)) ?? [];
    comments.push(...rows);
    if (rows.length < PAGE || (rows.at(-1)?.created_at ?? "") < from) return { comments, complete: true };
  }
  return { comments, complete: false };
}

/**
 * One poll's comment verdicts. `comments` are fresh repo comments (any order). Per item, only the newest word
 * counts: on an item you own it must be someone else's and your turn (waitingOnMe); on a PR whose title names
 * an issue you own it must not hand the PR to another role; anywhere else it must address you.
 * Returns [{ comment, why }] oldest first.
 */
export function commentWork(comments, { m, owned, prTitles = new Map(), noise = () => false, now = Date.now() }) {
  const ownedNumbers = new Map(owned.map((i) => [i.number, i]));
  const ownedSet = new Set(ownedNumbers.keys());
  const newest = new Map();
  const hits = [];
  for (const c of [...comments].sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""))) {
    if (noise(c)) continue;
    const n = issueOf(c);
    newest.set(n, c);
    const body = c.body ?? "";
    // Addressed to you on an item you don't own wakes you even if a later comment followed it.
    if (!ownedSet.has(n) && !m.writtenByMe(body) && m.addressedToMe(body)) hits.push({ comment: c, why: "addressed to you" });
  }
  for (const [n, c] of newest) {
    const body = c.body ?? "";
    if (m.writtenByMe(body) || hits.some((h) => h.comment === c)) continue;
    if (ownedSet.has(n)) {
      if (waitingOnMe(body, m, labelNames(ownedNumbers.get(n)), now)) hits.push({ comment: c, why: "on your item" });
    } else if (linkedIssues(prTitles.get(n)).some((x) => ownedSet.has(x)) && !m.handedToOther(body)) {
      hits.push({ comment: c, why: "on a PR for your issue" });
    }
  }
  return hits.sort((a, b) => (a.comment.created_at ?? "").localeCompare(b.comment.created_at ?? ""));
}

/** One line from the role-cards table `| **Role** | Owns | Hands off |` ("Same as X" resolves to X's column). */
export function roleCard(markdown, name) {
  const rows = {};
  for (const line of (markdown ?? "").split("\n")) {
    const m = /^\|\s*\*\*([^*]+)\*\*\s*\|([^|]*)\|([^|]*)\|/.exec(line);
    if (m) rows[m[1].trim()] = { owns: m[2].trim(), handsOff: m[3].trim() };
  }
  const row = rows[name];
  if (!row) return null;
  const same = /^Same as (.+)$/.exec(row.handsOff);
  const handsOff = same && rows[same[1].trim()] ? rows[same[1].trim()].handsOff : row.handsOff;
  return `${name} owns: ${row.owns}. Hand off: ${handsOff}`;
}

/** Your row (exact first cell, not a prefix) and the "Everyone" row from the board issue's table. */
export function boardRow(markdown, name) {
  const rows = new Map();
  for (const line of (markdown ?? "").split("\n")) {
    const m = /^\|\s*([^|]+?)\s*\|(.*)\|\s*$/.exec(line);
    if (m) rows.set(m[1].replace(/\*/g, "").trim(), m[2].trim());
  }
  const out = ["Everyone", name].filter((w) => rows.has(w)).map((w) => `${w}: ${rows.get(w)}`);
  return out.length ? out.join("\n") : null;
}

/** ms to add to the next poll from the last rate headers: until the reset when spent, double when low. */
export function rateBackoffMs({ remaining, reset }, pollMs, now = Date.now(), random = Math.random) {
  if (remaining <= 50) return Math.max(0, reset * 1000 - now) + 5_000 + Math.floor(random() * 30_000);
  if (remaining < 1_000) return pollMs * 2;
  return 0;
}

const parseResponse = (raw) => {
  const text = String(raw ?? "");
  const split = text.search(/\r?\n\r?\n/);
  const head = split < 0 ? text : text.slice(0, split);
  const body = split < 0 ? "" : text.slice(split).replace(/^\r?\n\r?\n/, "");
  const [statusLine, ...lines] = head.split(/\r?\n/);
  const headers = {};
  for (const line of lines) {
    const at = line.indexOf(":");
    if (at > 0) headers[line.slice(0, at).trim().toLowerCase()] = line.slice(at + 1).trim();
  }
  return { status: Number(statusLine.split(" ")[1]) || 0, headers, body };
};

/**
 * A `gh api` GET client for a shared login: revalidates with ETags (a 304 doesn't spend the 5,000/hour budget),
 * waits out 403/429 rate limits (Retry-After or x-ratelimit-reset, plus jitter) instead of crashing, and slows
 * polling from the rate headers it already has. `sleep` is injected so the caller can stop at its deadline.
 * @param {{ request: (args: string[]) => string, sleep?: (ms: number) => Promise<void>, now?: () => number, warn?: (line: string) => void, random?: () => number }} options
 */
export function createGitHubApi({
  request,
  sleep = (ms) => new Promise((done) => setTimeout(done, ms)),
  now = () => Date.now(),
  warn = (line) => console.error(line),
  random = Math.random,
}) {
  const cache = new Map();
  let rate = null;
  async function get(path) {
    for (let attempt = 1; ; attempt++) {
      const cached = cache.get(path);
      const args = ["api", "--include", path, ...(cached ? ["-H", `If-None-Match: ${cached.etag}`] : [])];
      let raw;
      // gh exits non-zero on 304 and on errors; with --include the response is still on stdout.
      try { raw = request(args); } catch (error) {
        if (!error?.stdout) throw error;
        raw = error.stdout;
      }
      const { status, headers, body } = parseResponse(raw);
      if (headers["x-ratelimit-remaining"] !== undefined) {
        rate = { remaining: Number(headers["x-ratelimit-remaining"]), reset: Number(headers["x-ratelimit-reset"]) || 0 };
      }
      if (status === 304 && cached) return cached.data;
      if (status >= 200 && status < 300) {
        const data = body.trim() ? JSON.parse(body) : null;
        if (headers.etag) cache.set(path, { etag: headers.etag, data });
        else cache.delete(path);
        return data;
      }
      let message = `HTTP ${status}`;
      try { message = JSON.parse(body).message || message; } catch { /* not JSON */ }
      const limited = status === 429 || (status === 403 && (headers["x-ratelimit-remaining"] === "0"
        || headers["retry-after"] !== undefined || /rate limit/i.test(message)));
      if (!limited) throw new Error(`${message} (HTTP ${status}, ${path})`);
      const retryAfter = headers["retry-after"];
      const retryMs = retryAfter === undefined ? 0
        : /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - now();
      const resetMs = headers["x-ratelimit-remaining"] === "0" ? Number(headers["x-ratelimit-reset"]) * 1000 - now() + 5_000 : 0;
      const hints = [retryMs, resetMs].filter((ms) => Number.isFinite(ms) && ms > 0);
      const wait = (hints.length ? Math.max(...hints) : Math.min(60_000 * 2 ** (attempt - 1), 900_000)) + Math.floor(random() * 30_000);
      warn(`GitHub rate limit (HTTP ${status}); waiting ${Math.ceil(wait / 1000)} s before retrying.`);
      await sleep(wait);
    }
  }
  return { get, pollDelay: (pollMs) => pollMs + (rate ? rateBackoffMs(rate, pollMs, now(), random) : 0) };
}

const brief = (text) => String(text ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
const slug = (s) => s.replace(/[^\w.-]+/g, "_");

/** Runs the waiter. Never returns: it always ends with process.exit(code). */
export async function main(argv = process.argv.slice(2)) {
  let values;
  try {
    ({ values } = parseArgs({
      args: argv,
      options: {
        me: { type: "string" },
        "max-min": { type: "string", default: "30" },
        "poll-sec": { type: "string", default: "300" },
        config: { type: "string" },
        probe: { type: "boolean", default: false },
        force: { type: "boolean", default: false },
        since: { type: "string" },
        help: { type: "boolean", short: "h", default: false },
      },
    }));
  } catch (error) {
    console.error(`${error.message}\n\n${USAGE}`);
    process.exit(EXIT.USAGE);
  }
  if (values.help) { console.log(USAGE); process.exit(0); }

  let config;
  try { ({ config } = loadConfig(values.config)); } catch (error) {
    console.error(`wait-for-work: ${error.message}`);
    process.exit(EXIT.USAGE);
  }
  const role = values.me;
  if (!role || !(role in config.roles)) {
    console.error(`--me must be one of: ${Object.keys(config.roles).join(", ")}\n\n${USAGE}`);
    process.exit(EXIT.USAGE);
  }
  const maxMin = Number(values["max-min"]);
  const pollSec = Number(values["poll-sec"]);
  if (!Number.isFinite(maxMin) || maxMin < 0 || !Number.isFinite(pollSec)) {
    console.error(`--max-min and --poll-sec must be numbers\n\n${USAGE}`);
    process.exit(EXIT.USAGE);
  }
  const probe = values.probe;
  if (values.since !== undefined && Number.isNaN(Date.parse(values.since))) {
    console.error(`--since must be an ISO time\n\n${USAGE}`);
    process.exit(EXIT.USAGE);
  }
  const repo = config.repo;
  const name = config.roles[role];
  const label = ownerLabel(config, role);
  const m = matchers(config, role);
  const noise = (c) => isNoise(c, config);

  // One waiter per role and repo; a second copy exits instead of piling up. WAIT_FOR_WORK_STATE_DIR moves the
  // lock and state files (tests use it); the default is the OS temp dir.
  const stateDir = process.env.WAIT_FOR_WORK_STATE_DIR || tmpdir();
  const base = join(stateDir, `wait-for-work-${slug(repo)}-${role}`);
  const lock = `${base}.pid`;
  const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (error) { return error?.code === "EPERM"; } };
  const holder = Number.parseInt((() => { try { return readFileSync(lock, "utf8"); } catch { return ""; } })(), 10);
  if (Number.isInteger(holder) && holder !== process.pid && alive(holder)) {
    console.error(`Another waiter for ${name} is already running (pid ${holder}). Not starting a second one.`);
    process.exit(EXIT.LOCKED);
  }
  if (!probe) {
    writeFileSync(lock, String(process.pid));
    process.on("exit", () => { try { if (readFileSync(lock, "utf8") === String(process.pid)) rmSync(lock); } catch { /* gone */ } });
  }
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(signal, () => process.exit(130));

  // The chat that started us is gone once we (or a wrapping `bash -c`) are re-parented to init/launchd.
  const parent = process.ppid;
  const parentOf = (pid) => {
    try { return Number.parseInt(execFileSync("ps", ["-o", "ppid=", "-p", String(pid)], { encoding: "utf8" }).trim(), 10); } catch { return null; }
  };
  const exitIfOrphaned = () => {
    if (probe) return;
    if (process.ppid !== parent || process.ppid === 1 || !alive(parent) || parentOf(parent) === 1) {
      console.log("The chat that started this waiter is gone; exiting.");
      process.exit(EXIT.ORPHANED);
    }
  };

  const since = values.since ? new Date(values.since).toISOString() : new Date().toISOString();
  // A probe is one read-only pass: it never waits.
  const deadline = Date.now() + (probe ? 0 : maxMin) * 60_000;
  const pollMs = Math.max(30, pollSec) * 1000;
  // Chats started without a login shell may lack Homebrew's bin on PATH.
  const env = { ...process.env, PATH: [process.env.PATH, "/opt/homebrew/bin", "/usr/local/bin"].filter(Boolean).join(":") };
  const gh = createGitHubApi({
    // WAIT_FOR_WORK_GH swaps the gh binary (tests use it to stay offline).
    request: (args) => execFileSync(process.env.WAIT_FOR_WORK_GH || "gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 32 * 1024 * 1024, env }),
    // Rate-limit backoff never runs past the deadline and still notices a dead parent.
    sleep: async (ms) => {
      const until = Date.now() + ms;
      while (Date.now() < until) {
        exitIfOrphaned();
        if (Date.now() >= deadline) {
          console.error("Deadline reached during GitHub rate-limit backoff; run the waiter again after the reset.");
          process.exit(EXIT.TIMEOUT);
        }
        await new Promise((done) => setTimeout(done, Math.max(1, Math.min(5_000, until - Date.now(), deadline - Date.now()))));
      }
    },
  });
  const api = (path) => gh.get(path);
  const owned = async () => (await api(`repos/${repo}/issues?state=open&labels=${encodeURIComponent(label)}&per_page=100`)) ?? [];

  // Saved between runs: the comment cursor and ids already reported, so handoffs made while the chat was busy
  // are recovered once. Written atomically (write + rename) so a crash can't leave a torn file.
  const stateFile = `${base}.state.json`;
  const loadState = () => {
    try {
      const { cursor = null, handoffs = [] } = JSON.parse(readFileSync(stateFile, "utf8"));
      return { cursor, handoffs: new Set(handoffs) };
    } catch { return { cursor: null, handoffs: new Set() }; }
  };
  const state = loadState();
  const saveState = () => {
    if (probe) return;
    try {
      const tmp = `${stateFile}.${process.pid}`;
      writeFileSync(tmp, JSON.stringify({ cursor: state.cursor, handoffs: [...state.handoffs].slice(-300) }));
      renameSync(tmp, stateFile);
    } catch { /* best effort */ }
  };

  // Role card from the repo docs, board row from the board issue: GitHub and git are the memory.
  const repoRoot = (() => {
    try { return execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch {
      return resolve(dirname(fileURLToPath(import.meta.url)), "..");
    }
  })();
  const card = (() => { try { return roleCard(readFileSync(join(repoRoot, config.roleCardsPath), "utf8"), name); } catch { return null; } })();
  const printBoard = async () => {
    if (!config.boardIssue) return;
    try {
      const row = boardRow((await api(`repos/${repo}/issues/${config.boardIssue}`))?.body ?? "", name);
      if (row) console.log(`Board #${config.boardIssue} (your queue, in order):\n${row}`);
    } catch { /* the board is optional */ }
  };

  const report = (found, code = EXIT.WORK) => {
    saveState();
    console.log(`WORK for ${name} (${found.length}):\n- ${found.join("\n- ")}`);
    process.exit(code);
  };

  const describeTurn = ({ item, last }) => (last
    ? `#${item.number} is waiting on you: "${brief(last.body)}" ${last.url ?? ""}`.trim()
    : `#${item.number} is yours and not started: ${item.title}`);

  // ---- start-up ----
  if (card) console.log(`Role: ${card}`);
  await printBoard();
  let startItems;
  for (let attempt = 1; ; attempt++) {
    exitIfOrphaned();
    try { startItems = await owned(); break; } catch (error) {
      // A failed first read would make every owned item look newly labelled later.
      if (attempt >= 5) { console.error(`Cannot read your queue: ${error.message.split("\n")[0]}`); process.exit(1); }
      await new Promise((done) => setTimeout(done, attempt * 5_000));
    }
  }
  const startOwned = new Set(startItems.map((i) => i.number));
  console.log(startItems.length
    ? `In your queue (${label}): ${startItems.map((i) => `${i.pull_request ? "PR " : ""}#${i.number}`).join(", ")}`
    : `Nothing labelled ${label}.`);

  let recovered = [];
  let commitRecovered = () => {};
  try {
    const from = state.cursor ? new Date(Math.max(Date.parse(state.cursor), Date.parse(since) - HANDOFF_LOOKBACK_MS)).toISOString() : null;
    const { comments, complete } = from ? await commentsSince(api, repo, from) : { comments: [], complete: true };
    const missed = missedHandoffs(comments, { cursor: state.cursor, since, ids: state.handoffs, owned: startOwned, m, noise });
    recovered = missed.map((c) => `Addressed to you while the waiter was off, on #${issueOf(c)}: "${brief(c.body)}" ${c.html_url}`);
    commitRecovered = () => {
      for (const c of missed) state.handoffs.add(c.id);
      if (complete || !state.cursor) state.cursor = since;
    };
  } catch (error) {
    console.error(`Could not recover handoffs since the last run: ${error.message.split("\n")[0]}`);
  }

  let nextDue = Infinity;
  try {
    const scan = await scanBacklog(startItems, { api, repo, m, noise });
    nextDue = scan.nextDue;
    const turns = scan.turns.map(describeTurn);
    const actionable = actionableOwned(startItems, m, { snoozed: scan.snoozed, myTurn: scan.myTurn, due: scan.dueNow });
    commitRecovered();
    if (actionable.length && !values.force) {
      const top = actionable.slice(0, 3).map((item) => turns.find((line) => line.startsWith(`#${item.number} `))
        ?? `#${item.number} is yours: ${item.title} (work it, ship it, or move its label to whoever acts next)`);
      console.error(`Not waiting: ${name} owns ${actionable.length} actionable item(s). Work these first; label what you can't act on `
        + `(${[...m.holds].join(", ")}) or hand it off. --force waits anyway.`);
      report([...top, ...recovered], EXIT.OWNS_WORK);
    }
    if (values.force) {
      for (const line of turns) console.log(`(owned, --force) ${line}`);
      if (recovered.length) report(recovered);
    } else {
      if (turns.length || recovered.length) report([...turns, ...recovered]);
      const lane = config.laneOf?.[role];
      if (lane && !actionable.length) {
        const pool = readyPool(
          (await api(`repos/${repo}/issues?state=open&labels=${encodeURIComponent(`${config.readyLabel},${lane}`)}&per_page=100`)) ?? [],
          config, role, 1);
        for (const item of pool) {
          report([`#${item.number} from the ready pool (${lane}): ${item.title}. Claim it first: `
            + `gh issue edit ${item.number} -R ${repo} --add-label ${label} --remove-label ${config.readyLabel} `
            + `(or decline: --add-label declined:${role})`]);
        }
      }
    }
  } catch (error) {
    console.error(`Queue check failed, continuing: ${error.message.split("\n")[0]}`);
    commitRecovered();
    if (recovered.length) report(recovered);
  }
  commitRecovered();
  saveState();

  // ---- wait loop: one owned-items call + one repo-comments call per poll; more only when something changed ----
  let prTitlesCache = null;
  const prTitles = async () => {
    const pulls = (await api(`repos/${repo}/pulls?state=open&per_page=100`)) ?? [];
    prTitlesCache = new Map(pulls.map((p) => [p.number, p.title]));
    return prTitlesCache;
  };
  const prUpdated = new Map();
  async function poll() {
    const found = [];
    const polledAt = Date.now();
    const mine = await owned();
    const mineSet = new Set(mine.map((i) => i.number));
    for (const item of mine) if (!startOwned.has(item.number)) found.push(`#${item.number} is now labelled ${label}: ${item.title}`);

    const comments = freshComments(await api(`repos/${repo}/issues/comments?since=${since}&sort=created&direction=desc&per_page=100`), since)
      .filter((c) => !state.handoffs.has(c.id));
    // PR titles are only needed when a comment landed on an item that isn't yours.
    const titles = comments.some((c) => !mineSet.has(issueOf(c))) ? await prTitles() : (prTitlesCache ?? new Map());
    const hits = commentWork(comments, { m, owned: mine, prTitles: titles, noise });
    for (const { comment, why } of hits) {
      found.push(`#${issueOf(comment)} new comment (${why}): "${brief(comment.body)}" ${comment.html_url}`);
      if (why === "addressed to you") state.handoffs.add(comment.id);
    }

    // Reviews (verdicts) on your own PRs, read only when the PR changed since the last poll.
    for (const pr of mine.filter((i) => i.pull_request && i.updated_at >= since && prUpdated.get(i.number) !== i.updated_at)) {
      prUpdated.set(pr.number, pr.updated_at);
      for (const review of (await api(`repos/${repo}/pulls/${pr.number}/reviews?per_page=100`)) ?? []) {
        const body = review.body ?? "";
        if (!body.trim() || !review.submitted_at || review.submitted_at < since || noise(review) || m.writtenByMe(body)) continue;
        found.push(`#${pr.number} new review (${review.state}): "${brief(body)}" ${review.html_url}`);
      }
    }

    // A scheduled read of yours came due.
    if (Date.now() >= nextDue) {
      const scan = await scanBacklog(mine, { api, repo, m, noise });
      nextDue = scan.nextDue;
      for (const turn of scan.turns.filter((t) => scan.dueNow.has(t.item.number))) found.push(describeTurn(turn));
    }
    // Move the cursor only after the whole poll succeeded, so a failed read loses nothing.
    state.cursor = new Date(Math.max(Date.parse(since), polledAt - CURSOR_SKEW_MS)).toISOString();
    return found;
  }

  if (!probe) console.log(`Waiting for work for ${name} since ${since} (up to ${maxMin} min, polling every ${Math.round(pollMs / 1000)} s)...`);
  let warned = false;
  while (Date.now() < deadline) {
    exitIfOrphaned();
    try {
      const found = await poll();
      if (found.length) report(found);
      saveState();
    } catch (error) {
      if (!warned) console.error(`gh api failed, will keep polling: ${error.message.split("\n")[0]}`);
      warned = true;
    }
    const delay = Math.min(gh.pollDelay(pollMs), deadline - Date.now());
    // Sleep in short slices so a dead parent is noticed within seconds, not after a whole poll interval.
    const until = Date.now() + Math.max(0, delay);
    while (Date.now() < until) {
      exitIfOrphaned();
      await new Promise((done) => setTimeout(done, Math.max(1, Math.min(5_000, until - Date.now()))));
    }
  }
  if (!values.force && !probe) {
    try {
      const scan = await scanBacklog(await owned(), { api, repo, m, noise });
      if (scan.turns.length) report(scan.turns.map(describeTurn));
    } catch { /* fall through to the timeout */ }
  }
  saveState();
  console.log(`No new work for ${name} in ${probe ? 0 : maxMin} min. Take the next item on your board row, then run this waiter again.`);
  process.exit(EXIT.TIMEOUT);
}

const invokedDirectly = (() => {
  try { return Boolean(process.argv[1]) && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; }
})();
if (invokedDirectly) await main();
