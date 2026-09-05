# Product Capability Catalog

This is a distilled map of the products in `~/Development/copilot`. It is not a marketing page and does not duplicate implementation docs. Use it to choose the right product surface, reuse a proven capability, and find the owning repository.

## Product Matrix

| Product | Purpose | Stack / delivery | Notable capabilities | Strongest reusable lesson | Source |
|---|---|---|---|---|---|
| **AdBrain** | AI ad creative and Meta lead-generation workflows for local businesses | Next.js, React, TypeScript, Supabase, multi-provider AI, Meta API, Vercel | Brand intake, website autofill, copy/image variants, paused-campaign promotion, spend guards, lead sync, audit logs, SSRF-safe fetching | Provider-agnostic AI with cooldowns and explicit spend/security boundaries | [`adbrain/README.md`](../adbrain/README.md), [`adbrain/docs/ARCHITECTURE.md`](../adbrain/docs/ARCHITECTURE.md) |
| **Tiny Arcade** | Ten small browser games with optional cloud scores and rankings | Vite + TypeScript per game, Supabase, service worker, GitHub Pages | Pure game models, offline shell, account-safe sync, per-mode scores, streaks, ranked leaderboards, registry parity | Cross-game sync correctness requires registry, storage, cache, lifecycle, and DB invariants together | [`arcade/README.md`](../arcade/README.md), [`arcade/FEATURES.md`](../arcade/FEATURES.md) |
| **ctx** | MCP server that turns GitHub repositories and documentation sites into agent-ready context | Cloudflare Worker, TypeScript, JSON-RPC MCP, Readability/Turndown, custom tar parser | Repo/doc packing, ranked passage search, file listing, SSRF-safe crawling, redirect-hop validation | Security normalization must match the fetch runtime, not only the input syntax | [`ctx/README.md`](../ctx/README.md), [`ctx/docs/FEATURES.md`](../ctx/docs/FEATURES.md) |
| **mcp** | MCP server for extracting live web pages as clean Markdown | Cloudflare Worker, TypeScript, Readability/Turndown, Streamable HTTP | Markdown extraction, metadata, links, ranked page search, SSRF defenses | Token-efficient web context with a strict network trust boundary | [`mcp/README.md`](../mcp/README.md), [`mcp/docs/FEATURES.md`](../mcp/docs/FEATURES.md) |
| **Tools** | Privacy-first offline developer toolbox | Static HTML/JS/service worker, Vitest, zero runtime dependencies | 27 local tools, Smart Paste classification, command palette, category browsing, light/dark themes, PWA shortcuts, QR generation/reading, SQL/Python/Markdown/Base32 formatters | Exact shipped-source/test parity plus DOM interaction coverage and cache-isolated browser tests | [`tools/README.md`](../tools/README.md), [`tools/ARCHITECTURE.md`](../tools/ARCHITECTURE.md) |
| **Vanshul Portfolio** | Personal portfolio, 3D hero, project showcase, and markdown blog | React, Vite, styled-components, Framer Motion, React Three Fiber, GitHub Pages | 3D scene, responsive motion, themes, markdown posts, sitemap and JSON-LD | Visual features still need measurable responsive, accessibility, and SEO contracts | [`vanshul-portfolio/README.md`](../vanshul-portfolio/README.md), [`vanshul-portfolio/FEATURES.md`](../vanshul-portfolio/FEATURES.md) |
| **vbrain** | Public demo of a second-brain engine | Cloudflare Worker, Supabase capture, BM25 search, graph, MCP, static SSG | Search operators and typo tolerance, backlinks, graph view, MCP tools, static SEO export, lineage, capture write-through | Separate open-source engine from private content; deterministic validation and release guards | [`vbrain/README.md`](../vbrain/README.md), [`vbrain/site/README.md`](../vbrain/site/README.md) |
| **vbrain-private** | Private personal second brain and durable operating memory | Same engine as vbrain with private Markdown, Supabase and Worker auth | Career/project/idea/infra notes, capture inbox, write-through, health doctor, lineage, strict validation | Product learnings become reusable engineering skills only after verification in real work | [`vbrain-private/README.md`](../vbrain-private/README.md), [`vbrain-private/FEATURES.md`](../vbrain-private/FEATURES.md) |
| **Reader** | Standalone article extraction sibling to the web MCP products | Cloudflare Worker, Readability/Turndown | Clean article Markdown, passage search, link extraction | Shared extraction and security modules should have one contract across products | [`reader/README.md`](../reader/README.md) |
| **Solaride** | Rooftop-solar marketing site and lead capture for North India | Static HTML + CDN Tailwind + vanilla JS, EmailJS, Vitest + jsdom, GitHub Pages | Solar savings + tree-to-energy calculators with downloadable estimate, FAQ with FAQPage schema, Mohali/Hisar service-area landing pages with LocalBusiness schema, tested SEO metadata and sitemap, per-office contacts, branded 404 | Metadata, structured data, and DOM identifier contracts are testable invariants, not manual checks | [`solaride/README.md`](../solaride/README.md), [`solaride/docs/ARCHITECTURE.md`](../solaride/docs/ARCHITECTURE.md) |
| **vanshul-links** | Personal link hub | Static web app | Curated navigation across projects and public surfaces | Link hubs are registries and need route/metadata checks | [`vanshul-links/README.md`](../vanshul-links/README.md) |
| **vanshul-blog** | Personal public writing surface | Static web app | Blog content and publishing surface | Public content needs canonical ownership and deploy verification | [`vanshul-blog/README.md`](../vanshul-blog/README.md) |

