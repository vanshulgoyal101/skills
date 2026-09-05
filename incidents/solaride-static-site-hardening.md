# Incident: Solaride Static Site Hardening

- **Date**: 2026-08
- **Repository**: solaride
- **Severity**: Medium (silent lead loss and degraded SEO)
- **Status**: Fixed

## Symptom

Contact form submissions arrived with an empty name field. On the benefits page, two calculators overwrote each other's results. The FAQ/About page duplicated the homepage's marketing sections. A later phone-number change left stale numbers inside structured data even though the visible page looked updated.

## Trigger sequence

1. Submit the contact form → the EmailJS payload's `name` was empty.
2. Open the benefits page (Tree-to-Energy calculator + Solar Savings calculator) → clicking one calculator updated the other's `system-size` / `tree-equivalent` nodes.
3. Load `faq.html` → it cloned the homepage hero and "Our Services" grid.
4. Replace the displayed contact number → the hyphenated `telephone` in JSON-LD still held the retired value.

## Evidence

- A jsdom test showed `form.name` returns the form element's `name` attribute, not the input named `name`, so `form.name.value` was `undefined`.
- The two calculators shared element IDs; the results panels wrote the same node ids.
- A broad grep of the hyphenated number pattern found stragglers after the spaced-format replace succeeded.

## Root cause

Missing DOM identifier and name contracts (property shadowing plus duplicate IDs), untested page-metadata invariants that allowed duplicate content and drift, and a single-format find/replace that ignored other encodings of the same literal.

## Fix

Read fields with `FormData`; namespace the savings calculator's IDs with a `savings-` prefix; give `faq.html` unique content and a self-canonical; enumerate every number encoding and re-grep to zero; add a Vitest + jsdom SEO suite that parses each page's head and JSON-LD.

## Regression coverage

- `tests/forms.dom.test.mjs` asserts the submitted payload carries each field's value.
- `tests/savings.dom.test.mjs` asserts one calculator does not write the other's nodes.
- `tests/seo.test.mjs` asserts canonical, description bounds, parseable JSON-LD, and sitemap membership.
- Command: `npm test`.

## Residual risk

The CDN Tailwind build remains render-blocking (tracked as a performance follow-up). Only two service-area pages exist by design, to avoid thin doorway pages.

## Portable lesson

Create or reinforce [dom-identifier-contracts](../skills/dom-identifier-contracts.md), [crawlable-metadata-contracts](../skills/crawlable-metadata-contracts.md), and [multi-encoding-literal-rotation](../skills/multi-encoding-literal-rotation.md).
