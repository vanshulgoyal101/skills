# Evidence-First Development Plans

## Trigger

Use this skill when a feature or bug fix spans multiple modules, runtimes, generated artifacts, database state, or deployment configuration.

## Invariant

Every planned work slice is anchored to an observed behavior, has one falsifiable hypothesis, and has a cheap check that can disprove it before broad implementation.

## Failure pattern

A plan maps the whole repository before locating the owning abstraction, treats plausible neighboring code as equally relevant, and then ships a wide fix without a causal regression check. This creates scope drift, missed edge cases, and plans that describe activity rather than evidence.

## Recommended method

1. Start from the most concrete anchor: failing test, command, file, symbol, live symptom, or nearby implementation.
2. State one local hypothesis about the controlling code path.
3. Choose the cheapest discriminating check, preferably a focused test or runtime probe.
4. Make the smallest edit that lets that check distinguish the hypothesis.
5. Expand only after the focused check confirms the local path or identifies the next owning boundary.
6. Record risks, non-goals, generated outputs, live configuration, and the final verification record.

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
