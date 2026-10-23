# Incident: Two-Week CI Stall And Unapplied Provider Setting

- **Date**: 2026-10-06 to 2026-10-21
- **Repository**: AdBrain
- **Severity**: High
- **Status**: Fixed; no watchdog yet

## Symptom

From about 2026-10-13 every PR failed CI on the dependency-audit job, and PRs
#101, #103 and #104 waited about two weeks. Separately, the provider fallback
merged on 2026-10-06 (PR #107) never ran in production: `LLM_PROVIDER_ORDER`
still listed one provider, so Create kept failing on a single slow model.

## Trigger sequence

1. 2026-10-03 to 10-06: braces and source-map-js advisories turn the blocking
   audit red on every branch (#102). PR #105 scopes it: high severity for runtime
   dependencies (`--omit=dev`), critical for the full tree. `npm audit fix --force`
   was rejected because it would downgrade eslint-config-next from 16 to 14.
2. 2026-10-06: PR #107 ships provider fallback and failure codes. DevOps asks
   "tell me the values"; Dev 3 asks "@DevOps please set...". Neither agent is
   running, so neither comment is read.
3. About 2026-10-13: sharp librsvg (GHSA-wq5f-xc86-pv6w) and follow-redirects
   advisories (#106) turn the scoped gate red again. The gate has no active owner.
4. 2026-10-21 15:10Z: the coordinator's check-in starts with CI and production
   settings and finds both.

## Evidence

- Audit failures on every branch in the Actions run list; #102 and #106.
- DevOps reading of production settings in #98: provider order `openrouter` only.
- Coordinator note 2026-10-21 naming the red gate and the comment-only handoffs
  as the cause of the stall.
- After PR #108 reached main but not `dev`, `dev` CI failed 5 times on 2026-10-21
  (for example 7d09494, 25s) until main was merged into `dev` (363d306).

## Root cause

A required check could fail for upstream reasons with no owner who fixes it the
same day, and a cross-owner production setting change was requested only by
comment, with no named owner or follow-up check.

## Fix

- PR #108 patched the dependencies.
- The coordinator set `LLM_PROVIDER_ORDER=openrouter,google,groq`, read it back
  and posted before, after and revert in #98. It went live with the PR #108
  deploy (92d43c1), followed by a passing read-only smoke.
- PR #120 made CI parallel jobs with a build cache (main push runs 164-217s before,
  95-148s after) and made the audit report without blocking.
- Branch protection now requires `build`, `secrets` and `test` with `strict: false`
  (read through the API).

## Regression coverage

None automatic for the process failure. The audit can no longer block merges.
The setting change has a recorded before/after and smoke in #98.

## Residual risk

- No watchdog flags a red main, a stale cross-owner request or an unapplied setting.
- High-severity advisories no longer block merges (accepted trade-off).
- Syncing main into long-lived branches is manual.

## Portable lesson

[ci-merge-throughput](../skills/ci-merge-throughput.md),
[multi-worker-delivery](../skills/multi-worker-delivery.md) (named owner for
cross-owner actions, check-in order) and
[environment-configuration-parity](../skills/environment-configuration-parity.md)
(code that depends on a setting is not live until the setting is).

## Follow-up 2026-10-22

Main-to-dev sync is now automatic: the sync workflow resolves doc-only conflicts
toward main and still fails on code conflicts (#170).
