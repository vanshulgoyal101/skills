# Skills Catalog

This catalog is the routing layer for the repository. Add one line here whenever new knowledge lands.

## Portfolio Learning Routes

- Established-UI refactors: [design intent](skills/design-intent-preservation.md), [rendered evidence](skills/rendered-ui-evidence.md), and [motion lifecycle](skills/visual-motion-constraints.md).
- Navigation and controls: [lazy hash restoration](skills/header-offset-scroll-guards.md), [focus and target geometry](skills/accessible-interaction-contracts.md), and [preference precedence](skills/runtime-storage-boundaries.md).
- Publishing: [runtime/static metadata parity](skills/build-artifact-parity.md), [exact redirect destinations](skills/crawlable-metadata-contracts.md), and [honest reruns/concurrent deployment identity](skills/verification-gates.md).
- Evidence and remaining uncertainty: [portfolio shelf and release](incidents/portfolio-shelf-and-release.md).

## Skills

| Skill | Use when | Source |
|---|---|---|
| [design-intent-preservation](skills/design-intent-preservation.md) | Refactoring established UI, preserving signature features, or separating content collections | Vanshul Portfolio |
| [rendered-ui-evidence](skills/rendered-ui-evidence.md) | DOM visibility cannot prove viewport fit, media framing, canvas motion, or control usability | Vanshul Portfolio |
| [async-lifecycle-guards](skills/async-lifecycle-guards.md) | Timers, promises, animations, rAF loops, or delayed callbacks can outlive a view/run | Tiny Arcade |
| [runtime-storage-boundaries](skills/runtime-storage-boundaries.md) | JSON/localStorage/cache data enters typed code | Tiny Arcade |
| [cloud-sync-integrity](skills/cloud-sync-integrity.md) | Offline retries, account switching, restore, ranking, or optimistic sync are involved | Tiny Arcade |
| [database-invariants](skills/database-invariants.md) | A database trigger/RPC/cap/constraint defines correctness | Tiny Arcade |
| [generated-source-parity](skills/generated-source-parity.md) | Source, bundles, registries, assets, or cache-busted files can drift | Tiny Arcade |
| [mobile-input-and-motion](skills/mobile-input-and-motion.md) | Pointer/swipe/keyboard input and animated feedback share a surface | Tiny Arcade |
| [accessible-interaction-contracts](skills/accessible-interaction-contracts.md) | Controls, focus rings, icon-only buttons, modals, or dynamic state are changed | Tiny Arcade |
| [verification-gates](skills/verification-gates.md) | Any cross-module or production-facing change needs a release plan | Tiny Arcade |
| [duplicated-registry-parity](skills/duplicated-registry-parity.md) | The same runtime registry exists in multiple files or languages | Tiny Arcade |
| [aggregate-metric-healing](skills/aggregate-metric-healing.md) | Local state has independent metrics but the server stores only an aggregate | Tiny Arcade |
| [cache-version-parity](skills/cache-version-parity.md) | Non-hashed assets, service workers, or query-string cache versions change | Tiny Arcade |
| [semantic-delimiter-safety](skills/semantic-delimiter-safety.md) | Free-text list values can contain the chosen delimiter | AdBrain |
| [provider-cooldown-rotation](skills/provider-cooldown-rotation.md) | Multiple API providers, models, or keys can serve one operation | AdBrain |
| [task-aware-llm-routing](skills/task-aware-llm-routing.md) | Different LLM tasks have different quality, latency, or cost requirements | AdBrain |
| [validated-multimodal-generation](skills/validated-multimodal-generation.md) | Model output controls an expensive image/audio/video artifact and must stay grounded | AdBrain |
| [external-api-error-contracts](skills/external-api-error-contracts.md) | Provider errors, labels, capabilities, or destinations cross into customer workflows | AdBrain |
| [alternate-ipv4-ssrf-defense](skills/alternate-ipv4-ssrf-defense.md) | A URL fetcher blocks private or reserved network ranges | ctx, MCP |
| [shared-security-parity](skills/shared-security-parity.md) | Sibling services implement the same security boundary independently | Reader, MCP, ctx |
| [no-build-ship-test-parity](skills/no-build-ship-test-parity.md) | A static product ships source files directly with no build step | Tools |
| [bounded-untrusted-parsing](skills/bounded-untrusted-parsing.md) | User input is parsed, formatted, matched, or scanned under resource constraints | AdBrain, Tools |
| [service-worker-test-isolation](skills/service-worker-test-isolation.md) | Browser tests share service workers, caches, or persistent contexts | Arcade |
| [shipped-dom-module-testing](skills/shipped-dom-module-testing.md) | UI behavior lives in a directly shipped HTML module and pure tests miss wiring | Tools, Arcade |
| [env-validation-schema](skills/env-validation-schema.md) | Environment variables, provider settings, URLs, limits, or deployment configuration enter runtime code | AdBrain |
| [supabase-rls-complete](skills/supabase-rls-complete.md) | A shared database or storage layer serves multiple users or tenants | AdBrain |
| [pure-logic-dom-split](skills/pure-logic-dom-split.md) | Browser behavior mixes business rules, rendering, input, timers, or persistence | Arcade, Tools |
| [service-worker-deploy-pattern](skills/service-worker-deploy-pattern.md) | A static site or PWA caches shells and assets across deployments | Tools, Arcade |
| [zero-dependency-ci-validators](skills/zero-dependency-ci-validators.md) | Repository integrity checks must run before dependency installation or in CI | vbrain, Skills |
| [codec-invertibility-tests](skills/codec-invertibility-tests.md) | Values are encoded, decoded, escaped, formatted, or serialized | Tools, AdBrain |
| [sitemap-aware-discovery](skills/sitemap-aware-discovery.md) | A crawler or context builder must discover pages beyond linked navigation | ctx |
| [crawlable-metadata-contracts](skills/crawlable-metadata-contracts.md) | Public pages need consistent, valid titles, canonical URLs, JSON-LD, robots, and sitemap entries | Portfolio family, vbrain |
| [dom-identifier-contracts](skills/dom-identifier-contracts.md) | Multiple widgets or form controls can collide through shared IDs or DOM property names | Solaride, portfolio |
| [multi-encoding-literal-rotation](skills/multi-encoding-literal-rotation.md) | A shared literal changes across display, links, attributes, URL encoding, and structured data | Solaride |
| [documented-fact-parity](skills/documented-fact-parity.md) | A README/copy/description/profile quotes a count or list that a code registry already defines | Tools, Arcade |
| [rasterized-social-preview](skills/rasterized-social-preview.md) | A page sets og:image/twitter:image, especially authored as SVG | vbrain |
| [security-response-headers](skills/security-response-headers.md) | Browser-facing HTML needs a tested and live-verified security-header baseline | AdBrain, vbrain |
| [reference-integrity-checks](skills/reference-integrity-checks.md) | Assets and internal links must resolve in the deployed output | AdBrain, vbrain |
| [hydration-determinism](skills/hydration-determinism.md) | SSR/SSG output depends on time, timezone, locale, randomness, or browser state | AdBrain |
| [budget-aware-provider-routing](skills/budget-aware-provider-routing.md) | Paid AI tasks need explicit cost tiers, quotas, and fail-closed budget routing | AdBrain |
| [idempotent-tenant-isolated-seeding](skills/idempotent-tenant-isolated-seeding.md) | Demo data is seeded into an auth- and RLS-protected multi-tenant database | AdBrain |
| [coverage-first-passage-ranking](skills/coverage-first-passage-ranking.md) | Multi-term passage search must reward distinct query-term coverage | ctx, MCP |
| [evidence-first-development-plans](skills/evidence-first-development-plans.md) | A change spans multiple modules or the owning behavior is not yet clear | Cross-repo workflow |
| [runtime-resource-lifecycle](skills/runtime-resource-lifecycle.md) | Servers, browser sessions, timers, workers, tests, or subscriptions can outlive their owner | AdBrain, Arcade, VS Code |
| [environment-configuration-parity](skills/environment-configuration-parity.md) | Behavior depends on env vars, deployment settings, provider models, flags, or cron | AdBrain, Vercel |
| [native-runtime-deployment-parity](skills/native-runtime-deployment-parity.md) | Native modules or platform-specific optional dependencies run in serverless production | AdBrain, Vercel |
| [security-boundary-contracts](skills/security-boundary-contracts.md) | Auth, tenant scope, URL fetching, browser automation, storage, or external APIs cross a trust boundary | ctx, MCP, vbrain, AdBrain |
| [product-capability-distillation](skills/product-capability-distillation.md) | Reusable product capabilities need to be recorded without copying implementation or private data | Skills repository |
| [header-offset-scroll-guards](skills/header-offset-scroll-guards.md) | Fixed headers or hash navigation hide content beneath the navigation | Vanshul Portfolio |
| [visual-motion-constraints](skills/visual-motion-constraints.md) | Decorative motion or cursor effects overpower the interface or ignore reduced-motion preferences | Vanshul Portfolio |
| [build-artifact-parity](skills/build-artifact-parity.md) | Generated public artifacts like sitemaps, feeds, or OG files drift from the source of truth | Vanshul Portfolio |
| [product-registry-maintenance](skills/product-registry-maintenance.md) | A public product family has a portfolio, links hub, sitemap, and live domains to keep aligned | Portfolio family |
| [public-indexing-hygiene](skills/public-indexing-hygiene.md) | Public routes, canonicals, sitemaps, robots rules, or private surfaces affect discoverability | Portfolio family, vbrain |
| [search-console-release-gates](skills/search-console-release-gates.md) | A public release changes crawlability or canonical URL ownership | Portfolio family |

