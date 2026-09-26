# Release Checklist

Apply only relevant items plus the repository's required gates. Reuse evidence
for unchanged source/dependency/configuration/runtime inputs; mark exclusions
explicitly. This is not a demand for every kind of check on every release.

- [ ] Worktree and staged paths reviewed.
- [ ] Intended source, dependency-complete scope and unique commits identified. Inspect other worktrees only where they affect integration; preserve unrelated changes.
- [ ] Source defaults, local overrides, and deployed model/configuration values checked separately. Do not copy production credentials to make environments appear synchronized.
- [ ] Branch deployment rules checked before pushing synchronized refs; a detached staging checkout is not an isolated hosted environment.
- [ ] Focused tests pass.
- [ ] Required exact-candidate CI triggered and passed; an untriggered workflow is not a pass. Reuse matching full-suite/build evidence instead of repeating local runs.
- [ ] Relevant changed-consumer builds pass; reruns and unresolved failures are disclosed.
- [ ] Changed generated assets promoted from the appropriate build.
- [ ] Changed cache-busted assets have updated version and digest pins.
- [ ] Metadata/canonical/sitemap/robots checks pass when those surfaces changed.
- [ ] Affected browser workflows have appropriate desktop/mobile evidence; repeat only changed or uncovered behavior.
- [ ] Relevant screenshots inspected; viewport fit, image framing, and canvas pixels checked where DOM presence is insufficient.
- [ ] Deep-link reloads and actual entry/return journeys verified after intro/lazy loading when relevant.
- [ ] Changed keyboard/focus and icon-only accessible names verified.
- [ ] Database target, migration order, affected invariants and compatible code/grants verified when relevant; preserve data and an appropriate recovery path.
- [ ] Docs/catalog updated.
- [ ] Intended changes are committed/published; report remaining owned or concurrent work without resetting/stashing it to manufacture a clean counter.
- [ ] Current authority permits the exact operation. Newer scoped approvals supersede old holds; financial actions are not inferred from deployment permission.
- [ ] Actual deployment SHA identified, including concurrent descendants; workflow conclusion and live invariant verified.
- [ ] Canonical domain mapped to the successful exact-SHA deployment; verify DNS and an actual HTTP request rather than trusting an attached alias. Missing SHA metadata in a CLI summary is not deployment evidence.
- [ ] Read-only smoke results distinguish saved-output retrieval from fresh generation, and historical usage receipts from new charges. Do not spend again merely to verify a release.
