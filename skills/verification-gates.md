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

- Exercise integration contracts at their owning boundary: SDK auth callbacks, resolved error responses, delayed account changes, and private-view teardown need more than pure-model tests.
- A live integrity checker must report unreadable or unsupported records separately, not count them as healthy. Test that its readers cover every registered product and fail its gate on unreadable or inconsistent records.
- For randomized interaction tests, choose a deterministic setup that guarantees the intended transition. A swipe may legitimately be a no-op on a random board; fix the precondition without weakening the gesture assertion.
- Align reporting keys and labels with the backend's calendar timezone. Test near midnight where the reporting date differs from UTC and the viewer's local date, as well as delayed responses after filter or auth changes.
- Separate generated-page smoke checks, authenticated workflow tests, and deployed-byte checks. Visible sign-in controls do not prove OAuth consent or owner-only rendering.

## Failed checks and reruns

- Read the specific failure before rerunning. Repair a repeatable touched-path defect and rerun the same check first.
- When evidence suggests timing or isolation sensitivity, rerun only the failures, optionally serially, without changing assertions. A successful rerun does not prove resource contention or fix the underlying cause.
- Preserve the initial failure, rerun conditions, and remaining uncertainty in the report. Do not repeatedly rerun until green or describe an intermittent suite as consistently clean.
- If an unchanged area blocks release, keep its checks intact. A bounded diagnostic rerun can inform the decision; persistent failures require investigation or an explicitly reported blocker.
- Distinguish applicable passes from intentional viewport skips, and focused checks from the full release suite.

## Concurrent deployment identity

- Inspect staged paths and preserve other actors' changes. Capture the commit identity from the commit operation; a later `rev-parse HEAD` may already name someone else's commit.
- In a shared worktree, inspect both `git status --short` and `git diff --cached` before staging. Stage only owned paths or hunks; explicit paths alone do not protect someone else's edits in the same file. Do not reset, stash, or unstage another actor's work to manufacture a clean index.
- When HEAD or the remote branch moves unexpectedly, inspect the reflog and ancestry before assuming work was lost. Fetch before an authorized push and compare revisions. Bot-generated commits are still concurrent changes; do not automatically rebase a dirty shared worktree or force-push over them.
- A modification may restore stale source and remove shipped behavior. Compare its intent with the relevant base and generated artifacts; reconcile with the owner rather than discarding it solely because it differs from the remote.
- Track workflow runs by full SHA, not an assumed current HEAD or an abbreviated filter that can miss results.
- If a descendant revision is deployed, confirm ancestry and identify the combined revision. Do not reset or force-push away concurrent work to recover the expected SHA.
- Use the repository's existing deployment mechanism. A Pages workflow deployment is not interchangeable with a separate branch-publishing command.
- Await the actual deployment conclusion and inspect the live invariant before saying the change is live. Avoid noisy repeated polling; use a completion wait with bounded output when available.
- Source/API inspection, blocked-network browser tests, and live checks prove different things. State which evidence supports each claim.

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

### Already-published changes in an older checkout

- A large modified/untracked count can be an old local baseline, not missing
	publication. Compare every changed path, including untracked contents, with
	the fetched release tree before committing or deploying again.
- For explicitly requested cleanup, first require an empty staged diff, correct
	branch, fast-forward ancestry, and exact equality with the intended remote.
	Any differing or missing path stops this procedure for separate review.
- With writers paused and those conditions proved, a mixed reset to the verified
	commit can align the branch/index without rewriting working files. This is a
	narrow reconciliation operation, not a general dirty-worktree cleanup recipe.
	Never substitute a hard reset, clean, or stash.
- Fingerprint file contents, modes, and symlink targets before and after; verify
	no working-file changes, clean status, and local/remote commit equality. Inspect
	other worktrees independently rather than assuming they contain no new work.

### Deployment state is not deployment completion

- A project's production-target pointer can name an INITIALIZING deployment.
	Require the exact commit's successful deployment state and canonical-host
	evidence, then test the affected authenticated workflow. A preview success or
	homepage response does not satisfy this gate.
- If management access fails, report that failure separately. An exact-SHA
	successful provider/GitHub deployment receipt plus canonical workflow evidence
	can support a qualified report; do not invent an alias API verification.
- Follow existing build events before requesting another deployment. A manual
	fallback needs its own approval and must bind to the tested immutable SHA.
	If the original catches up, reconcile duplicates and cancel only an owned,
	redundant queued build; never promote an arbitrary preview to clear a queue.

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
- A read-only provider estimate proves request acceptance and returned estimates,
  not persisted configuration, exact geographic boundaries, delivery, or paid
  output quality. Do not silently replace a saved-behavior gate with that result;
  obtain an explicit decision and retain the limitation in the release receipt.

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

[AdBrain PR #18](https://github.com/vanshulgoyal101/adbrain/pull/18) (2026-09-19)
recorded delayed deployment completion, exact-commit provider evidence, and
canonical authenticated checks. Follow-up reconciliation found 93 local paths
already equal to the released tree; all 490 fingerprinted working files remained
unchanged while the old branch/index baseline was aligned with explicit approval.
