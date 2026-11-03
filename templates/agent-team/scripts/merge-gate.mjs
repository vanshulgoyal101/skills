#!/usr/bin/env node
// Required check for risky PRs. A PR whose changed files match gate.paths (Markdown ignored) can't merge until an
// approver role approves its CURRENT head commit, so a hold comment isn't needed to stop auto-merge: a missing
// approval does. Approval forms (first line of a PR comment or review body; sha = 7+ hex chars of the head):
//   QA review of 1a2b3c4: **approved**             (also "Reviewer re-review of …", "CTO review of old → 1a2b3c4: …")
//   a GitHub APPROVED review on the head commit whose body starts with an approver role name ("Reviewer: lgtm")
// The latest verdict per approver role on the head decides; "changes requested", "not approved" or a GitHub
// CHANGES_REQUESTED review from any approver holds the PR. A new push needs a new approval.
// The workflow runs this file from the default branch, so PR code never runs with the status token.
import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { loadConfig, roleRegexes } from "./wait-for-work.mjs";

export const USAGE = `Usage: node scripts/merge-gate.mjs --pr <number> [--dry-run] [--config path]

Sets the commit status gate.statusContext (default "merge-gate") on the PR's head commit:
  success  no changed file matches gate.paths, the PR is the deploy train (next → main) or a sync of main
           into next, or an approver role approved the current head;
  pending  otherwise, with who must approve.
  --dry-run  print the verdict, set nothing

Exit codes: 0 status set (or printed with --dry-run), 1 GitHub/API error, 2 usage or config error.`;

/** The changed files the gate covers: any gate.paths regex matches and the file isn't Markdown. */
export function gatedFiles(files, patterns = []) {
  const res = patterns.map((p) => (p instanceof RegExp ? p : new RegExp(p)));
  return files.filter((f) => !/\.md$/i.test(f) && res.some((re) => re.test(f)));
}

const NEGATIVE = /\b(not approved|changes requested|request(?:ed|s)? changes|withdrawn|blocked|rejected)\b/i;

/**
 * Who approved (or held) `head`. `verdicts`: PR comments and reviews as { body, at, url, state?, commitId? }
 * (state/commitId only for GitHub reviews). `approvers`: role keys allowed to approve. `config` supplies names.
 * Returns { approved, by?, url?, heldBy? }.
 */
export function approvalFor({ verdicts, head, approvers, config }) {
  const h = String(head).toLowerCase();
  const namesHead = (sha) => Boolean(sha) && sha.length >= 7 && h.startsWith(sha.toLowerCase());
  const latest = new Map();
  for (const v of [...verdicts].filter((x) => x.at).sort((a, b) => a.at.localeCompare(b.at))) {
    const body = v.body ?? "";
    const first = body.split("\n")[0];
    for (const role of approvers) {
      if (!config.roles[role] || !roleRegexes(config, role).writtenBy.test(body)) continue;
      const review = /\b(?:re-)?review of\s+(?:[0-9a-f]{7,40}\s*(?:→|->)\s*)*([0-9a-f]{7,40})\b/i.exec(first);
      let verdict = null;
      if (review && namesHead(review[1])) {
        if (NEGATIVE.test(first)) verdict = "held";
        else if (/\*\*approved\.?\*\*/i.test(first)) verdict = "approved";
      } else if (!review && (v.state === "APPROVED" || v.state === "CHANGES_REQUESTED")) {
        const sha = v.commitId ?? (first.match(/\b[0-9a-f]{7,40}\b/i) ?? [])[0];
        if (namesHead(sha)) verdict = v.state === "APPROVED" ? "approved" : "held";
      }
      if (verdict) latest.set(role, { verdict, url: v.url, at: v.at });
    }
  }
  const held = [...latest].filter(([, v]) => v.verdict === "held").at(-1);
  if (held) return { approved: false, heldBy: config.roles[held[0]], url: held[1].url };
  const ok = [...latest].filter(([, v]) => v.verdict === "approved").sort((a, b) => a[1].at.localeCompare(b[1].at)).at(-1);
  return ok ? { approved: true, by: config.roles[ok[0]], url: ok[1].url } : { approved: false };
}

