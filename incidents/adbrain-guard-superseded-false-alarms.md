# Incident: Production Guard False Alarms On Superseded Deploys

- **Date**: 2026-10-21
- **Repository**: AdBrain
- **Severity**: Medium
- **Status**: Fixed for commits after PR #126; rollback untested

## Symptom

Between 16:38Z and 16:51Z the post-deploy guard (PR #119) reported two core
failures, #125 and #127, while production was healthy. No rollback ran.

## Trigger sequence

1. Several PRs merge minutes apart; each merge produces a production deploy and a
   `deployment_status` event.
2. The guard for e0fc4fc smokes production after 28023b8 has already replaced
   it, and reports a failure (#125).
3. PR #126 makes the guard skip superseded deploys.
4. A deploy of a2fc4a7, a commit older than PR #126, fires the guard again. A
   `deployment_status` workflow runs the workflow and scripts from the deployed
   commit, so the old guard without the fix ran and reported #127.

## Evidence

- Issues #125 and #127 and their workflow runs.
- PR #126 tested read-only against production before merge.
- Later guard runs passed 6/6 on 6c3ee49 and on 1bdcc78; the drift check reported
  that production serves main HEAD.
- Deploys trailed merges by about 5-15 minutes (15:34Z merge live at 15:50Z;
  15:46:50Z merge live at 15:57Z).

## Root cause

The guard assumed the deploy that triggered it was the one production serves, and
a guard fix cannot reach deploys of commits that predate it.

## Fix

PR #126 skips a deploy that a newer one has replaced, so the guard judges only
the deploy production actually serves.

## Regression coverage

Read-only run of the guard script against production. No automated test for the
superseded case is recorded.

## Residual risk

- Automatic rollback has never run; a drill needs owner approval. Whether a false
  alarm with rollback enabled could roll back a healthy newer deploy is untested.
- Scheduled-only jobs still share the workflow and show as skipped checks (open).
- The `core` job became a required check later the same day (PR #129, 7a7f39e),
  so the merge gate no longer depends on the guard alone.

## Portable lesson

[post-deploy-production-guard](../skills/post-deploy-production-guard.md).
