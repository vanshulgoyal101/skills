# Dependency Refresh Contracts

## Trigger

Use when refreshing dependencies, particularly across build-tool, lint-plugin,
DOM-emulator, animation or rendering-library major versions.

## Invariant

A dependency upgrade preserves runtime behavior, declared engine compatibility
and executable release contracts. Installing successfully is not verification.

## Failure pattern

A bulk update installs packages that require a newer Node patch. A lint preset
changes from flat to legacy at the old export path, and a newer DOM emulator
correctly refuses to focus a CSS-hidden control. Treating every failure as a
tooling nuisance hides real regressions.

## Recommended method

1. Query registry `latest` tags, peer ranges, optional peers and engine ranges.
   Record the audit date; "latest" is not a permanent property.
   Cross-check full registry metadata rather than relying solely on `npm outdated`:
   its abbreviated metadata can report a different `latest` tag. Include CI
   actions and other execution dependencies, not only the package manifest.
2. Update manifests and lockfiles together. Validate on a supported runtime and
   align local setup documentation and CI with the declared engine floor.
3. Run focused tests for changed boundaries before the full release gate.
4. Migrate lint config exports explicitly. For example, Hooks 7 flat config uses
   `reactHooks.configs.flat['recommended-latest']`, not the legacy preset path.
5. Investigate newly detected code issues rather than disabling whole rules.
   Stable render data belongs in lazily initialized state, not a render-read ref.
6. Keep request results associated with the current input. Reset loading/error
   state in the owning auth/input/refresh event; publish async results only while
   their request is current.
7. Separate emulator limitations from browser behavior. A mocked media query does
   not apply responsive CSS; show the relevant control in the unit fixture and
   retain real viewport/focus checks in a browser.
8. Rebuild, verify generated output, run browser tests, audit and check registry
   versions again. Report incompatible exceptions rather than claiming success.

## Discriminating checks

- A -> B -> A input changes while B is pending must not reveal stale A results.
- Token refresh for the same owner must not clear loaded dashboard data.
- Range changes must clear stale metrics and disable refresh/export until ready.
- Test focus with CSS active, not only `document.activeElement` on an artificial
   node. Preserve the same focus assertion when correcting a fixture.
- Check emitted preload boundaries after build-tool upgrades.

## Common traps

- Confusing `wanted` within the old semver range with the registry's newest major.
- Treating `EBADENGINE` warnings as supported execution.
- Raising test timeouts before distinguishing parallel-machine load from a bug.
- Replacing precise regressions with mocks that always return success.
- Stating a clean audit proves live database authorization or external delivery.

## Compatibility example

On 2026-11-10, full registry metadata exposed ESLint 10.14.0 even though
`npm outdated` did not flag the installed 9.39.5 release. The latest React lint
plugin still declared support only through ESLint 9. Retain the compatible
ESLint/core-config pair and document the blocker; do not use forced peer
resolution or replace a working lint stack merely to claim every number is newest.

## Evidence

The portfolio's Vite 8, React plugin 6, Hooks 7 and jsdom 31 refresh exposed the
legacy preset path, render-read refs and hidden-toggle unit fixture. The corrected
release contracts live in [configuration](https://github.com/vanshulgoyal101/vanshul-portfolio/blob/main/documentation/config.md)
and [tests](https://github.com/vanshulgoyal101/vanshul-portfolio/blob/main/documentation/testing.md).
