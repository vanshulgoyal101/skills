# Documented Fact Parity

## Trigger

Use this skill when a human-written number or list — a README count, marketing
copy, a repository description, a profile page, SEO text — describes something a
registry or directory already defines in code. "N tools", "N games", "N
countries", a feature list, a supported-provider list.

## Invariant

Every quoted fact about the system equals what the system's source of truth
actually contains. Prose facts have no compiler; they must be tied to one.

## Failure pattern

An entry is added — a new tool, game, route, provider. The registry grows, but
the number is quoted as prose in several other places that are edited by hand and
independently. The copies rot silently. A reader sees "11 games" next to a
ten-game site, or "19 utilities" on a product with 27. Nothing fails; the drift
is caught by a human days later, if at all.

## Recommended method

- Name the single source of truth: the registry (`tool({ id })` calls, hub
  cards, a route table, game folders on disk), not any prose copy of it.
- In the same repository, add a test that counts the source of truth and asserts
  every in-repo document that quotes the number matches it.
- Make the failure message actionable: `README is stale — 27 registered, doc says 26`.
- For copy that lives in *other* repositories (a GitHub profile, a separate
  portfolio) where no single CI can reach it, drop the number and describe the
  thing qualitatively. Keep the exact count only next to the list it counts.
- Prefer a floor ("300+ tests") over an exact figure when the value only grows
  and precision does not matter.

## Discriminating checks

- Mutate the documented number by one; the guard must fail.
- Add a registry entry; the guard must fail until the docs are updated.
- Grep every surface for the number and confirm exactly one authoritative source.

## Common traps

- Counting with a regex that misses entries — numeric slugs under `[a-z-]+`,
  multi-line registration, or ids split across lines.
- Guarding the README but not the SEO title/description that also quotes the number.
- `import.meta.url` resolving to the jsdom document URL under a jsdom test
  environment, so fixture reads hit `/index.html`; resolve fixtures from
  `process.cwd()` or an explicit root instead.
- Related but distinct from [generated-source-parity](generated-source-parity.md):
  that guards machine-generated artifacts against source; this guards
  human-authored assertions against a registry.
