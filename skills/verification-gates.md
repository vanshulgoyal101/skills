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
## Branch and worktree parity

- Fetch remote state before comparing branches. Report local branch, remote branch,
	worktree HEAD, and deployed SHA separately; they can all differ.
- Prove containment with `git merge-base --is-ancestor <candidate> origin/main`
	or inspect `git log origin/main..<candidate>`. A historical release branch can
	contain no missing work even when its tip differs from main. Use `git diff` to
	establish exact tree equality when that is the requirement.
- Preserve dirty work during a release. An isolated worktree can ship a reviewed
	subset, but its cleanliness says nothing about the original checkout. List
	excluded modified and untracked paths explicitly; `git diff` omits untracked
	file contents.
- Before integrating preserved edits, compare their intent with the current
	released base. Keep concurrent changes, resolve overlaps deliberately, and
	test the assembled result. Never discard apparent stale changes by assumption.
- Stage explicit paths and inspect the staged diff. Follow the repository's
	protected promotion path, bind checks and merge to the exact reviewed head,
	then synchronize the production merge back into development.
- Branch deletion is a separate cleanup decision. First prove containment;
	do not delete branches or attached worktrees merely to make counts match.

## Evidence and authorization boundaries

- Record code publication, migration, environment changes, deployment, and live
	provider mutations separately. Approval for one does not imply the others.
- A preview URL or configured deployment-disable rule does not prove isolation.
	Verify actual deployment behavior and credential/database targets before use.
- Authenticate the intended owner and business before acceptance testing. An
	HTTP 200 with empty results for another tenant proves neither saved-result
	recovery nor that the correct account was selected.
- Consent mocks, application publication, and API-tier approval do not prove
	real customer consent. Record the last completed step and leave the cause of
	an external restriction unconfirmed until evidence distinguishes it.
- Date demo receipts and name their tested commit, request count, and writes.
	A successful one-item generation does not validate a default multi-item batch.
	Never repeat a paid rehearsal under an already-consumed approval.


## Evidence

See [portfolio shelf and release](../incidents/portfolio-shelf-and-release.md): local failures passed serial reruns, CI failed unchanged sculpture assertions before a successful failed-job rerun, and a concurrent descendant was the deployed revision. No assertions were weakened; failure causes remain uncertain.
