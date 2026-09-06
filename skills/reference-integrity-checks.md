# Reference Integrity Checks

## Trigger

Use this when source files reference static assets, icons, manifests, internal links, generated routes, or public files that must exist after deployment.

## Invariant

Every referenced asset and internal route resolves to a real served file or generated route.

## Failure pattern

A favicon, image, manifest, stylesheet, or internal link is correct-looking in source but 404s in production. The application still builds because ordinary compilers do not resolve arbitrary HTML and string references.

## Recommended method

- Collect references from the source using the same formats the product emits.
- Build the served-file and generated-route set from the filesystem/build output.
- Compare the two sets in a test and fail on unresolved references.
- Include root-relative assets, nested note routes, sitemap URLs, icons, and manifest members.
- Run the check against the production response for high-value public sites.

## Discriminating checks

- Add a missing asset reference and assert the test fails.
- Delete a referenced public asset and assert failure.
- Add an internal link to a retired route and assert the route/link check fails.
- Fetch the production URL set after deploy and assert non-404 responses.

## Common traps

- Checking only imports; HTML attributes and Markdown links are also references.
- Allowing a regex that misses numeric or underscored route slugs.
- Treating a redirect as success when the canonical URL should be the final URL.
- Testing source paths but not the generated `dist` or CDN paths.

## Evidence

AdBrain fixed a missing `/favicon.ico` and generalized the test in `94a9f7d` and `f5ec9b6`; vbrain added a dead-internal-link build gate in `b07958d`.
