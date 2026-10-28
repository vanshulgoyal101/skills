# Evidence-First Development Plans

## Trigger

Use this skill when a feature or bug fix spans multiple modules, runtimes, generated artifacts, database state, or deployment configuration.

## Invariant

Every planned work slice is anchored to an observed behavior, has one falsifiable hypothesis, and has a cheap check that can disprove it before broad implementation.

## Failure pattern

A plan maps the whole repository before locating the owning abstraction, treats plausible neighboring code as equally relevant, and then ships a wide fix without a causal regression check. This creates scope drift, missed edge cases, and plans that describe activity rather than evidence.

## Recommended method

Start by naming the customer outcome and its release boundary. A large useful
workflow can have small commits without becoming a collection of disconnected
features. Defer speculative abstractions and rare-state polish, but not tenant,
privacy, monetary or data-integrity protections.

1. Start from the most concrete anchor: failing test, command, file, symbol, live symptom, or nearby implementation.
2. State one local hypothesis about the controlling code path.
3. Choose the cheapest discriminating check, preferably a focused test or runtime probe.
4. Make the smallest edit that lets that check distinguish the hypothesis.
5. Expand only after the focused check confirms the local path or identifies the next owning boundary.
6. Record risks, non-goals, generated outputs, live configuration, and the final verification record.

Before building a substantial capability, inspect existing dependencies and
maintained provider SDKs. Verify current APIs, coverage, license, maintenance,
security and operating cost. Keep custom code focused on product rules and thin
integration boundaries; an SDK does not supply tenant authorization, durable
local identity or permission to spend. Avoid broad replacement solely to adopt
a library during an active release.

Once the owning path and discriminating check are known, edit and run that check
before more exploration. If it fails, repair the same slice or move one nearby
hop based on evidence. A plan is not progress unless it leads to a checked change.
For parallel work, use [multi-worker delivery](multi-worker-delivery.md) rather
than adding coordinator approval to every local decision.

### Speed with structural protection

- A fast policy can be: develop directly in production with small auto-merging
	PRs, with deliberate brakes only on the core check, the production smoke, money
	and secrets. Name the accepted trade-offs (for example, a dependency audit that
	reports instead of blocking).
- Remove process and add structural core protection in the same step, not one
	after the other: staging, extra approvals and reports went; a recorded-response
	core gate, a post-deploy smoke with automatic rollback, a daily smoke and a
	production-drift alert came in. About 20 PRs merged the same evening and a
	failing step went to 4.4s (2026-10-21). The rollback itself was never exercised,
	so it remains unproven protection.
- Ship the protection that already works; list the untested part (rollback, a
	not-yet-required check) as open rather than treating the policy as complete.

### Performance and repository-wide requests

- A reported slow application is an observation; excessive bundle size is only
	one possible cause. Separate server/auth/database waits, network/media transfer,
	hydration and browser work before choosing caching, code splitting or refactoring.
- Pin visible session, source/deployment, data size, actual viewport, CPU/network
	profile and cache state. Compare cold and warm runs separately; input-to-feedback
	is not operation-completion latency, and lab timing is not a field percentile.
- Repository footprint and installed dependencies are not the shipped client
	bundle. Measure transferred bytes, image dimensions, request waterfalls and
	long tasks for the affected customer path; do not delete caches as a speed claim.
- For a requested future whole-repo cleanup, record a deferred inventory/target-map
	issue instead of starting a rewrite. Classify maintained, generated, vendor,
	private and historical material; every maintained surface deserves assessment,
	not necessarily an edit. Require evidence for removal and retain supported
	behavior, migration identity and unique receipts through reversible batches.
- A backlog issue, an approved objective and an active implementation assignment
	are different states. Do not interrupt current work or spend money because a
	future cleanup, pilot or performance goal was recorded.

## Discriminating checks

- Can the suspected failure be reproduced with one focused test or command?
- Does changing the proposed owning abstraction alter the failing behavior without touching unrelated paths?
- Does a neighboring call site or test falsify the hypothesis?
- Are the final commands and outputs recorded separately for focused, broad, artifact, and live checks?

## Common traps

- Starting with broad repository mapping instead of a local anchor.
- Treating a wiring layer as the behavior owner.
- Writing a checklist of files before identifying the invariant.
- Calling a full suite sufficient when it does not exercise the failure.
- Expanding scope after an ambiguous check without one nearby disambiguating read.

## Evidence

The skills repository's intake protocol and repeated cross-repository fixes use the anchor, hypothesis, discriminating-check, root-fix, and focused-validation sequence.


## Lessons from small-sample ad tests (AdBrain, Oct 28)

- A single run with ~35 conversions can't prove a fixed percentage bar (7/35 has a 95%
  range of 8–37%). Size pass/fail bars with exact binomial ranges and add one extend step.
- Before writing "compared with past runs", put a Poisson range on the count; at 6
  results the cost-per-result range spans ~6×, so pool ≥ 20 results first.
- Small local campaigns rarely exit Meta's learning phase (~50 results a week), so
  "Learning limited" is normal; judge them on the business result (chats, enquiries).
- Re-read a paused run's numbers a day later; platforms add late results.
