# Incident: Core Gate PR Merge Would Have Reverted Merged Work

- **Date**: 2026-10-21
- **Repository**: AdBrain
- **Severity**: High (near-miss, caught before merge)
- **Status**: Fixed

## Symptom

PR #123 (the `test:core` merge gate) was green with auto-merge enabled, but its
merge commit bca5356 would have reset 8 files and reverted the already-merged
PRs #122, #124 and #126.

## Trigger sequence

1. Several workers share one Git object store through worktrees; `origin/main`
   moves whenever any of them fetches.
2. The recorded explanation: `origin/main` moved between the branch's rebase and
   its merge, so the merge result restored older versions of files that later
   PRs had changed. The exact ref sequence was not reconstructed.
3. Separately, a review comment asked the author to "update the branch" for 3
   failing tests.

## Evidence

- DevOps compared the PR against current main, saw the 8 unexpected files and
  turned auto-merge off.
- QA recorded a `Lesson:` line with the compare command.
- The coordinator merged the head into current main in a throwaway worktree: the
  same 3 tests still failed, because the test encoded the provider order from
  before PR #124. Stubbing `CREATIVE_PROVIDER_ORDER` in setup made all 27 pass.

## Root cause

Auto-merge was enabled without checking the PR's diff against current main, and
a test depended on an implicit routing default.

## Fix

Corrected head ca9693e containing only intended files; merged as 21b6cb1 at
16:57Z. The routing variable is set explicitly in the test.

## Regression coverage

Process check before enabling auto-merge: the compare against current main lists
only intended files. No automated guard exists.

## Residual risk

Shared refs still move between rebase and merge. Auto-merge has no diff-scope
check, and auto-merge separately failed to fire on PRs #115-#118 (cause unknown).

## Portable lesson

[multi-worker-delivery](../skills/multi-worker-delivery.md) (compare before
auto-merge; reproduce on current main before "update the branch") and
[verification-gates](../skills/verification-gates.md) (set routing variables in
tests).
