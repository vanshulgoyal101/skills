# Search Console Release Gates

## Trigger

Use this skill when a site is public-facing, has SEO requirements, or has a sitemap/robots/canonical release path that affects discoverability.

## Invariant

Before a public release is considered complete, the site must be discoverable through the intended canonical route and should not leak redirect-only or private URLs into the public index.

## Failure pattern

A site is deployed and seems healthy, yet Google Search Console reports indexing issues because one of these conditions is true:

- `noindex` is set while a sitemap references the same page;
- a redirected page remains in the sitemap;
- the canonical URL points to the wrong host or route;
- a worker or public endpoint is hidden behind a too-strict robots policy;
- a new public project is live but absent from the family master index.

## Recommended method

- Validate the canonical route and production sitemap together.
- Keep a single public sitemap source per domain family.
- Use a live smoke test to verify 200/redirect behavior before and after deploy.
- Keep robots rules aligned with the true product intent.
- Review Search Console symptoms as a system issue, not a mere SEO formatting issue.

## Discriminating checks

- Confirm no sitemap entry points to a `noindex` or redirect page.
- Confirm the canonical URL matches the production host and route.
- Verify a worker route intended for crawlers (for example `/mcp`) is allowed while private health endpoints remain hidden.
- Verify the public family sitemap index contains all active sites.
- Inspect one real URL from Search Console results and compare it to the actual live response.

## Common traps

- Fixing the symptom in one page while leaving the sitemap index stale.
- Treating Search Console warnings as purely cosmetic.
- Generating a sitemap from a stale local list.
- Assuming a route is safe to index because it returns 200.

## Evidence

The `blog.vanshul.com` and `mcp` issues were both rooted in mismatches between the public route, robots policy, and the generated sitemap or output behavior. The root fix was not “SEO styling”; it was route hygiene and a verified deployment check.
