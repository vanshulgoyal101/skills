import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  actionableOwned, backlogReads, boardRow, commentWork, createGitHubApi, freshComments, lastWordOn, linkedIssues,
  matchers, missedHandoffs, normalizeConfig, notOtherRole, ownerLabel, rateBackoffMs, readyPool, roleCard,
  scanBacklog, scheduledRead, snoozedUntil, waitingOnMe, isNoise, EXIT,
} from "./wait-for-work.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, "wait-for-work.mjs");

const config = normalizeConfig({
  repo: "acme/widgets",
  boardIssue: 1,
  roles: { ceo: "CEO", cto: "CTO", dev: "Dev", dev2: "Dev 2", qa: "QA", qa2: "QA 2", reviewer: "Reviewer", devops: "DevOps" },
  coordinatorRole: "ceo",
  priorityLabel: "core",
  laneOf: { dev: "lane:dev", dev2: "lane:dev", qa: "lane:qa" },
});
const labels = (...names) => names.map((name) => ({ name }));
const issue = (number, ...names) => ({ number, title: `Item ${number}`, labels: labels(...names) });

describe("config", () => {
  it("fills defaults and rejects what the waiter can't use", () => {
    assert.equal(config.readyLabel, "ready");
    assert.deepEqual(config.timerHoldLabels, ["waiting-owner", "parked", "later"]);
    assert.throws(() => normalizeConfig({ repo: "owner/name", roles: { dev: "Dev" } }), /repo/);
    assert.throws(() => normalizeConfig({ repo: "a/b", roles: {} }), /roles/);
    assert.throws(() => normalizeConfig({ repo: "a/b", roles: { Dev: "Dev" } }), /lower-case/);
    assert.throws(() => normalizeConfig({ repo: "a/b", roles: { dev: "Dev" }, coordinatorRole: "ceo" }), /coordinatorRole/);
  });
  it("gives the coordinator its own queue label", () => {
    assert.equal(ownerLabel(config, "ceo"), "decision");
    assert.equal(ownerLabel(config, "dev2"), "owner:dev2");
  });
});

describe("role names never match a longer role name", () => {
  const dev = matchers(config, "dev");
  const dev2 = matchers(config, "dev2");
  const qa = matchers(config, "qa");
  const devops = matchers(config, "devops");

  it("builds lookaheads only for configured longer names", () => {
    assert.equal(notOtherRole("CTO", Object.values(config.roles)), "");
    assert.match("Dev", new RegExp(`^Dev${notOtherRole("Dev", ["Dev", "Dev 2"])}`));
    assert.doesNotMatch("Dev 2", new RegExp(`^Dev${notOtherRole("Dev", ["Dev", "Dev 2"])}`));
    assert.doesNotMatch("Dev2", new RegExp(`^Dev${notOtherRole("Dev", ["Dev", "Dev 2"])}`));
  });
  it("keeps Dev distinct from Dev 2 and DevOps, QA from QA 2", () => {
    assert.equal(dev.writtenByMe("Dev 2: slice 3 is finished"), false);
    assert.equal(dev.writtenByMe("DevOps: released"), false);
    assert.equal(dev.writtenByMe("Dev: slice 3 is finished"), true);
    assert.equal(dev2.writtenByMe("**Dev 2**: ready at abc1234"), true);
    assert.equal(dev2.writtenByMe("> Dev 2 (helper): ready"), true);
    assert.equal(qa.writtenByMe("QA 2: read at 10:00Z"), false);
    assert.equal(devops.writtenByMe("DevOps: done"), true);
    assert.equal(waitingOnMe("CTO: → Dev 2: yours now.", dev), false);
    assert.equal(waitingOnMe("CTO: → DevOps: clear the claim.", dev), false);
    assert.equal(waitingOnMe("CTO: → Dev: yours, queue #1.", dev), true);
    assert.equal(waitingOnMe("CTO: → QA 2: walk the run.", qa), false);
    assert.equal(waitingOnMe("Dev: → QA: red test please.", matchers(config, "qa2")), false);
  });
  it("recognises arrows, mid-text names and @mentions as addresses; only arrows and mentions as handoffs", () => {
    assert.equal(qa.addressedToMe("Ready at abc1234 → QA"), true);
    assert.equal(qa.addressedToMe("Ready at abc1234 -> **QA**: review"), true);
    assert.equal(qa.addressedToMe("Merged. QA: please walk it."), true);
    assert.equal(qa.addressedToMe("cc @qa"), true);
    assert.equal(qa.addressedToMe("cc @qa2"), false);
    assert.equal(qa.addressedToMe("the QA 2 lane"), false);
    const reviewer = matchers(config, "reviewer");
    assert.equal(reviewer.handedToOther("QA: done"), false);
    assert.equal(reviewer.handedToOther("Dev: → QA: done"), true);
    assert.equal(reviewer.handedToOther("Dev: done, @qa"), true);
  });
  it("escapes regex characters in role names", () => {
    const odd = normalizeConfig({ repo: "a/b", roles: { lead: "Lead (A+)", dev: "Dev" } });
    assert.equal(matchers(odd, "lead").writtenByMe("Lead (A+): ok"), true);
    assert.equal(matchers(odd, "lead").writtenByMe("Lead AA: ok"), false);
  });
});

