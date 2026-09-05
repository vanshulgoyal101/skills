# Generated and Source Parity

## Trigger

Use this skill when source files produce committed bundles, when a no-build module duplicates a typed registry, or when cache-busted assets are deployed directly.

## Invariant

The artifact served to users reflects the source and the registry contract that generated it.

## Recommended method

- Treat source templates as inputs and built output as a release artifact.
- Build immediately before promotion; never promote an old `dist` after another edit.
- Track source and artifact changes explicitly.
- Add parity tests for duplicated registries: slugs, storage keys, best readers, heal behavior, icons, and game folders on disk.
- Pin non-hashed assets by both query version and content digest.
- Verify committed HTML references the files that actually exist.
- Test numeric and punctuation-heavy slugs, not only alphabetic examples.

## Discriminating checks

- Add a new game and assert it appears in every required registry.
- Mutate one icon path and confirm parity fails.
- Change a no-build module and confirm its version/digest test fails.
- Grep the promoted root for stale bundle names.
- Build every consumer of a changed shared module.
- Parse all JSON-LD and check canonical/OG/sitemap routes.

## Common traps

- Source tests pass while committed `index.html` still points at the old bundle.
- A promotion script fails after a previous promotion replaced `dist` with a redirect stub.
- Text regexes that allow `[a-z-]+` silently omit numeric slugs.
- `git add -A` can sweep another actor's staged or uncommitted work.
