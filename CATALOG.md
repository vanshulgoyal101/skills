# Skills Catalog

This catalog is the routing layer for the repository. Add one line here whenever new knowledge lands.

## Skills

| Skill | Use when | Source |
|---|---|---|
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
| [alternate-ipv4-ssrf-defense](skills/alternate-ipv4-ssrf-defense.md) | A URL fetcher blocks private or reserved network ranges | ctx, MCP |
| [no-build-ship-test-parity](skills/no-build-ship-test-parity.md) | A static product ships source files directly with no build step | Tools |
| [bounded-untrusted-parsing](skills/bounded-untrusted-parsing.md) | User input is parsed, formatted, matched, or scanned under resource constraints | AdBrain, Tools |
| [service-worker-test-isolation](skills/service-worker-test-isolation.md) | Browser tests share service workers, caches, or persistent contexts | Arcade |
| [shipped-dom-module-testing](skills/shipped-dom-module-testing.md) | UI behavior lives in a directly shipped HTML module and pure tests miss wiring | Tools, Arcade |
| [evidence-first-development-plans](skills/evidence-first-development-plans.md) | A change spans multiple modules or the owning behavior is not yet clear | Cross-repo workflow |
| [runtime-resource-lifecycle](skills/runtime-resource-lifecycle.md) | Servers, browser sessions, timers, workers, tests, or subscriptions can outlive their owner | AdBrain, Arcade, VS Code |
| [environment-configuration-parity](skills/environment-configuration-parity.md) | Behavior depends on env vars, deployment settings, provider models, flags, or cron | AdBrain, Vercel |
| [security-boundary-contracts](skills/security-boundary-contracts.md) | Auth, tenant scope, URL fetching, browser automation, storage, or external APIs cross a trust boundary | ctx, MCP, vbrain, AdBrain |
| [product-capability-distillation](skills/product-capability-distillation.md) | Reusable product capabilities need to be recorded without copying implementation or private data | Skills repository |
| [product-registry-maintenance](skills/product-registry-maintenance.md) | A public product family has a portfolio, links hub, sitemap, and live domains to keep aligned | Portfolio family |
| [public-indexing-hygiene](skills/public-indexing-hygiene.md) | Public routes, canonicals, sitemaps, robots rules, or private surfaces affect discoverability | Portfolio family, vbrain |
| [search-console-release-gates](skills/search-console-release-gates.md) | A public release changes crawlability or canonical URL ownership | Portfolio family |

## Checklists

- [new-feature](checklists/new-feature.md)
- [bug-fix](checklists/bug-fix.md)
- [release](checklists/release.md)
- [data-sync](checklists/data-sync.md)
- [repository-intake](checklists/repository-intake.md)

## Templates

- [skill](templates/skill.md)
- [incident](templates/incident.md)
- [development-plan](templates/development-plan.md)

## Incidents

- [arcade-sync-and-integrity](incidents/arcade-sync-and-integrity.md)
- [arcade-ui-and-lifecycle](incidents/arcade-ui-and-lifecycle.md)
- [vbrain-capture-marked-filed](incidents/vbrain-capture-marked-filed.md)
- [vbrain-jsonld-injection](incidents/vbrain-jsonld-injection.md)
- [ui-edit-generated-index-drift](incidents/ui-edit-generated-index-drift.md)
- [adbrain-list-delimiter-corruption](incidents/adbrain-list-delimiter-corruption.md)
- [ssrf-alternate-ipv4-bypass](incidents/ssrf-alternate-ipv4-bypass.md)
- [public-indexing-hygiene](incidents/public-indexing-hygiene.md)
- [adbrain-provider-and-cron-configuration](incidents/adbrain-provider-and-cron-configuration.md)
- [orphaned-development-server-memory](incidents/orphaned-development-server-memory.md)
- [public-indexing-hygiene](incidents/public-indexing-hygiene.md)

## Products

- [PRODUCT_CATALOG](PRODUCT_CATALOG.md)

## Sources

- [SOURCES.md](SOURCES.md): repository intake map and planned learning areas.