describe("whose turn: waitingOnMe", () => {
  const devops = matchers(config, "devops");
  const dev2 = matchers(config, "dev2");
  it("wakes the owner when someone else spoke last without handing off elsewhere, or nobody spoke", () => {
    assert.equal(waitingOnMe("QA verdict at d44e9c4: **approved**.", devops), true);
    assert.equal(waitingOnMe(null, devops), true);
  });
  it("wakes the owner when addressed, even alongside another role", () => {
    assert.equal(waitingOnMe("CTO review: **approved**. → DevOps: release once QA names d44e9c4.", devops), true);
  });
  it("stays quiet on your own handoff or a handoff to someone else", () => {
    assert.equal(waitingOnMe("DevOps: → QA: ready at adbc563.", devops), false);
    assert.equal(waitingOnMe("QA: approved at e1f423c. → CTO: review.", devops), false);
  });
  it("resumes your own progress note without a handoff", () => {
    assert.equal(waitingOnMe("Dev 2: #537 is merged; #538 next.", dev2), true);
    assert.equal(waitingOnMe("Dev 2: ready at e34663c. → QA: review.", dev2), false);
  });
  it("quiet labels stay quiet, even when a reply names you; other holds don't silence a reply", () => {
    assert.equal(waitingOnMe("CEO: please submit", devops, ["waiting-owner"]), false);
    assert.equal(waitingOnMe("Reviewer: → Dev 2: fix it.", dev2, ["later", "owner:dev2"]), false);
    assert.equal(waitingOnMe("CEO: → Dev 2: decide by noon.", dev2, ["decision", "owner:dev2"]), true);
  });
  it("on a co-owned item an un-arrowed FYI isn't every owner's turn; one that names you is", () => {
    const both = ["owner:dev2", "owner:qa"];
    assert.equal(waitingOnMe("CTO: FYI the API changed.", dev2, both), false);
    assert.equal(waitingOnMe("CTO: → Dev 2: the API changed.", dev2, both), true);
  });
});

