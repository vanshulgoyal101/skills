# Rasterized Social Preview

## Trigger

Use this skill when a page sets `og:image` / `twitter:image`, when the artwork is
authored as SVG, or when a shared link shows no preview card despite correct
meta tags.

## Invariant

The social preview image is in a format every major crawler will render — in
practice, PNG or JPEG at 1200×630. The card that renders in a browser is not
evidence that the card renders when shared.

## Failure pattern

`og:image` points at an SVG. The page looks correct locally, and the SVG loads
fine in a browser. But X, LinkedIn, Facebook, Slack, and Discord all refuse SVG
preview images, so every shared link shows no card at all — even with
`twitter:card=summary_large_image` set correctly. The failure is invisible until
someone actually shares a link.

## Recommended method

- Author the artwork as SVG if convenient, but rasterize to a PNG at build time
  (`@resvg/resvg-js`, `sharp`, or similar), pinned to 1200×630.
- Point `og:image` and `twitter:image` at the PNG. Add `og:image:width`,
  `og:image:height`, `og:image:type`, and a descriptive `og:image:alt`.
- Assert in CI that the referenced image exists and is a raster format; cache it
  with the other static assets.
- Validate with a real crawler or a card-preview validator, not only a browser.

## Discriminating checks

- `curl` the built page and assert `og:image` ends in `.png` and that the file
  resolves (not a 404).
- Run a link-unfurl / card validator and confirm the image renders.
- Confirm the rasterization step actually ran in a production-mode build, not
  only in local dev.

## Common traps

- Testing the card only in a browser, where SVG renders and hides the problem.
- Shipping a PNG reference whose file 404s because the build step was skipped in
  the deployed environment.
- Assuming a valid `twitter:card` value is enough; the image format is the gate.
