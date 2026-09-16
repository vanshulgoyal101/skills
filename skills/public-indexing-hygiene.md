# Public Indexing Hygiene

## Trigger

Use this skill when a product, portfolio, or family of public sites has multiple canonical URLs, sitemap generators, robots rules, or Search Console indexing checks to keep in sync.

## Invariant

Every page that is intentionally visible to search is live, canonical, and declared consistently in the sitemap, robots policy, and page metadata. Private endpoints, redirect-only surfaces, and health-check routes are excluded from public discovery.

## Failure pattern

A site appears to be live and published, but search results are inconsistent because one of these is wrong:

- the sitemap still lists a redirect or noindex page;
- a page is canonicalized to the wrong domain or route;
- `robots.txt` or X-Robots-Tag blocks the crawler path that should be open;
- a new public repo is launched but never added to the family sitemap index;
- a service or API endpoint is accidentally treated as a public product page.

## Recommended method

1. Define the canonical owner for each public surface and keep one sitemap source of truth per domain family.
2. Exclude private endpoints, health-checks, and redirect pages from public indexing.
3. Put the live site family in a master sitemap index rather than maintaining a scattered set of ad hoc files.
4. Verify the production route with a real HTTP check before calling the release ready.
5. Treat URL hygiene as a release gate, not a one-off SEO cleanup.
6. Generate article routes, sitemap entries and related navigation from one content registry. Derive product facts from their owning constants; use real content-edit dates, not a new modification timestamp on every request.
7. Keep authorization independent of discovery policy. Use page metadata and response headers for noindex surfaces; robots exclusions neither protect private data nor guarantee removal from search.

## Discriminating checks

- `curl -I https://example.com/` and `curl -I https://example.com/sitemap.xml` should return the expected HTTP status and canonical path.
- `robots.txt` should permit intended public routes. Where a crawler must observe `noindex`, ensure robots rules do not prevent that fetch; protect private content with authentication regardless.
- A page marked `noindex` must not also appear in the canonical public sitemap.
- Every newly launched site should appear in the master sitemap list and in the product registry.
- A worker root or app endpoint should be smoke-tested for the public vs. private boundary before deployment.
- Check unknown article slugs return 404, JSON-LD parses, and guide dimensions match the runtime product registry. Repeated sitemap requests must not invent new content-edit dates.

## Common traps

- Updating a product repo without updating the master sitemap index.
- Keeping a `noindex` page in a generated sitemap.
- Letting redirect-only pages remain in search discovery.
- Over-blocking a public API or worker path that is intentionally crawlable or announced.
- Assuming a page is indexed because it is live; canonical URL and route ownership are mandatory.
- Treating noindex or robots rules as access control, or technical SEO as a promise of search ranking.

## Evidence

The recent public-surface work around the `vanshul.com` family exposed the real failure pattern: stale sitemap entries, contradictory `noindex` behavior, and a worker route that was over-restricted. The fix was to align the canonical route, list only live public pages, and validate the discovered URLs with live HTTP checks before release.

AdBrain commit `1909ef0` (2026-09-16) replaces request-time sitemap dates with content-owned dates and adds registry-driven guides, shared product dimensions, and private-surface noindex directives. Its dated audit distinguishes local route/browser checks from production canonical verification and search ranking.