describe("scheduled reads: Next read <ISO>Z", () => {
  const qa2 = matchers(config, "qa2");
  const dev2 = matchers(config, "dev2");
  const body = "QA 2: read at 10:57Z: safe. Next read 2026-10-25T16:00Z; final report after Oct 26.";
  it("parses both spellings and rejects vague times", () => {
    assert.equal(snoozedUntil(body), Date.parse("2026-10-25T16:00Z"));
    assert.equal(snoozedUntil("QA 2: next check 2026-10-26 14:24Z"), Date.parse("2026-10-26T14:24Z"));
    assert.equal(snoozedUntil("QA 2: Next read ~16:00Z"), null);
  });
  it("keeps your own read quiet until due, then wakes you; someone else's time never schedules you", () => {
    assert.equal(waitingOnMe(body, qa2, [], Date.parse("2026-10-25T11:00Z")), false);
    assert.equal(waitingOnMe(body, qa2, [], Date.parse("2026-10-25T16:01Z")), true);
    assert.equal(waitingOnMe("Dev: → QA 2: gates please. Next read 2026-10-25T16:00Z.", qa2, [], Date.parse("2026-10-25T11:00Z")), true);
  });
  it("a timed read survives `blocked`, even when it also handed something on; timer holds cancel it", () => {
    const read = "Dev 2: backup ran. → CEO: #14. Next read 2026-11-02T08:45Z.";
    const at = (t) => Date.parse(`2026-11-02T${t}Z`);
    assert.equal(waitingOnMe(read, dev2, ["blocked"], at("08:00")), false);
    assert.equal(waitingOnMe(read, dev2, ["blocked"], at("08:45")), true);
    assert.equal(scheduledRead(read, dev2, ["blocked"]), at("08:45"));
    for (const hold of ["waiting-owner", "parked", "later"]) {
      assert.equal(scheduledRead(read, dev2, [hold]), null);
      assert.equal(waitingOnMe(read, dev2, [hold], at("09:00")), false);
    }
    assert.equal(waitingOnMe("Dev 2: waiting on the vendor.", dev2, ["blocked"], at("09:00")), false);
  });
  it("the backlog skips only items a time can't lift", () => {
    const items = [issue(1, "owner:dev2"), issue(2, "blocked"), issue(3, "waiting-owner"), issue(4, "parked"), issue(5, "later")];
    assert.deepEqual(backlogReads(items, dev2).map((i) => i.number), [1, 2]);
  });
});

describe("actionable owned items (exit 6)", () => {
  const dev2 = matchers(config, "dev2");
  it("drops held, snoozed and co-owned-not-your-turn items; your turns first, then priority, then oldest", () => {
    const items = [issue(9, "owner:dev2"), issue(8, "owner:dev2", "core"), issue(7, "owner:dev2", "parked"), issue(6, "owner:dev2", "decision"),
      issue(5, "owner:dev2", "owner:qa"), issue(4, "owner:dev2"), issue(3, "owner:dev2", "owner:qa"), issue(2, "owner:dev2", "standing")];
    const got = actionableOwned(items, dev2, { snoozed: new Set([4]), myTurn: new Set([9, 3]) }).map((i) => i.number);
    assert.deepEqual(got, [3, 9, 8]);
  });
  it("a due read lifts `blocked` but never a timer hold", () => {
    const items = [issue(1, "blocked"), issue(2, "blocked"), issue(3, "waiting-owner")];
    assert.deepEqual(actionableOwned(items, dev2, { due: new Set([2, 3]) }).map((i) => i.number), [2]);
    assert.deepEqual(actionableOwned(items, dev2).map((i) => i.number), []);
  });
  it("the coordinator's own queue label is not a hold for the coordinator", () => {
    const ceo = matchers(config, "ceo");
    assert.deepEqual(actionableOwned([issue(1, "decision")], ceo).map((i) => i.number), [1]);
    assert.deepEqual(actionableOwned([issue(1, "decision", "waiting-owner")], ceo).map((i) => i.number), []);
  });
});

describe("ready pool", () => {
  const pool = [issue(30, "ready", "lane:dev"), issue(20, "ready", "lane:dev", "core"), issue(10, "ready", "lane:dev", "owner:dev"),
    issue(11, "ready", "lane:dev", "later"), issue(12, "ready", "lane:dev", "declined:dev2"), issue(13, "ready", "lane:qa"),
    { ...issue(14, "ready", "lane:dev"), pull_request: {} }];
  it("offers the lane's unclaimed items, priority first, then oldest", () => {
    assert.deepEqual(readyPool(pool, config, "dev2", 5).map((i) => i.number), [20, 30]);
    assert.deepEqual(readyPool(pool, config, "dev", 5).map((i) => i.number), [20, 12, 30]);
    assert.deepEqual(readyPool(pool, config, "qa", 5).map((i) => i.number), [13]);
    assert.deepEqual(readyPool(pool, config, "cto"), []);
  });
});

