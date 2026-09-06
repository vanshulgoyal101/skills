# Header Offset Scroll Guards

## Trigger

Use this skill when a page has a fixed or sticky header, a hash-driven route, or an in-page anchor jump that should land the section content fully visible.

## Invariant

Hash navigation and programmatic scrolls must account for the real header height so the target section is not hidden beneath the navigation.

## Failure pattern

A user deep-links directly to `#about`, `#work`, or another section, or clicks a nav item after a route change, and the browser lands the element behind the fixed header. The section appears cut off, the page looks blank above it, and the same bug recurs across every anchored section because the offset is hardcoded or applied only in one path.

## Recommended method

- Measure the actual rendered header bottom when resolving the destination; account for its position as well as height.
- Share one scroll helper rather than patching individual anchor targets.
- Choose CSS scroll padding/margins or a computed JavaScript offset deliberately. Both CSS properties are not universally required; avoid double-counting clearance.
- Recompute the offset after route changes and after the nav's layout changes, especially on mobile.
- Use a small gap, not a fixed pixel guess, so visual spacing remains stable.
- Resolve lazy-page hashes after the target mounts and fonts are ready. A route-level effect can run before the target exists; an unconditional page mount scroll can later override it.
- Prefer one restoration owner. If the route and lazy page must cooperate, make repeated restoration idempotent and cancel stale callbacks on unmount or navigation.
- Restore only valid targets and preserve reduced-motion behavior. Test reloads as well as click navigation.
- Transfer focus to the section heading without a second browser scroll. Treat the skip-to-main target separately: it must focus the main container, not an arbitrary nested heading.
- Measure stable layout offsets rather than transient animation transforms when computing the destination.

## Discriminating checks

- Open a direct URL with a hash and confirm the target element is fully visible beneath the header.
- Click every nav item and inspect the final `scrollTop` relative to the nav height.
- Resize the viewport from desktop to mobile and confirm the offset remains correct.
- Assert the target's top position is greater than the header offset plus a small margin.
- Reload a lazy detail route with its collection hash; assert both focus and final header clearance.
- Test Home and skip navigation after real keyboard input, not only pointer interactions.

## Common traps

- Assuming the header height is constant across breakpoints.
- Fixing only the JS click path but leaving native hash navigation unchanged.
- Stacking CSS and JavaScript offsets without measuring the resulting clearance.
- Patching one page instead of centralizing the shared scroll contract.
- Resetting scroll to zero after a valid deep-link restoration.

## Evidence

The portfolio centralized measured header clearance and focus handling. Its later shelf redesign reproduced a separate lazy-page reload failure on desktop and mobile: an unconditional mount scroll returned `#essays` to the top. Target-aware restoration after mount/fonts passed the same checks. See [portfolio shelf and release](../incidents/portfolio-shelf-and-release.md).
