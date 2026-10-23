# Incident: Create Reliability, October 2026

- **Date**: 2026-10-02 to 2026-10-21
- **Repository**: AdBrain
- **Severity**: Critical (core loop)
- **Status**: Closed 2026-10-22 (#98): two consecutive production 3/3 runs

## Symptom

Production Create, which should save 3 ads per run, saved 1 or 2 of 3 in five of
six paid runs. Failures appeared as rejections, "provider-stage failures, zero
tokens" and deadline overruns.

## Trigger sequence

| Run | Date (UTC) | Routing | Result | Main cause |
|---|---|---|---|---|
| 1 | before 2026-10-02 | pre-fallback routing | 1/3, UI crash after HTTP 202 | Zod v4 JIT blocked by CSP (#90; fixed by PR #94) |
| 2 | 2026-10-02 | pre-fallback routing | 1/3 | Questioned claims were present in saved Brand facts, so not a grounding failure (#88) |
| 3 | 2026-10-06 | single provider (OpenRouter), deadline 240s to 270s (PR #99) | 1/3 at 212s | Rejections; 3 of 4 were opaque `schema-or-other` |
| 4 | 2026-10-21 15:41Z | single model on OpenRouter | 3/3 at 265s of 270s | Passed; concepts took 65-89s each |
| 5 | 2026-10-21 | Gemini first (PR #112) | 1/3 at 273s | Gemini HTTP 503 after 16-43s on all 4 keys, twice |
| 6 | 2026-10-21 16:35Z | Groq first (PR #117) | 2/3 in 106s | Groq 429 on all 4 keys (one shared 8k tokens/min limit); description over 100 chars in 2 of 4 outputs |

Earlier, three zero-token "provider failures" landed 230-240s into a 240s
deadline while four diagnostic calls returned 200 with a valid, funded key.

## Evidence

- Per-attempt failure codes after PR #107 (run 5: HTTP 503, OpenRouter TIMEOUT,
  Groq 429 in about 140ms).
- Usage table: 26 concept calls in 30 days averaged 71s at about 35 tokens/s.
- Saved-concept lengths: `rationale` averaged 477 of 600 characters, 12 of 28 at
  80% or more, maximum 592.
- Direct key checks: 799 tokens on one Groq key changed the other key's remaining
  count and 6.1s reset identically.
- Paid run budget: 10 approved, 6 used, read from the append-only run log.

## Root cause

Several independent causes stacked on one deadline: a slow reasoning model with
no live fallback (setting unapplied, see
[the CI stall](adbrain-two-week-ci-stall.md)), per-field validator overruns that
discarded paid output, opaque failure telemetry, and promotion of fast-looking
models without a real-workload run.

## Fix

- PR #103: per-field rejection codes `schema:<field>:<code>` (verified in
  production by run 6 receipts); empty optional `supportingText` becomes null
  (CI only).
- PR #107: deadline aborts classified apart from provider errors; per-attempt
  codes with latency; timeout and truncation fall through. Verified in production.
- PR #115: internal-only `rationale` cap 1,200 while the prompt asks for 600; an
  uncited "$49" is still rejected. CI only.
- PR #117: skip a model's other keys on 5xx; honor `Retry-After` capped at 60s.
  CI only.
- PR #122: clip the link description at a word boundary before validation. CI only.
- PR #124: revert Create to the run-4 provider order, keeping PR #117's fixes.
  Merged and deployed; not yet re-run.
- PR #128 (merged as 61c47f3): wait once when every key is blocked for 20s or
  less, then retry before the slow fallback. CI only.

## Regression coverage

`test:core` (PR #123, merged as 21b6cb1): 28 tests in 6 files, about 4s offline,
replaying run 4, the recorded planner reply and recorded Graph responses. Nine
deliberate mutations each turned it red. PRs #115, #118, #121 and #122 each added
a core test shown to fail on main. `csp-render` pins the production CSP and
renders 3 ads.

## Residual risk

- Open: two consecutive production 3/3 runs; 4 paid runs remain.
- Open: a faster Create model (a bake-off capped at $1 has not run).
- Open: worst case of a 90s attempt limit is about 284s against a 270s deadline;
  the worst-case test is deferred.
- PR #128 waits out a short shared limit, but one 8k tokens/min account limit
  still caps throughput if Groq is promoted again.

## Portable lesson

[provider-cooldown-rotation](../skills/provider-cooldown-rotation.md),
[task-aware-llm-routing](../skills/task-aware-llm-routing.md),
[validated-multimodal-generation](../skills/validated-multimodal-generation.md),
[verification-gates](../skills/verification-gates.md) and
[external-api-error-contracts](../skills/external-api-error-contracts.md).

## Follow-up 2026-10-22

A capped real-route bake-off chose Haiku 5.5 with a parallel concept schedule
(#142). Runs 10 and 11 saved 3/3 in a row in production (48s, 40s); #98 closed.
Some 429s were stale quota holds, not usage (#138).
