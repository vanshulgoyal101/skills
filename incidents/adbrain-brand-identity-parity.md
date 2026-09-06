# AdBrain Brand Identity Parity

## Trigger and impact

The approved landing-page Brain mark differed from a hand-drawn browser icon,
an A monogram in the social card, a megaphone in Links, and a target fallback in
Portfolio. Separate renderers and copied symbols had drifted without a shared
geometry check.

## Evidence and fix

The icon generator now renders the installed Lucide component to SVG, then uses
Sharp for browser/install formats. Maskable composition uses explicit dimensions
rather than string replacements tied to a particular SVG shape. Links keeps its
colored line-icon slot; Portfolio keeps screenshot-first cards and a local icon.
A cross-check compares all SVG paths with the canonical component.

Direct Lucide use in Next's ImageResponse passed typecheck but failed production
prerendering because the icon's implementation crossed a client boundary. The
social renderer now embeds the generated PNG, and the production build passes.

Adding a decorative title image caused a Portfolio test selecting every project
image to fail its count/frame assertions. The test now selects named artwork
and separately verifies that the decorative mark loads and uses object-contain.
The focused desktop/mobile rerun passed. The completed full rerun passed 36 tests
with eight platform-specific skips. An earlier interrupted run was not treated
as release evidence.

Production screenshot review then found old branding inside Portfolio's large
AdBrain screenshot despite correct surrounding DOM icons. The existing capture
script gained optional project selection; only AdBrain was recaptured from its
public production page. The obsolete authored-card generator was removed so it
cannot restore stale imagery. Build, route verification, and both artwork tests
passed for the refreshed capture.

The Pages follow-up succeeded, but the unchanged screenshot URL still returned
the old 40,072-byte asset with an Age header of 377 seconds. A versioned request
returned the new 58,096-byte file with matching SHA-256. Portfolio `004ed55`
therefore references that version explicitly. AdBrain checker `d8d7890` fetches
the image URL actually rendered by Portfolio, not an unrelated cache-busted URL.

A failed deep equality assertion on binary buffers exhausted Node's heap while
formatting its diff. Use `Buffer.equals` for a bounded boolean assertion or
compare SHA-256 strings with sizes and cache headers. This makes a mismatch
diagnosable without increasing heap limits or dumping binary artifacts.

## Related workspace lessons

- Keyword-derived brief previews can invent audience or offer facts. AdBrain's
  preview mapped new customers to new patients and trial to free consult. Remove
  unsupported interpretations and show the user's actual brief and saved context.
- A/B budget summaries must reflect the number of ad sets rather than repeat the
  entered per-set amount as if it were the total. Paused-creation readiness must
  not claim Meta eligibility or guarantee a hard spending cap.
- Hiding alternate setup modes preserves draft state; regression checks should
  cover closing/reopening and switching modes, not just initial rendering.
- Reordering an enquiry digest with CSS did not fix keyboard or reading order.
  Put it after contacts in the DOM as well as on screen.
- Logo and poster selectors need full-artwork previews; object-cover can hide the
  exact text or identity a user is choosing. Keep layout geometry stable.
- Authenticated UI checks can read existing development data while intercepting
  mutation APIs. Do not spend on AI, activate campaigns, or publish private
  screenshots merely to verify layout and navigation.
- Collapsing internal tools improves hierarchy but is not an authorization fix.
  Record backend safety risks separately rather than claiming UI work resolved them.

## Release evidence

- AdBrain `b9a8135`: 703 unit tests passed, one live-provider test skipped,
  coverage/lint/types/build passed, four production-build Home-to-Review checks
  passed, eight authenticated routes passed at four widths. GitHub CI and Vercel
  both succeeded; the public site passed four-width production checks.
- Links `90e8a57`: 68 tests passed. Sitemap automation created descendant
  `a6171fb`, changing only the sitemap; its replacement Pages job succeeded.
- Portfolio `323349c`: 314 unit tests, lint/build/11 published-route checks,
  and the complete browser gate passed; Pages deployed successfully. Screenshot
  follow-up `99a19eb` preserves the new identity inside the preview image too.
- Live checks compared all AdBrain icon bytes, SVG geometry on both siblings,
  browser-tab metadata, and the 1200x630 social raster. Desktop/mobile screenshots
  were inspected rather than relying only on geometry assertions.

Public DNS returned NXDOMAIN for the alternate `adsvanz.app` hostname during
verification. The canonical `adbrain.vanshul.com` deployment was healthy. A
hosting alias or older successful check is not evidence of current DNS health.

## Regression checks

- AdBrain icon tests compare exact paths with the installed component.
- Cross-repository parity checks compare both sibling product displays.
- Links tests preserve stable identity, local color, and decorative semantics.
- Portfolio tests preserve accessible titles and artwork framing while checking
  the separately sized mark.
- Production build exercises the real social renderer; production asset-byte
  checks establish that deployment served the intended artifact.

## Residual risk

Browser favicons, installed apps, and social crawlers may retain cached imagery.
Version icon references where supported, preserve required formats, and verify
fresh responses without promising immediate third-party cache invalidation.
Unrelated dirty worktrees must not be swept into branding commits.

See [product registry maintenance](../skills/product-registry-maintenance.md).