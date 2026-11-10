# Incident: Portfolio Redesign and Dependency Refresh

- **Date**: 2026-11-10
- **Repository**: [portfolio](https://github.com/vanshulgoyal101/vanshul-portfolio)
- **Severity**: Maintenance and regression prevention
- **Status**: Validated and pushed as `6e4fc4c`; deployment is a separate check.

## Symptom

The editorial redesign needed consistent page primitives, accessible interaction
states and genuinely lazy heavy dependencies. A subsequent registry check found
outdated direct dependencies, including major build, animation and test releases.

## Trigger sequence

1. Redesign the homepage and secondary pages while retaining existing workflows.
2. Defer the renderer and anonymous SDK; inspect the emitted initial imports.
3. Update dependency manifests and lockfile against current stable registry tags.
4. Run lint, unit, production-build and browser checks on a supported Node runtime.

## Evidence

- [Homepage design](https://github.com/vanshulgoyal101/vanshul-portfolio/commit/1018167),
  [page primitives](https://github.com/vanshulgoyal101/vanshul-portfolio/commit/48497e8)
  and [lazy SDK](https://github.com/vanshulgoyal101/vanshul-portfolio/commit/41ac89c).
- [Dependency refresh](https://github.com/vanshulgoyal101/vanshul-portfolio/commit/6e4fc4c):
  React 19.3.1, Vite 8.3.7, React plugin 6.3.0, Framer Motion 14.12.0,
  Three 0.187.0, Hooks lint 7.1.1 and jsdom 31.0.0.
- Full `npm run check` on Node 24.22.2: 620 unit tests in 71 files;
  70 browser tests passed, 12 intentional project-specific skips; zero audit
  findings. Lint, build and generated-output verification passed.
- Generated-output checks covered 11 published routes, six font sources, the
  eight-item RSS feed and `llms.txt`, plus forbidden eager chunks.
- Earlier local attempts exposed contention and clock/fixture problems; the
  passing final gate used unchanged motion and geometry thresholds, not retries.

## Root cause

- Manual vendor chunking can capture an eager preload helper in a lazy chunk.
- New lint presets detect refs used as render data and effect-driven resets.
- A newer DOM emulator refuses focus on `display: none` elements; a `matchMedia`
  mock alone does not activate mobile CSS.
- Advancing JavaScript timers is not sufficient evidence for rendered browser
  animation progress. Heavy unrelated scenes further obscure focused checks.
- A no-JavaScript shelf test duplicated a book count and missed a content addition.

## Fix

- Share design primitives, authored publishing facts and metadata builders.
- Keep preload helpers separate and initialize the anonymous SDK on first use
  through a shared, retryable promise.
- Use lazy state for the greeting sequence. Associate article counts with the
  current slug; reset dashboard requests at their owning input/auth/refresh event.
- Preserve loaded metrics on same-owner token refresh and restart loading after
  actual sign-out/sign-in.
- Show the mobile toggle in the unit fixture, retain real viewport focus checks,
  and sample actual rocket frames without the separately tested WebGL hero.
- Derive the static shelf assertion from the content source. Bound unit workers
  rather than increasing assertion timeouts on a contended machine.

## Regression coverage

Run `npm run check` on the declared engine range
`^22.22.2 || ^24.15.0 || >=26.0.0`.
Focused cases cover A -> B -> A counts, stale completions, token refresh,
re-authentication, range-loading controls, keyboard focus, motion displacement,
nozzle geometry, repeated launches and no-JavaScript publishing.

## Residual risk

Full registry metadata found two deliberate exceptions: ESLint and `@eslint/js`
remain at 9.39.5 because the latest React lint plugin does not support ESLint 10.
Follow-up [`de4d28d`](https://github.com/vanshulgoyal101/vanshul-portfolio/commit/de4d28d)
updates checkout/setup-node/configure-pages/upload-pages-artifact/deploy-pages
to current Node-24-based action majors and removes forced runtime overrides.
Workflow YAML and artifact/deployment gates were checked before the push.

Registry tags change after this dated audit. Local tests do not establish search
rank, field performance, live OAuth/contact delivery or production SQL grants.
Anonymous counts remain untrusted. Self-hosted font licences and a guarded
stale-chunk reload are documented in the source project, not inferred from npm.

## Portable lesson

- [Lazy bundle boundaries](../skills/lazy-bundle-boundaries.md)
- [Dependency refresh contracts](../skills/dependency-refresh-contracts.md)
- [Visual motion constraints](../skills/visual-motion-constraints.md)
- [Accessible interaction contracts](../skills/accessible-interaction-contracts.md)
- [Crawlable metadata contracts](../skills/crawlable-metadata-contracts.md)
- [Cache version parity](../skills/cache-version-parity.md)
- [Generated and source parity](../skills/generated-source-parity.md)
