# Build Artifact Parity

## Trigger

Use this skill when a product generates deployable or discoverability artifacts such as sitemaps, feeds, OG images, manifests, or static route output.

## Invariant

Generated artifacts must match the source of truth for routes, metadata, and deployment state before the site is published.

## Failure pattern

The source is valid, but the build writes stale generated files, an old sitemap, or artifacts from an earlier content state. The product ships with missing pages, stale metadata, bad canonical ownership, or broken public indexing despite a green source build.

## Recommended method

- Treat generated output as a real product artifact, not a disposable build byproduct.
- Keep route and metadata generation in one reproducible script or build step.
- Validate the generated artifact set before deployment and after release.
- Record the commands used to generate and check the output so regression risk is visible.
- Share metadata derivation across runtime and prerender consumers. Shared content alone is insufficient if separate renderers select different subsets or schema types.
- For mixed collections, verify each entry's name, type, and original URL as well as the total. Do not label essays as books merely because the original collection contained only books.
- Inspect the full build lifecycle: a later legacy generator can overwrite an earlier correct sitemap or shell. Assign one authoritative producer per artifact.

## Discriminating checks

- Run the product build and inspect the generated route list or sitemap.
- Confirm the live deploy contains the same public routes as the generator output.
- Diff generated files from the previous release and review any unrelated drift.
- Verify a page or product addition appears in both the source registry and the generated output.
- Parse direct-route HTML before hydration; compare its metadata with the runtime source of truth.
- Verify every sitemap route resolves to the intended generated shell, not a generic fallback or redirect.

## Common traps

- Editing generated output by hand instead of fixing the generator.
- Shipping without checking the generated public surface.
- Assuming the build is correct because the TypeScript or JS checks pass.
- Forgetting to include a deploy-time validation step for SEO, canonical, or manifest files.

## Evidence

The portfolio and public-site family required generated sitemap and SEO output to stay aligned with the live product registry. The fix was to treat generation as part of the product contract and validate it before deployment.

The shelf later displayed 20 entries while its static schema still described 12 books. Shared metadata derivation and generated-name/type/URL assertions fixed the mismatch. See [portfolio shelf and release](../incidents/portfolio-shelf-and-release.md).
