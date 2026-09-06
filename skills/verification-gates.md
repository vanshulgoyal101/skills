# Verification Gates

## Trigger

Use this skill for any change that crosses source, generated assets, shared modules, database behavior, or deployment state.

## Invariant

The checked-in source, generated artifact, live behavior, and documentation agree before release.

## Gate order

1. **Focused behavior check**: reproduce the reported or hypothesized failure.
2. **Narrow tests**: exercise the touched model, DOM path, or integration boundary.
3. **Type/build check**: compile every consumer of changed shared code.
4. **Artifact check**: promote and inspect generated references, asset versions, and URLs.
5. **Full suite**: run all tests.
6. **Browser check**: verify affected desktop/mobile interactions and accessibility states before publishing.
7. **Live invariant check**: after authorized deployment, verify affected routes, content, or service behavior; database/sync changes also require their relevant integrity checks.
8. **Diff hygiene**: inspect staged paths, preserve unrelated work, run whitespace checks.
9. **Documentation**: update the catalog/skill/incident if the new knowledge is reusable.

## Reporting standard

Record exact counts and commands, distinguish warnings from failures, and call out anything not tested. A green unit suite does not prove generated assets or live SQL are correct.

## Failed checks and reruns

- Read the specific failure before rerunning. Repair a repeatable touched-path defect and rerun the same check first.
- When evidence suggests timing or isolation sensitivity, rerun only the failures, optionally serially, without changing assertions. A successful rerun does not prove resource contention or fix the underlying cause.
- Preserve the initial failure, rerun conditions, and remaining uncertainty in the report. Do not repeatedly rerun until green or describe an intermittent suite as consistently clean.
- If an unchanged area blocks release, keep its checks intact. A bounded diagnostic rerun can inform the decision; persistent failures require investigation or an explicitly reported blocker.
- Distinguish applicable passes from intentional viewport skips, and focused checks from the full release suite.

## Concurrent deployment identity

- Inspect staged paths and preserve other actors' changes. Capture the commit identity from the commit operation; a later `rev-parse HEAD` may already name someone else's commit.
- Track workflow runs by full SHA, not an assumed current HEAD or an abbreviated filter that can miss results.
- If a descendant revision is deployed, confirm ancestry and identify the combined revision. Do not reset or force-push away concurrent work to recover the expected SHA.
- Use the repository's existing deployment mechanism. A Pages workflow deployment is not interchangeable with a separate branch-publishing command.
- Await the actual deployment conclusion and inspect the live invariant before saying the change is live. Avoid noisy repeated polling; use a completion wait with bounded output when available.
- Source/API inspection, blocked-network browser tests, and live checks prove different things. State which evidence supports each claim.

## Common traps

- Trusting stale language-server diagnostics over the build.
- Running only the full suite after a bug fix and missing the causal check.
- Calling a database definition check “functional” without exercising the trigger.
- Forgetting to rebuild all consumers of a shared module.
- Committing generated output from another actor or leaving the tree dirty.
- Treating rerun success as a diagnosed or repaired flaky test.
- Claiming the deployed SHA is the agent's commit when a concurrent descendant was actually released.

## Evidence

See [portfolio shelf and release](../incidents/portfolio-shelf-and-release.md): local failures passed serial reruns, CI failed unchanged sculpture assertions before a successful failed-job rerun, and a concurrent descendant was the deployed revision. No assertions were weakened; failure causes remain uncertain.
