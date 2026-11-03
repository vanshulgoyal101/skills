import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { approvalFor, gatedFiles, gateVerdict } from "./merge-gate.mjs";
import { normalizeConfig } from "./wait-for-work.mjs";

const script = join(dirname(fileURLToPath(import.meta.url)), "merge-gate.mjs");
const config = normalizeConfig({
  repo: "acme/widgets",
  roles: { cto: "CTO", dev: "Dev", qa: "QA", qa2: "QA 2", reviewer: "Reviewer" },
  gate: { paths: ["^db/migrations/", "^src/payments/"], approverRoles: ["qa", "reviewer", "cto"], statusContext: "merge-gate" },
  baseBranch: "next",
  productionBranch: "main",
});
const head = "1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d";
const old = "9f8e7d6c5b4a39281706f5e4d3c2b1a098765432";
const approvers = ["qa", "reviewer", "cto"];
const say = (body, at, extra = {}) => ({ body, at: `2026-11-01T10:${at}:00Z`, url: `u${at}`, ...extra });

describe("gatedFiles", () => {
  it("matches gate.paths and ignores Markdown", () => {
    const files = ["db/migrations/001.sql", "db/migrations/README.md", "src/payments/charge.ts", "src/ui/button.tsx", "docs/payments.md"];
    assert.deepEqual(gatedFiles(files, config.gate.paths), ["db/migrations/001.sql", "src/payments/charge.ts"]);
    assert.deepEqual(gatedFiles(files, []), []);
  });
});

describe("approvalFor", () => {
  const check = (verdicts) => approvalFor({ verdicts, head, approvers, config });
  it("accepts '<Role> review of <sha>: **approved**' naming the current head (7+ chars)", () => {
    assert.deepEqual(check([say("QA review of 1a2b3c4: **approved**. Walked it.", "01")]), { approved: true, by: "QA", url: "u01" });
    assert.equal(check([say("**Reviewer** re-review of 9f8e7d6 → 1a2b3c4d: **approved**", "01")]).by, "Reviewer");
  });
  it("ignores an approval of an older head, a short sha, a non-approver and QA 2 posing as QA", () => {
    assert.deepEqual(check([say(`QA review of ${old.slice(0, 7)}: **approved**`, "01")]), { approved: false });
    assert.deepEqual(check([say("QA review of 1a2b3c: **approved**", "01")]), { approved: false });
    assert.deepEqual(check([say("Dev review of 1a2b3c4: **approved**", "01")]), { approved: false });
    assert.deepEqual(check([say("QA 2 review of 1a2b3c4: **approved**", "01")]), { approved: false });
  });
  it("a later hold from any approver wins; the latest verdict per role decides", () => {
    const held = check([say("QA review of 1a2b3c4: **approved**", "01"), say("CTO review of 1a2b3c4: changes requested, see line 4", "02")]);
    assert.deepEqual(held, { approved: false, heldBy: "CTO", url: "u02" });
    const reApproved = check([say("QA review of 1a2b3c4: not approved", "01"), say("QA review of 1a2b3c4: **approved**", "02")]);
    assert.equal(reApproved.approved, true);
  });
  it("accepts a GitHub APPROVED review on the head whose body starts with an approver name", () => {
    assert.equal(check([say("Reviewer: lgtm", "01", { state: "APPROVED", commitId: head })]).by, "Reviewer");
    assert.deepEqual(check([say("Reviewer: lgtm", "01", { state: "APPROVED", commitId: old })]), { approved: false });
    assert.deepEqual(check([say("lgtm", "01", { state: "APPROVED", commitId: head })]), { approved: false });
    assert.equal(check([say("CTO: no", "01", { state: "CHANGES_REQUESTED", commitId: head })]).heldBy, "CTO");
  });
});

describe("gateVerdict", () => {
  const base = { head, headRef: "work/issue-7", headRepo: "acme/widgets", baseRef: "next", repo: "acme/widgets", verdicts: [], config };
  it("passes PRs that touch no gated path", () => {
    assert.equal(gateVerdict({ ...base, files: ["src/ui/a.ts", "db/migrations/notes.md"] }).state, "success");
  });
  it("holds a gated PR and says who must approve which files", () => {
    const v = gateVerdict({ ...base, files: ["db/migrations/1.sql", "db/migrations/2.sql", "src/payments/x.ts"] });
    assert.equal(v.state, "pending");
    assert.equal(v.description, "Needs QA/Reviewer/CTO approval of 1a2b3c4: db/migrations/1.sql, db/migrations/2.sql +1");
    assert.ok(gateVerdict({ ...base, files: [`db/migrations/${"x".repeat(200)}.sql`] }).description.length <= 140);
  });
  it("passes once the head is approved, and names the holder when held", () => {
    const files = ["src/payments/x.ts"];
    assert.equal(gateVerdict({ ...base, files, verdicts: [say("QA review of 1a2b3c4: **approved**", "01")] }).description, "QA approved 1a2b3c4");
    assert.match(gateVerdict({ ...base, files, verdicts: [say("QA review of 1a2b3c4: blocked", "01")] }).description, /^QA holds 1a2b3c4/);
  });
  it("exempts the same-repo deploy train and a sync of main into next, but not a fork with those names", () => {
    const files = ["db/migrations/1.sql"];
    assert.equal(gateVerdict({ ...base, files, headRef: "next", baseRef: "main" }).state, "success");
    assert.equal(gateVerdict({ ...base, files, headRef: "main", baseRef: "next" }).state, "success");
    assert.equal(gateVerdict({ ...base, files, headRef: "next", baseRef: "main", headRepo: "mallory/widgets" }).state, "pending");
  });
});

describe("command line", () => {
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: "utf8", timeout: 10_000 });
  it("--help prints usage and exits 0", () => {
    const r = run("--help");
    assert.equal(r.status, 0);
    assert.match(r.stdout, /Usage: node scripts\/merge-gate\.mjs --pr <number>/);
  });
  it("a missing or bad --pr, or an unknown flag, exits 2", () => {
    assert.equal(run().status, 2);
    assert.equal(run("--pr", "abc").status, 2);
    assert.equal(run("--bogus").status, 2);
  });
});