describe("start-up cards", () => {
  const doc = "| Role | Owns | Hands off |\n| --- | --- | --- |\n| **Dev** | Features | → QA with a sha |\n| **Dev 2** | Features | Same as Dev |\n";
  it("reads the role card and resolves 'Same as'", () => {
    assert.equal(roleCard(doc, "Dev 2"), "Dev 2 owns: Features. Hand off: → QA with a sha");
    assert.equal(roleCard(doc, "QA"), null);
  });
  it("returns the exact board row plus Everyone, not a prefix match", () => {
    const board = "| Worker | Work |\n| --- | --- |\n| Everyone | When idle: wait. |\n| Dev | 1. #5 |\n| **Dev 2** | 1. #6 |\n";
    assert.equal(boardRow(board, "Dev"), "Everyone: When idle: wait.\nDev: 1. #5");
    assert.equal(boardRow(board, "Dev 2"), "Everyone: When idle: wait.\nDev 2: 1. #6");
    assert.equal(boardRow("no table", "Dev"), null);
  });
});

describe("poll verdicts", () => {
  const dev = matchers(config, "dev");
  const since = "2026-11-01T10:00:00Z";
  const c = (id, n, body, at, extra = {}) => ({ id, issue_url: `https://api.github.com/repos/acme/widgets/issues/${n}`, body, created_at: at, html_url: `u${id}`, ...extra });
  const owned = [issue(5, "owner:dev"), issue(6, "owner:dev", "owner:qa"), issue(7, "owner:dev", "later")];

  it("links PR titles to issues and keeps only comments created since the wait began", () => {
    assert.deepEqual(linkedIssues("#274 Reliable scheduler (#12)"), [274, 12]);
    assert.deepEqual(linkedIssues(undefined), []);
    assert.deepEqual(freshComments([{ created_at: "2026-11-01T09:00:00Z" }, { created_at: "2026-11-01T10:00:00Z" }], since).length, 1);
  });
  it("wakes on your item only when the newest word is someone else's and your turn", () => {
    const hits = commentWork([
      c(1, 5, "QA: looks wrong", "2026-11-01T10:01:00Z"),
      c(2, 6, "CTO: FYI", "2026-11-01T10:02:00Z"),
      c(3, 7, "CTO: → Dev: fix", "2026-11-01T10:03:00Z"),
    ], { m: dev, owned });
    assert.deepEqual(hits.map((h) => [h.comment.id, h.why]), [[1, "on your item"]]);
    assert.deepEqual(commentWork([c(1, 5, "QA: wrong", "2026-11-01T10:01:00Z"), c(2, 5, "Dev: fixed. → QA: again", "2026-11-01T10:02:00Z")], { m: dev, owned }), []);
  });
  it("wakes on an address anywhere, and on a PR whose title names your issue unless it was handed elsewhere", () => {
    const prTitles = new Map([[40, "#5 Fix the thing"], [41, "#99 Other"]]);
    const hits = commentWork([
      c(1, 30, "CTO: → Dev: look at this", "2026-11-01T10:01:00Z"),
      c(2, 40, "QA: failing test on line 3", "2026-11-01T10:02:00Z"),
      c(3, 41, "QA: failing", "2026-11-01T10:03:00Z"),
      c(4, 40, "QA: → Reviewer: yours", "2026-11-01T10:00:30Z"),
    ], { m: dev, owned, prTitles });
    assert.deepEqual(hits.map((h) => [h.comment.id, h.why]), [[1, "addressed to you"], [2, "on a PR for your issue"]]);
  });
  it("ignores bots and marker-prefixed posts", () => {
    const noisy = normalizeConfig({ ...config, ignoreMarkers: ["<!-- ai-review -->"] });
    assert.equal(isNoise({ body: "x", user: { type: "Bot" } }, noisy), true);
    assert.equal(isNoise({ body: "<!-- ai-review --> hi", user: { type: "User" } }, noisy), true);
    assert.equal(isNoise({ body: "QA: hi", user: { type: "User" } }, noisy), false);
    const hits = commentWork([c(1, 30, "→ Dev: deploy failed", "2026-11-01T10:01:00Z", { user: { type: "Bot" } })],
      { m: dev, owned, noise: (x) => isNoise(x, noisy) });
    assert.deepEqual(hits, []);
  });
  it("recovers an address on a non-owned item posted between runs, once, at most a day back", () => {
    const comments = [
      c(1, 30, "CTO: → Dev: please", "2026-11-01T09:00:00Z"),
      c(2, 5, "CTO: → Dev: owned item", "2026-11-01T09:01:00Z"),
      c(3, 31, "CTO: → Dev: after start", "2026-11-01T10:00:01Z"),
      c(4, 32, "CTO: → Dev: too old", "2026-10-30T09:00:00Z"),
    ];
    const args = { since, owned: new Set([5]), m: dev };
    assert.deepEqual(missedHandoffs(comments, { ...args, cursor: "2026-10-29T00:00:00Z" }).map((x) => x.id), [1]);
    assert.deepEqual(missedHandoffs(comments, { ...args, cursor: "2026-10-29T00:00:00Z", ids: new Set([1]) }), []);
    assert.deepEqual(missedHandoffs(comments, { ...args, cursor: null }), []);
  });
});