/** The status for one PR: { state: "success" | "pending", description, url? }. */
export function gateVerdict({ files, head, headRef, headRepo, baseRef, repo, verdicts, config }) {
  const gate = config.gate ?? {};
  const short = head.slice(0, 7);
  const sameRepo = headRepo === repo;
  if (sameRepo && headRef === config.baseBranch && baseRef === config.productionBranch) {
    return { state: "success", description: `Deploy train: its PRs were gated into ${config.baseBranch}` };
  }
  if (sameRepo && headRef === config.productionBranch && baseRef === config.baseBranch) {
    return { state: "success", description: `Sync of ${config.productionBranch}: its commits were gated there` };
  }
  const gated = gatedFiles(files, gate.paths ?? []);
  if (!gated.length) return { state: "success", description: "No gated paths changed" };
  const approvers = (gate.approverRoles ?? []).filter((r) => config.roles[r]);
  const result = approvalFor({ verdicts, head, approvers, config });
  if (result.approved) return { state: "success", description: `${result.by} approved ${short}`, url: result.url };
  const list = gated.length > 2 ? `${gated.slice(0, 2).join(", ")} +${gated.length - 2}` : gated.join(", ");
  if (result.heldBy) return { state: "pending", description: `${result.heldBy} holds ${short}: ${list}`.slice(0, 140), url: result.url };
  const who = approvers.map((r) => config.roles[r]).join("/") || "an approver (set gate.approverRoles)";
  return { state: "pending", description: `Needs ${who} approval of ${short}: ${list}`.slice(0, 140) };
}

const gh = (args) => execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
/** `--paginate --jq '.[]|…|tojson'` prints one JSON value per line, whatever the page count. */
const ghLines = (...args) => gh(args).split("\n").filter(Boolean).map((line) => JSON.parse(line));

export async function main(argv = process.argv.slice(2)) {
  let values;
  try {
    ({ values } = parseArgs({ args: argv, options: {
      pr: { type: "string" }, "dry-run": { type: "boolean", default: false }, config: { type: "string" }, help: { type: "boolean", short: "h", default: false },
    } }));
  } catch (error) {
    console.error(`${error.message}\n\n${USAGE}`);
    return 2;
  }
  if (values.help) { console.log(USAGE); return 0; }
  const n = Number(values.pr);
  if (!Number.isInteger(n) || n <= 0) { console.error(`--pr <number> is required\n\n${USAGE}`); return 2; }
  let config;
  try { ({ config } = loadConfig(values.config)); } catch (error) { console.error(`merge-gate: ${error.message}`); return 2; }
  const repo = process.env.GITHUB_REPOSITORY || config.repo;
  const context = config.gate?.statusContext || "merge-gate";
  try {
    const pr = JSON.parse(gh(["api", `repos/${repo}/pulls/${n}`]));
    const head = pr.head.sha;
    const files = ghLines("api", "--paginate", `repos/${repo}/pulls/${n}/files?per_page=100`, "--jq", ".[].filename|tojson");
    const verdicts = [
      ...ghLines("api", "--paginate", `repos/${repo}/issues/${n}/comments?per_page=100`, "--jq", ".[]|{body,at:.created_at,url:.html_url}|tojson"),
      ...ghLines("api", "--paginate", `repos/${repo}/pulls/${n}/reviews?per_page=100`, "--jq",
        ".[]|select(.state != \"PENDING\")|{body,at:.submitted_at,url:.html_url,state,commitId:.commit_id}|tojson"),
    ].filter((v) => v.body);
    const verdict = gateVerdict({ files, head, headRef: pr.head.ref, headRepo: pr.head.repo?.full_name ?? "", baseRef: pr.base.ref, repo, verdicts, config });
    console.log(`#${n} ${head.slice(0, 7)}: ${context}=${verdict.state} · ${verdict.description}`);
    if (values["dry-run"]) return 0;
    const args = ["api", "-X", "POST", `repos/${repo}/statuses/${head}`, "-f", `state=${verdict.state}`, "-f", `context=${context}`, "-f", `description=${verdict.description}`];
    if (verdict.url) args.push("-f", `target_url=${verdict.url}`);
    gh(args);
    return 0;
  } catch (error) {
    console.error(`merge-gate: ${String(error.stderr || error.message).trim().split("\n")[0]}`);
    return 1;
  }
}

const invokedDirectly = (() => {
  try { return Boolean(process.argv[1]) && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; }
})();
if (invokedDirectly) process.exitCode = await main();
