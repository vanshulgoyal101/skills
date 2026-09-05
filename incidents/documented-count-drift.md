# Incident: Documented Counts Drifted From the Registry

- **Date**: 2026-09-04
- **Repository**: Tools, Tiny Arcade (and downstream: profile, portfolio)
- **Severity**: Low (credibility, not runtime)
- **Status**: Fixed

## Symptom

Public copy claimed numbers the products did not have. The GitHub profile and
portfolio said Tiny Arcade had **11** games while the live site and hub said
**10**. The Tools description said **19** utilities; the app had grown to **27**
(19 → 25 → 27 over two days as tools were added).

## Trigger sequence

1. Add a tool (`tool({ id: 'sql' })`, `tool({ id: 'python' })`) or a game card.
2. The registry — `tool({ id })` calls in `index.html`, hub `<a href>` cards —
   grows.
3. The count quoted in `README.md`, `FEATURES.md`, the repo description, the
   profile, and the portfolio is hand-maintained elsewhere and is not updated.

## Evidence

- `grep -c 'tool({' index.html` → 27, while `README.md` read "25 everyday utilities".
- Hub cards `href="[a-z-]+/"` → 10 unique, while the profile read "11 instant-play games".
- After adding guards, mutating a doc by one fails with:
  `README.md is stale — 27 tools are registered: expected 26 to be 27`.

## Root cause

The count lived as prose in multiple files with no link to the source of truth.
A registry (the tool/card list) is executable and grows correctly; a number
typed into a sentence has no compiler and rots the moment the registry changes.

## Fix

- Tools: `tests/tool-count.test.js` counts `tool({ id })` registrations and
  asserts `README.md` and `FEATURES.md` quote that exact number.
- Arcade: `tests/featured-count.test.ts` counts hub cards and asserts the README
  and the three SEO strings agree.
- Outward-facing copy that no single repo's CI can reach (profile, portfolio,
  repo description) had the number removed and replaced with a qualitative
  description; the exact count now lives only beside the list it counts.

## Regression coverage

- `cd tools && npx vitest run tests/tool-count.test.js`
- `cd arcade && npx vitest run tests/featured-count.test.ts`
- Both were verified to fail on injected drift, not only to pass.

## Residual risk

Cross-repository copy still cannot be guarded by one repository's CI. The
mitigation is to keep numbers out of that copy entirely; if a number returns
there, it can drift again.

## Portable lesson

[documented-fact-parity](../skills/documented-fact-parity.md).
