# Header Offset Scroll Guards

## Trigger

Use this skill when a page has a fixed or sticky header, a hash-driven route, or an in-page anchor jump that should land the section content fully visible.

## Invariant

Hash navigation and programmatic scrolls must account for the real header height so the target section is not hidden beneath the navigation.

## Failure pattern

A user deep-links directly to `#about`, `#work`, or another section, or clicks a nav item after a route change, and the browser lands the element behind the fixed header. The section appears cut off, the page looks blank above it, and the same bug recurs across every anchored section because the offset is hardcoded or applied only in one path.

## Recommended method

- Measure the actual rendered nav height on every page load and resize.
- Share one scroll helper rather than patching individual anchor targets.
- Set both `scroll-padding-top` on the root and `scroll-margin-top` on anchored sections.
- Recompute the offset after route changes and after the nav's layout changes, especially on mobile.
- Use a small gap, not a fixed pixel guess, so visual spacing remains stable.

## Discriminating checks

- Open a direct URL with a hash and confirm the target element is fully visible beneath the header.
- Click every nav item and inspect the final `scrollTop` relative to the nav height.
- Resize the viewport from desktop to mobile and confirm the offset remains correct.
- Assert the target's top position is greater than the header offset plus a small margin.

## Common traps

- Assuming the header height is constant across breakpoints.
- Fixing only the JS click path but leaving native hash navigation unchanged.
- Setting `scroll-padding-top` without also compensating `scroll-margin-top` for anchored elements.
- Patching one page instead of centralizing the shared scroll contract.

## Evidence

The Vanshul portfolio work exposed the root cause: native anchor behavior and programmatic navigation were both ignoring the fixed header height, leaving a blank strip at the top of direct-linked sections. The fix was to centralize the offset calculation and apply it at the root layout boundary.
