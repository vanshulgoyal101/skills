# Cache Version Parity

## Trigger

When non-hashed JavaScript, CSS, service-worker assets, or shared modules are cache-busted with query-string versions or manual cache names.

## Invariant

Every reference to one asset uses the same version, and that version identifies the exact content being served.

## Failure pattern

A page or error document retains an old `?v=` while the main page points at a new version. A service worker then caches two generations of the same asset, producing route-dependent behavior that is hard to reproduce locally.

## Recommended method

1. Derive the version from a content digest where practical.
2. Scan every HTML, JS import, service-worker precache list, and error page reference.
3. Update all references atomically with the asset.
4. Test the cache strategy with an old asset already present.
5. Prefer hashed filenames or a build manifest when the project can support them.

## Discriminating checks

- Hash the asset and compare the committed version in every reference.
- Assert all importers use one version for shared modules.
- Include `404.html`, offline shells, manifests, and service-worker lists in the scan.
- Build from a clean checkout and assert the promoted output contains the new digest.

## Common traps

- Updating only the happy-path index page.
- Treating a query string as documentation rather than a cache key.
- Bumping a version without changing content, which hides stale references instead of proving freshness.
- Testing in a clean browser with no old cache.

## Evidence

Tiny Arcade's `tests/asset-version.test.ts` caught drift between `index.html`, `404.html`, shared imports, and the service-worker cache.