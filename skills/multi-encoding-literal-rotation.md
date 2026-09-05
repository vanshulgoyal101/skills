# Multi-Encoding Literal Rotation

## Trigger

Use this skill when changing or retiring a shared literal that appears in several textual forms: a phone number, URL, domain, email, API identifier, key name, version string, or brand token spread across markup, links, structured data, and config.

## Invariant

After the change, no representation of the old value survives anywhere, and every representation of the new value is correct for its context: display text, `href`/`tel:`/`mailto:`/`wa.me` targets, URL-encoded query strings, hyphenated JSON-LD fields, and attributes.

## Failure pattern

A find/replace of one surface form — for example the spaced display `62844 59603` — leaves other encodings untouched: the hyphenated `+91-62844-59603` inside JSON-LD, `tel:+91...`, `wa.me/91...`, and percent-encoded copies. The visible page looks updated while structured data and links still carry the retired value, or a display changes without its link target.

## Recommended method

- Before editing, enumerate every representation: spacing, punctuation, country-code/scheme prefix (`tel:`, `mailto:`, `https://wa.me/`), URL-encoding, JSON-LD hyphenation, and attribute-vs-text placement.
- Search with one broad regex alternation covering all forms to find every occurrence.
- Replace per context, keeping each surface valid (display formatting vs machine target).
- Re-grep with the broad alternation to prove zero stragglers, then validate machine-readable forms still parse and links resolve.

## Discriminating checks

- A broad `grep -rE` alternation of every old-value encoding returns nothing.
- Structured data still `JSON.parse`s and links still resolve after the change.
- A test asserts the new value is present and the old value is absent across the tree.

## Common traps

- Grepping only the human-readable format and missing hyphenated or encoded copies.
- Assuming a single canonical representation exists.
- Updating display text but not the `href`/`tel:` target, or vice versa.
- Overlooking structured data and query strings, which are the easiest to leave stale.
- Creating a duplicate when a second value for the same field already exists elsewhere.
