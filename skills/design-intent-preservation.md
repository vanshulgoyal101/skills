# Design Intent Preservation

## Trigger

Use when redesigning an established interface, simplifying a portfolio, or optimizing signature motion and content discovery.

## Invariant

A refactor preserves explicitly valued features, content, and destination semantics unless the user authorizes changing them. Visual separation must exist in the rendered structure, not only in data or labels.

## Failure pattern

An aesthetic or performance cleanup removes an introduction, hides secondary projects, disconnects an effect, or redirects users to a superficially similar route. A reading collection retains separate arrays but renders books and essays in one mixed list. Technically valid code fails the product contract.

## Recommended method

- Record concrete constraints before editing: desktop versus mobile alignment, retained features, discoverability, exact destinations, and category membership.
- Treat repeated user corrections as constraints, not invitations to propose the same change again.
- Inspect history when restoring an existing effect; preserve its behavior before attempting improvements.
- Trace both sides of an event-driven effect. Retaining an emitter does not help if its listener or canvas is no longer mounted.
- Reduce cost through lifecycle control where appropriate: deferred loading, off-screen pausing, cleanup, and reduced-motion handling. Removing the feature is a separate product decision.
- Reuse the existing visual language while changing the actual information structure: unframed sections, clear headings, truthful counts, and meaningful source links.
- Keep requested collections in separately labelled sections and lists. Derive counts from their source arrays; assert every entry belongs to the right list and not the other one.
- Preserve all entries and original ordering unless a new order or hiding mechanism is intentional. Do not invent covers, ratings, dates, or popularity rankings.
- Let the latest explicit direction supersede old preservation rules. An intentionally collapsed directory still needs complete membership, keyboard disclosure, and no hidden tab stops; update tests that enforce the retired always-visible design.
- Check typography as a hierarchy at each breakpoint: section heading, item title, supporting label and body. Local overrides can be necessary when a shared heading token makes item titles compete with their section; do not shrink body copy just to create contrast.

## Discriminating checks

- Compare the implementation against the explicit preservation constraints, including different mobile and desktop requirements.
- Exercise the complete signature interaction, including its delayed result and a second invocation.
- Reach the redesigned surface from its actual entry point and return to the intended section.
- Assert separate semantic regions, complete membership, counts, original source URLs, and no accidental duplicate IDs.
- Inspect desktop and narrow-screen screenshots; tests cannot establish whether the user likes the design.
- Measure computed type sizes, relative hierarchy, line height, spacing and text bounds across breakpoints. Preserve keyboard focus styling separately from noninteractive heading decoration.

## Common traps

- Calling removal a performance fix without agreement.
- Restyling a mixed list while claiming categories are separated.
- Hiding content behind tabs or disclosures merely to make a screenshot shorter.
- Treating a homepage section, an index route, and a detail route as interchangeable.
- Copying an entire historical component without checking current navigation and lifecycle contracts.

## Evidence

See [portfolio shelf and release](../incidents/portfolio-shelf-and-release.md) and [portfolio navigation and motion](../incidents/vanshul-portfolio-navigation-and-motion.md).

Portfolio's September 2026 audit updates disclosure tests for the user's collapsed-directory direction while retaining all 17 entries. Commits `e46a718` through `ad6fe07` repair Work typography with computed-size, hierarchy and overflow assertions in `e2e/portfolio.spec.js`; the final heading-to-role ratio is a product-specific choice, not a universal type scale.