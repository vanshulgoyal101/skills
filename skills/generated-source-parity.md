# Generated and Source Parity

## Trigger

Use this skill when source files produce committed bundles, when a no-build module duplicates a typed registry, or when cache-busted assets are deployed directly.

## Invariant

The artifact served to users reflects the source and the registry contract that generated it.

## Recommended method

- Treat source templates as inputs and built output as a release artifact.
- Build immediately before promotion; never promote an old `dist` after another edit.
- Preflight the entire promotion batch before deleting any served assets: validate allowed targets, fresh build documents, and replacement asset directories. A redirect stub from an earlier promotion is not a build input. This guards missing-input failures, not every possible mid-copy filesystem failure.
- Track source and artifact changes explicitly.
- Add parity tests for duplicated registries: slugs, storage keys, best readers, heal behavior, icons, and game folders on disk.
- Include release build lists, promotion defaults, and database audit readers in registry coverage. Hidden products may still need builds, sync, and integrity checks.
- Derive featured counts from parsed, rendered DOM elements and compare structured metadata to that set. Raw HTML regexes can count commented-out cards or unrelated links.
- Pin non-hashed assets by both query version and content digest.
- Pin no-build CDN imports to known working bundled versions; never float a
	production import like `@vendor/package@latest` or `@vendor/package@2` when a
	CDN rewrites it to transitive submodules at runtime.
- Verify committed HTML references the files that actually exist.
- Test numeric and punctuation-heavy slugs, not only alphabetic examples.

## Discriminating checks

- Add a new game and assert it appears in every required registry.
- In a temporary fixture, promote twice without rebuilding and assert the second attempt leaves served files intact. Give a batch one valid and one incomplete build and assert neither is promoted.
- Mutate one icon path and confirm parity fails.
- Change a no-build module and confirm its version/digest test fails.
- Load the production page in a real browser and check console/network errors
	for CDN submodule failures, not only the top-level module URL.
- Grep the promoted root for stale bundle names.
- Build every consumer of a changed shared module.
- Parse all JSON-LD and check canonical/OG/sitemap routes.
- Fetch deployed bundles referenced by the shipped HTML and compare bytes or digests with the validated local artifacts; workflow success alone does not establish custom-domain freshness.

## Common traps

- Source tests pass while committed `index.html` still points at the old bundle.
- A top-level CDN module returns 200 but imports generated submodules that 404.
- A promotion script fails after a previous promotion replaced `dist` with a redirect stub.
- Text regexes that allow `[a-z-]+` silently omit numeric slugs.
- `git add -A` can sweep another actor's staged or uncommitted work.
