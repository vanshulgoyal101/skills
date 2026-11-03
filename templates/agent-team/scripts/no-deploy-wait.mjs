#!/usr/bin/env node
// preToolUse hook for Copilot CLI / coding agents: a chat blocked in a long synchronous sleep or CI watch can't
// read new messages or pick up handoffs. Refuse those bash calls and say what to do instead.
// Refused: `sleep` of 60 s or more, any loop that sleeps (polling), `gh run watch`, `gh pr checks --watch`.
// Always allowed: async bash calls, the waiter (wait-for-work.mjs), and any command containing `# allow-wait`.
// Fails open: any error (bad payload, unexpected shape) prints nothing, and the hook config adds `|| true`.
// Input: the hook's JSON payload on stdin ({ toolName, toolArgs }). Output: nothing to allow, or
// {"permissionDecision":"deny","permissionDecisionReason":"…"} to refuse.
import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const LONG_SLEEP_S = 60;
const UNIT = { s: 1, m: 60, h: 3600, d: 86400 };

const seconds = (value, unit = "s") => Number(value) * (UNIT[unit] ?? 1);

/** Why this bash command must not run synchronously, or null when it may. */
export function waitReason(command) {
  if (typeof command !== "string" || !command.trim()) return null;
  if (/#\s*allow-wait\b/.test(command) || /wait-for-work\.mjs/.test(command)) return null;
  if (/\bgh\s+run\s+watch\b/.test(command) || /\bgh\s+pr\s+checks\b[^\n;&|]*--watch\b/.test(command)) {
    return "watches a CI run until it ends";
  }
  if (/\b(while|until|for)\b[\s\S]*?\bdo\b[\s\S]*?\bsleep\b/.test(command)) return "polls in a sleep loop";
  for (const match of command.matchAll(/\bsleep\s+(\d+(?:\.\d+)?)([smhd]?)\b/g)) {
    if (seconds(match[1], match[2] || "s") >= LONG_SLEEP_S) return `sleeps ${match[1]}${match[2] || "s"}`;
  }
  return null;
}

/** The hook's decision for one preToolUse payload, or null to fall through (allow). */
export function decide(input) {
  if (!input || input.toolName !== "bash") return null;
  let args = input.toolArgs;
  if (typeof args === "string") {
    try { args = JSON.parse(args); } catch { return null; }
  }
  if (!args || args.mode === "async") return null;
  const reason = waitReason(args.command);
  if (!reason) return null;
  return {
    permissionDecision: "deny",
    permissionDecisionReason: `This command ${reason}, and a chat blocked on it can't read new messages. `
      + "Don't wait for CI, a deploy or the deploy train: start your next item and check the result on your next pass. "
      + "When nothing is actionable, run the waiter (node scripts/wait-for-work.mjs --me <role>). "
      + "If the wait is truly needed, add `# allow-wait` to the command.",
  };
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  const decision = decide(JSON.parse(raw));
  if (decision) process.stdout.write(JSON.stringify(decision));
}

const invokedDirectly = (() => {
  try { return Boolean(process.argv[1]) && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; }
})();
if (invokedDirectly) main().catch(() => {});
