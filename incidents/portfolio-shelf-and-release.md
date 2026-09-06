# Incident: Portfolio Shelf, Navigation, and Release Evidence

- **Date**: September 2026
- **Repository**: vanshulgoyal101/vanshul-portfolio; related redirect work in vanshul-blog
- **Severity**: User-facing design and navigation regressions; stale published metadata
- **Status**: Shelf redesign deployed; intermittent unrelated browser failures remain unresolved

## Symptom

The user rejected a combined books-and-essays shelf and requested a full theme-consistent redesign with separate collections. Earlier broad changes had also removed valued motion and hidden projects, requiring restoration. The blog subdomain reached an index route rather than the homepage section containing the shelf entry point.

## Trigger sequence

1. Add essays to a previously book-only collection: runtime content reaches 20 entries but static prerender code still imports only 12 books.
2. Render the shelf as one mixed list inside a large article card despite separately maintained content arrays.
3. Add collection anchors, click Essays, then reload the resulting hash URL.
4. The lazy page mounts and unconditionally scrolls to zero; the collection is no longer in view.
5. Publish while another actor advances the same branch, then run the complete browser suite in CI.

## Evidence

- `src/constants/books.js`: 12 books and 8 essays. Runtime and prerender originally derived schema from different collections.
- The first focused shelf browser run passed bounds checks but failed `#essays` reload on both desktop and mobile.
- A mount-time allowed-hash restoration, scheduled after font readiness, made the same tests pass without weakening assertions.
- `f729af9` contains the redesign, shared metadata, focused unit tests, and `e2e/shelf.spec.js`.
- Local lint and 313 unit tests passed; 11 generated routes verified. New shelf browser coverage passed three applicable tests with one intentional project skip.
- The complete local browser run had four failures; all four passed unchanged when rerun serially. This establishes intermittent behavior, not resource contention as a confirmed cause.
- An independent Arcade update, `9ccf3d5`, followed the shelf commit. Actions run `34054728394` deployed the descendant revision containing both changes.
- The first CI attempt passed shelf checks but failed two unchanged sculpture pixel-bound assertions. The failed-job rerun passed the complete browser suite and deployed. No assertions were weakened.
- A live fetch confirmed the new shelf heading, category links, and separate counts after deployment.

## Root cause

- Presentation did not preserve the categories already represented in the data.
- Runtime and static metadata had duplicated independent derivation paths.
- The page's unconditional mount scroll overrode hash intent after lazy loading; route-level handling alone did not guarantee the target existed.
- Earlier design regressions confused implementation cleanup with authorization to remove product features.
- The exact causes of intermittent local timing and CI sculpture framing failures were not established.

## Fix

- Replace the enclosing card with open sections: a numbered book catalogue and a separate essay list with domains and source links. Retain all content and site theme.
- Show independently derived category counts on the homepage entry card and page.
- Share description and JSON-LD between runtime and prerender, using Book versus Article types and original essay URLs.
- Restore only known collection hashes after mount/fonts, use the existing header-aware focus helper, and cancel pending work on unmount.
- Keep the blog redirect at the user's exact destination, `https://vanshul.com/#blog`, across redirect mechanisms and fallback navigation.
- Track the actual deployment revision and ancestry instead of assuming a post-push local HEAD still identifies the agent's commit.

## Regression coverage

- Page/card unit tests: complete category membership, counts, original links, safe external-link attributes, and return destination.
- `e2e/shelf.spec.js`: Writings entry journey, category jumps, reload, return navigation, 44px essay links, and text bounds at 1440/768/390/320px.
- `scripts/verify-build.mjs`: every published route and canonical, all shelf names, total count, Book count, and Article URLs.
- Screenshot review: actual desktop/mobile page, entry card, and essay section; not golden-image comparison.
- Redirect integrity tests cover exact canonical, metadata, refresh, script, and fallback destinations; fragments matter to the product journey.

## Residual risk

- Rerun success does not fix or explain test intermittency. Keep the original failures visible in release reports and investigate if repeated.
- Browser tests block external requests; they verify stored essay destinations, not current remote availability or attribution.
- Source fetches verify only what was actually retrieved. Do not invent an unresolved canonical URL or treat two well-known essays as objectively ranked popularity.
- Mobile smoke received less pixel/lifecycle coverage than desktop; do not generalize desktop evidence to every device.
- A live text fetch confirms deployed content, not production visual equivalence across browsers.
- The final deployment includes concurrent work; preserve it and attribute the shelf's tests and commit accurately.

## Portable lesson

- [Design intent preservation](../skills/design-intent-preservation.md)
- [Rendered UI evidence](../skills/rendered-ui-evidence.md)
- [Header offset scroll guards](../skills/header-offset-scroll-guards.md)
- [Build artifact parity](../skills/build-artifact-parity.md)
- [Verification gates](../skills/verification-gates.md)