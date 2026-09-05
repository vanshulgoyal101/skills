# Product Registry Maintenance

## Trigger

Use this skill when a portfolio, links hub, or public product family grows across multiple repos or domains and needs a single, reliable registry of active live surfaces.

## Invariant

The product registry reflects only live public destinations and stays consistent with the sitemap index, link hub, and deployment state.

## Failure pattern

A new product is launched or a site is moved, but the registry still names the old destination, the links page is stale, or the sitemap omits the live route. This creates a partial truth: the site exists, but the ecosystem cannot find or describe it consistently.

## Recommended method

- Maintain one product catalog or master sitemap list for the live family.
- Update the links page, domain registry, and sitemap together.
- Keep the list of live URLs explicit and intentional instead of relying on memory or old build output.
- When a project is private, redirect-only, or deprecated, remove it from the public registry and verify the redirect path.

## Discriminating checks

- Compare the live site list against the master sitemap list and the public links page.
- Check every route returns 200 or a deliberate redirect target.
- Confirm each public page appears exactly once in the source of truth.
- Review whether the same project is listed under multiple names or domains.

## Common traps

- Adding a product to one repo but forgetting the master sitemap index.
- Forgetting to update `vanshul-links` after a new live service is deployed.
- Keeping dead or redirect-only links in the public navigation because they are historically familiar.
- Treating repository existence as product readiness.

## Evidence

The `vanshul-links` and `vanshul-portfolio` family work showed that the registry must be maintained as a real product artifact, not as a static note. Live entries like `adbrain`, `ctx`, `mcp`, and `vbrain` were deliberately added only after they were validated as public and indexable.
