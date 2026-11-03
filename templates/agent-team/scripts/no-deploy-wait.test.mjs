import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decide, LONG_SLEEP_S, waitReason } from "./no-deploy-wait.mjs";

const script = join(dirname(fileURLToPath(import.meta.url)), "no-deploy-wait.mjs");
const bash = (command, extra = {}) => ({ toolName: "bash", toolArgs: { command, ...extra } });

describe("waitReason", () => {
  it("refuses sleeps of a minute or more, in any unit", () => {
    assert.equal(LONG_SLEEP_S, 60);
    assert.equal(waitReason("sleep 59"), null);
    assert.equal(waitReason("sleep 0.5m"), null);
    assert.match(waitReason("sleep 60"), /sleeps 60s/);
    assert.match(waitReason("npm test && sleep 1m"), /sleeps 1m/);
    assert.match(waitReason("sleep 2h"), /sleeps 2h/);
  });
  it("refuses polling loops and CI watches", () => {
    assert.match(waitReason("while true; do gh pr view 5; sleep 10; done"), /sleep loop/);
    assert.match(waitReason("for i in 1 2 3; do sleep 5; done"), /sleep loop/);
    assert.match(waitReason("gh run watch 123 --exit-status"), /CI run/);
    assert.match(waitReason("gh pr checks 42 --watch --interval 30"), /CI run/);
  });
  it("allows short work, the escape hatch and the waiter", () => {
    assert.equal(waitReason("gh pr checks 42"), null);
    assert.equal(waitReason("for f in *.js; do node --check $f; done"), null);
    assert.equal(waitReason("sleep 300 # allow-wait"), null);
    assert.equal(waitReason("node scripts/wait-for-work.mjs --me dev; sleep 120"), null);
    assert.equal(waitReason(""), null);
    assert.equal(waitReason(undefined), null);
  });
});

describe("decide", () => {
  it("denies a synchronous long wait with a reason that says what to do instead", () => {
    const d = decide(bash("sleep 600"));
    assert.equal(d.permissionDecision, "deny");
    assert.match(d.permissionDecisionReason, /# allow-wait/);
    assert.match(d.permissionDecisionReason, /wait-for-work\.mjs --me <role>/);
  });
  it("accepts toolArgs as a JSON string", () => {
    assert.equal(decide({ toolName: "bash", toolArgs: JSON.stringify({ command: "gh run watch 1" }) }).permissionDecision, "deny");
  });
  it("falls through for other tools, async bash and unreadable args", () => {
    assert.equal(decide({ toolName: "view", toolArgs: { command: "sleep 600" } }), null);
    assert.equal(decide(bash("sleep 600", { mode: "async" })), null);
    assert.equal(decide({ toolName: "bash", toolArgs: "{not json" }), null);
    assert.equal(decide(null), null);
  });
});

describe("hook process", () => {
  const run = (input) => spawnSync(process.execPath, [script], { input, encoding: "utf8", timeout: 10_000 });
  it("prints the deny JSON on stdout", () => {
    const r = run(JSON.stringify(bash("sleep 120")));
    assert.equal(r.status, 0);
    assert.equal(JSON.parse(r.stdout).permissionDecision, "deny");
  });
  it("prints nothing for an allowed command or a malformed payload (fails open)", () => {
    for (const input of [JSON.stringify(bash("ls")), "not json", ""]) {
      const r = run(input);
      assert.equal(r.status, 0);
      assert.equal(r.stdout, "");
    }
  });
});