## Checklists

- [new-feature](checklists/new-feature.md)
- [bug-fix](checklists/bug-fix.md)
- [release](checklists/release.md)
- [data-sync](checklists/data-sync.md)
- [repository-intake](checklists/repository-intake.md)
- [product-readiness](checklists/product-readiness.md)

## Templates

- [skill](templates/skill.md)
- [incident](templates/incident.md)
- [development-plan](templates/development-plan.md)

## Incidents

- [adbrain-brand-identity-parity](incidents/adbrain-brand-identity-parity.md)
- [portfolio-shelf-and-release](incidents/portfolio-shelf-and-release.md)
- [arcade-sync-and-integrity](incidents/arcade-sync-and-integrity.md)
- [arcade-ui-and-lifecycle](incidents/arcade-ui-and-lifecycle.md)
- [vbrain-capture-marked-filed](incidents/vbrain-capture-marked-filed.md)
- [vbrain-jsonld-injection](incidents/vbrain-jsonld-injection.md)
- [ui-edit-generated-index-drift](incidents/ui-edit-generated-index-drift.md)
- [adbrain-list-delimiter-corruption](incidents/adbrain-list-delimiter-corruption.md)
- [ssrf-alternate-ipv4-bypass](incidents/ssrf-alternate-ipv4-bypass.md)
- [documented-count-drift](incidents/documented-count-drift.md)
- [vbrain-svg-social-card](incidents/vbrain-svg-social-card.md)
- [adbrain-open-internal-endpoint](incidents/adbrain-open-internal-endpoint.md)
- [adbrain-managed-db-autopause](incidents/adbrain-managed-db-autopause.md)
- [public-indexing-hygiene](incidents/public-indexing-hygiene.md)
- [adbrain-provider-and-cron-configuration](incidents/adbrain-provider-and-cron-configuration.md)
- [adbrain-creative-generation-harness](incidents/adbrain-creative-generation-harness.md)
- [adbrain-production-native-runtime](incidents/adbrain-production-native-runtime.md)
- [orphaned-development-server-memory](incidents/orphaned-development-server-memory.md)
- [solaride-static-site-hardening](incidents/solaride-static-site-hardening.md)
- [vanshul-portfolio-navigation-and-motion](incidents/vanshul-portfolio-navigation-and-motion.md)
- [adbrain-startup-configuration](incidents/adbrain-startup-configuration.md)
- [rls-policy-coverage](incidents/rls-policy-coverage.md)
- [codec-data-corruption](incidents/codec-data-corruption.md)
- [reader-alternate-ipv4-ssrf](incidents/reader-alternate-ipv4-ssrf.md)

## Products

- [PRODUCT_CATALOG](PRODUCT_CATALOG.md)

## Sources

- [SOURCES.md](SOURCES.md): repository intake map and planned learning areas.
