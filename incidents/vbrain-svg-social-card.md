# Incident: SVG Social Card Rendered Nowhere

- **Date**: 2026-09-02
- **Repository**: vbrain
- **Severity**: Low (distribution/SEO, not runtime)
- **Status**: Fixed

## Symptom

Shared links to `vbrain.vanshul.com` showed no preview card on any platform,
despite the page setting `twitter:card=summary_large_image` and both `og:image`
and `twitter:image`.

## Trigger sequence

1. The static-site generator emitted a hand-authored `og.svg` and pointed
   `og:image` / `twitter:image` at it.
2. The page rendered correctly, and the SVG opened fine in a browser.
3. A link was shared to X / LinkedIn / Slack; each fetched the page, saw an SVG
   `og:image`, and rendered no card.

## Evidence

- `og:image` and `twitter:image` both referenced `og.svg`.
- Major crawlers (X, LinkedIn, Facebook, Slack, Discord) do not support SVG
  preview images; browsers do, which masked the defect during local checks.

## Root cause

The image format, not the meta tags, is the gate for social cards. An SVG
`og:image` is silently ignored by the crawlers that build previews.

## Fix

- Keep authoring the artwork as SVG, but rasterize it to a 1200×630 PNG at build
  time with `@resvg/resvg-js` (verified in a production-mode install).
- Point `og:image` / `twitter:image` at the PNG; add `og:image:width/height/alt`.
- Cache `*.png` in `_headers` and assert the PNG exists in CI.

## Regression coverage

- CI asserts the built `og.png` exists; the suite grew by one check (208 → 209).

## Residual risk

The rasterizer is a build-time native dependency; a build environment without it
would fall back to no card. CI covers the presence of the output, not the
renderer's availability on every host.

## Portable lesson

[rasterized-social-preview](../skills/rasterized-social-preview.md).