describe("reading the last word", () => {
  const dev = matchers(config, "dev");
  const fakeApi = (pages) => async (path) => pages[path] ?? [];
  it("reads the newest page from the count and steps back past a page of bot posts", async () => {
    const full = Array.from({ length: 100 }, (_, k) => ({ body: `QA: note ${k}`, created_at: `2026-11-01T09:${String(k % 60).padStart(2, "0")}:00Z` }));
    full[99] = { body: "Dev: → QA: ready. ", created_at: "2026-11-01T09:59:59Z" };
    const bots = [{ body: "deploy ok", created_at: "2026-11-01T11:00:00Z", user: { type: "Bot" } }];
    const api = fakeApi({
      "repos/acme/widgets/issues/5/comments?per_page=100&page=1": full,
      "repos/acme/widgets/issues/5/comments?per_page=100&page=2": bots,
    });
    const last = await lastWordOn(api, "acme/widgets", { number: 5, comments: 101 }, (x) => isNoise(x, config));
    assert.equal(last.body, "Dev: → QA: ready. ");
  });
  it("counts PR reviews as words and reports the earliest future read", async () => {
    const api = fakeApi({
      "repos/acme/widgets/issues/5/comments?per_page=100&page=1": [{ body: "Dev: Next read 2026-11-01T12:00Z", created_at: "2026-11-01T09:00:00Z" }],
      "repos/acme/widgets/issues/6/comments?per_page=100&page=1": [{ body: "Dev: started", created_at: "2026-11-01T09:00:00Z" }],
      "repos/acme/widgets/pulls/6/reviews?per_page=100&page=1": [{ body: "Reviewer review of abc1234: **approved**", submitted_at: "2026-11-01T09:30:00Z" }],
    });
    const items = [{ number: 5, comments: 1, labels: [] }, { number: 6, comments: 1, pull_request: {}, labels: [] }];
    const scan = await scanBacklog(items, { api, repo: "acme/widgets", m: dev, now: Date.parse("2026-11-01T10:00:00Z") });
    assert.deepEqual([...scan.snoozed], [5]);
    assert.equal(scan.nextDue, Date.parse("2026-11-01T12:00Z"));
    assert.deepEqual(scan.turns.map((t) => t.item.number), [6]);
  });
});