## Capability Routing

- Need offline sync, account switching, retries, rankings, or local/cloud reconciliation: start with **Tiny Arcade** and [`cloud-sync-integrity`](skills/cloud-sync-integrity.md).
- Need a multi-provider AI call path: start with **AdBrain** and [`provider-cooldown-rotation`](skills/provider-cooldown-rotation.md).
- Need to fetch a URL safely: start with **ctx/mcp** and [`alternate-ipv4-ssrf-defense`](skills/alternate-ipv4-ssrf-defense.md).
- Need a static tool with no build: start with **Tools** and [`no-build-ship-test-parity`](skills/no-build-ship-test-parity.md).
- Need to test a shipped HTML module's handlers and routes: start with **Tools** and [`shipped-dom-module-testing`](skills/shipped-dom-module-testing.md).
- Need to test an offline PWA in a browser: start with [`service-worker-test-isolation`](skills/service-worker-test-isolation.md).
- Need to format or match user-controlled input safely: start with [`bounded-untrusted-parsing`](skills/bounded-untrusted-parsing.md).
- Need public SEO, content exports, redirects, or JSON-LD: start with **vbrain** and the public-site docs.
- Need URL-to-content extraction with binary rejection and text fallback: start with **Reader/mcp** and the network-boundary skills.
- Need tested SEO metadata, structured data, canonical/sitemap correctness, or to avoid duplicate/doorway pages: start with **Solaride** and [`crawlable-metadata-contracts`](skills/crawlable-metadata-contracts.md).
- Need a personal operating note or a durable development lesson: start with **vbrain-private**, then extract a portable skill only after a test or live check proves it.

## Reusable Product Capabilities

These capabilities are stable enough to guide new product plans. Reuse their contracts and verification expectations; do not copy implementation details blindly.

| Capability | Owning product | Reuse when | Product contract |
|---|---|---|---|
| Multi-provider text generation with cooldowns and model selection | AdBrain | A user-facing workflow depends on external LLM availability, cost, or token budgets | Provider failure is recoverable, selection is observable, and no single provider outage blocks the workflow |
| Swappable image generation providers | AdBrain | Generated visual assets need cost, latency, or availability alternatives | Provider choice is configuration-driven and failures produce an actionable recovery path |
| Generate, review, approve, then launch paused | AdBrain | AI output can create spend, publish content, or affect an external account | Human approval is explicit and external side effects are paused by default |
| Knowledge graph, ranked search, and MCP tools over portable notes | vbrain | Agents or users need durable, searchable knowledge with provenance | Source content remains portable, search is deterministic enough to test, and private boundaries are explicit |
| Deterministic URL-to-clean-Markdown extraction | Reader | Web content must become compact agent context without an LLM | Extraction is bounded, SSRF-safe, and preserves useful article structure |
| Binary-aware content extraction with text fallback | Reader, mcp | A content service receives HTML, Markdown, JSON, XML, or binary URLs | Reject truly binary streams deliberately while preserving usable text-like responses |
| Repository packing with coverage-aware token budgeting | ctx | An agent needs relevant repository context under a token limit | Ranking, truncation, and file inclusion are explainable and bounded |

## Maintenance Rules

- Keep this file at capability level; implementation detail belongs in each product's own docs.
- Add a product only when it has a stable purpose and a real source README or feature document.
- Do not copy secrets, customer data, personal notes, or private implementation details here.
- When a capability changes, update the product's source docs first, then this catalog.
- Source links in this catalog point at sibling repositories in the local workspace;
	the skills repository CI cannot check out those repositories, so it validates the
	catalog's own structure while product CI remains responsible for its source docs.
