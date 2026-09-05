# Crawlable Metadata Contracts

## Trigger

Use this skill when a page must rank or be shared: titles, meta descriptions, canonical URLs, hreflang, Open Graph/Twitter cards, JSON-LD structured data, `robots`, and the sitemap. Especially when a site adds pages, clones a template, or spins up location/landing pages.

## Invariant

Every indexable page has exactly one `<h1>`, a unique length-bounded `<title>` and description, an absolute self-referential `canonical`, machine-valid JSON-LD that agrees with the visible content, and exactly one entry on the canonical HTTPS host in the sitemap. Non-indexable pages declare it. These properties are asserted by tests, not eyeballed.

## Failure pattern

Two pages clone the same marketing sections and compete for one query (duplicate content); a JSON-LD block silently fails to parse or drifts from the DOM it describes; a `canonical` is missing, relative, or points at the wrong host; a new page never reaches the sitemap; titles overrun and truncate in results; or many thin near-duplicate location pages become doorway pages. Everything looks fine in a browser while search ranking quietly degrades.

## Recommended method

- Drive assertions from a per-page table (path -> expected canonical) parsed in a DOM/jsdom test against the shipped HTML.
- `JSON.parse` every `application/ld+json` block and assert its `@type`, plus that counts match the DOM (e.g. `FAQPage.mainEntity.length === number of accordion items`).
- Validate the sitemap is well-formed XML whose `loc` set equals the indexable-page set, each on the canonical HTTPS origin.
- Give each page unique primary content and real intent; only add a location page where there is genuine local content.
- Bound title/description length and require the geo/brand keyword where relevant.

## Discriminating checks

- `JSON.parse` each JSON-LD block; a malformed block fails the suite.
- Assert exactly one `<h1>`; assert description length within a sane range (~50-165 chars).
- Assert `canonical` equals the expected absolute URL and self-references the page.
- Assert the sitemap `loc` set matches the set of indexable pages with no duplicates and no wrong-host entries.
- Assert structured-data counts equal their visible counterparts so schema cannot drift from copy.

## Common traps

- Trusting visual inspection instead of a parser; JSON-LD errors are invisible on screen.
- Letting a shared template duplicate hero/marketing sections across pages.
- Adding city or landing pages without unique local content (doorway-page risk).
- Forgetting to register a new page in both the sitemap and the metadata test table.
- Structured data referencing a stale `@id`, wrong host, or a value the DOM no longer shows.
