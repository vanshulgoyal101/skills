# Post-Deploy Production Guard

## Trigger

Use when merges auto-deploy to production and a CI workflow should smoke each
deploy, roll back a bad one, run a scheduled smoke, or alert when production
stops serving the main branch.

## Invariant

The guard judges only the deploy production actually serves, ignores deploys a
newer one has replaced, rolls back only after a confirmed repeated failure, and
reports drift when production is not main HEAD within a fixed window.

## Failure pattern

A merge is declared undeployed because the platform has not finished yet. A
guard smokes production while it still serves the previous commit, or fires on a
deploy a newer one already replaced, and opens a false incident (or rolls back a
healthy newer deploy). A guard fix merges but older deploys keep running the old
guard. Scheduled-only jobs show as skipped checks on every push and read as
failures. Observed in
[AdBrain guard false alarms](../incidents/adbrain-guard-superseded-false-alarms.md).

## Recommended method

1. Expect deploy lag. Production deploys trailed merges by about 5-15 minutes;
   one merge at 15:34Z went live at 15:50Z after being reported as never deployed.
2. Before smoking, wait until production serves the deployed commit (compare the
   served deployment's commit with the event's commit).
3. If a newer deployment has replaced this one, skip with a logged reason instead
   of failing.
4. Smoke once with one retry. On a second failure, roll back automatically and
   open an issue labeled for the core queue.
5. Run a daily scheduled smoke that reports but never rolls back.
6. Alert when production does not serve main HEAD within 15 minutes.
7. Use a scoped deploy token stored as a repository secret. Never copy a person's
   CLI login into CI. Without it, make rollback and drift skip with a warning.
8. Put scheduled-only jobs in their own workflow file.
9. Keep the smoke read-only by default (see
   [verification gates](verification-gates.md#core-regression-gates)).
10. Treat an untested rollback as residual risk. Schedule an approved drill.

## Discriminating checks

- Merge two commits a few minutes apart; the older deploy's guard must skip as
  superseded, not fail.
- Run the guard script read-only against production for an old and a current
  commit before enabling rollback.
- Workflows triggered by `deployment_status` run the workflow and scripts from
  the deployed commit. After fixing the guard, confirm which commits contain the
  fix; deploys of older commits still run the old guard.
- Check the drift alert reports OK only when the served commit equals main HEAD.
- Before reporting an incident, read the newest main commit's checks and confirm
  production serves it. A "6/7 checks" count with a green tick can include a job
  skipped by design; a red X on an older commit can be a superseded-deploy alarm.

## Common traps

- Calling a merge "not deployed" before the 15-minute window passes.
- Smoking the canonical URL right after the deploy event without checking which
  commit it serves.
- Assuming a guard fix on main protects deploys of commits that predate it.
- Giving rollback a personal login token, or letting a daily smoke roll back.
- Mixing scheduled and per-deploy jobs in one workflow.
- Counting the guard as full protection while rollback has never run.