describe("shared GitHub budget", () => {
  const response = (status, headers, body) => `HTTP/2.0 ${status} X\n${Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${body}`;
  it("revalidates with the ETag and reuses the body on 304", async () => {
    const calls = [];
    const replies = [response(200, { etag: '"a"', "x-ratelimit-remaining": "4000" }, "[1]"), response(304, {}, "")];
    const gh = createGitHubApi({ request: (args) => { calls.push(args); const r = replies.shift(); if (r.includes(" 304 ")) throw Object.assign(new Error("304"), { stdout: r }); return r; } });
    assert.deepEqual(await gh.get("p"), [1]);
    assert.deepEqual(await gh.get("p"), [1]);
    assert.deepEqual(calls[1].slice(-2), ["-H", 'If-None-Match: "a"']);
  });
  it("waits out a 429 (Retry-After + jitter) and retries; throws on other 403s", async () => {
    const slept = [];
    const replies = [response(429, { "retry-after": "7" }, '{"message":"slow down"}'), response(200, {}, "{}")];
    const gh = createGitHubApi({ request: () => replies.shift(), sleep: async (ms) => { slept.push(ms); }, warn: () => {}, random: () => 0 });
    assert.deepEqual(await gh.get("p"), {});
    assert.deepEqual(slept, [7000]);
    const denied = createGitHubApi({ request: () => response(403, {}, '{"message":"Resource not accessible"}'), sleep: async () => assert.fail("no retry") });
    await assert.rejects(denied.get("p"), /Resource not accessible/);
  });
  it("slows polling from the headers it already has", () => {
    assert.equal(rateBackoffMs({ remaining: 4000, reset: 0 }, 300_000), 0);
    assert.equal(rateBackoffMs({ remaining: 500, reset: 0 }, 300_000), 600_000);
    assert.equal(rateBackoffMs({ remaining: 10, reset: 100 }, 300_000, 40_000, () => 0), 65_000);
  });
});

describe("command line", () => {
  // Lock, state and config live in a scratch dir beside the tests, removed afterwards.
  const dir = join(here, `.wait-for-work-test-${process.pid}`);
  const cfg = join(dir, "team.config.json");
  const env = { ...process.env, WAIT_FOR_WORK_STATE_DIR: dir, WAIT_FOR_WORK_GH: "false" };
  before(() => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(cfg, JSON.stringify({ repo: "acme/widgets", roles: { dev: "Dev", qa: "QA" } }));
  });
  after(() => rmSync(dir, { recursive: true, force: true }));
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: "utf8", env, timeout: 20_000 });

  it("--help prints usage and exits 0", () => {
    const r = run("--help");
    assert.equal(r.status, 0);
    assert.match(r.stdout, /Usage: node scripts\/wait-for-work\.mjs --me <role>/);
  });
  it("an unknown role, a bad flag or a missing config exits 2", () => {
    assert.equal(run("--me", "nobody", "--config", cfg).status, EXIT.USAGE);
    assert.equal(run("--bogus").status, EXIT.USAGE);
    assert.equal(run("--me", "dev", "--config", join(dir, "missing.json")).status, EXIT.USAGE);
  });
  it("a second waiter for the same role exits 4 before touching GitHub", () => {
    const lock = join(dir, "wait-for-work-acme_widgets-dev.pid");
    writeFileSync(lock, String(process.pid));
    try {
      const r = run("--me", "dev", "--config", cfg);
      assert.equal(r.status, EXIT.LOCKED);
      assert.match(r.stderr, /already running/);
      assert.equal(readFileSync(lock, "utf8"), String(process.pid));
    } finally { rmSync(lock, { force: true }); }
  });
  it("exits 5 and releases its lock when the chat that started it is gone", { skip: process.platform === "win32" }, async () => {
    const out = join(dir, "orphan.out");
    // The wrapping shell exits at once, so the waiter is re-parented: exactly what a closed chat looks like.
    const child = spawn("bash", ["-c", `{ "${process.execPath}" "${script}" --me qa --config "${cfg}" >"${out}" 2>&1; echo "exit=$?" >>"${out}"; } & exit 0`], { env, stdio: "ignore" });
    await new Promise((done) => child.on("exit", done));
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline && !(existsSync(out) && /exit=\d+/.test(readFileSync(out, "utf8")))) await new Promise((d) => setTimeout(d, 200));
    const text = readFileSync(out, "utf8");
    assert.match(text, /chat that started this waiter is gone/);
    assert.match(text, /exit=5/);
    assert.equal(existsSync(join(dir, "wait-for-work-acme_widgets-qa.pid")), false);
  });
});
