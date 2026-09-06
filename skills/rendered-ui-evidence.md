# Rendered UI Evidence

## Trigger

Use when changing responsive layouts, image framing, canvas/WebGL effects, or controls whose DOM presence does not prove usability.

## Invariant

The rendered surface fits its intended viewport, exposes actionable controls, and shows the intended media or effect. Evidence names the state and rendering conditions actually checked.

## Failure pattern

A disclosure is CSS-visible but opens below the viewport. An image loads but crops the subject. A canvas exists but is blank. Global control sizing distorts a switch. Large or frequent pixel readbacks slow the very animation the test is measuring.

## Recommended method

- Test the real user journey and capture its important states, not just isolated component markup.
- Distinguish visibility from viewport intersection, occlusion, and actionability. Require full viewport intersection for a control that must be entirely reachable without another scroll.
- Measure text and control bounds at desktop, tablet, and the narrowest supported width. Check long titles, wrapped labels, internal overflow, and document overflow.
- Reserve stable image geometry using an aspect-ratio frame. Verify image/frame rectangles, natural image dimensions, and the visible subject. Choose crop position from the actual asset; no universal object-fit choice preserves every subject.
- For canvas/WebGL, wait for meaningful pixels, check occupied bounds, compare later frames, exercise interaction, and verify off-screen pause or final clearing where required.
- Scope pixel capture to the target. Stop expensive full-canvas readbacks once sufficient evidence exists; use backend-aware bounded waits without weakening the behavior assertion.
- Floating targets may never satisfy locator stability. For tests of intentionally moving controls, click a freshly measured position and assert the resulting event/state sequence.
- Inspect screenshots manually. Captures without a baseline comparison are evidence, not pixel regression tests.
- Block external dependencies only when appropriate, and explicitly state which live services and remote links were not exercised.

## Discriminating checks

- Open a footer disclosure with pointer and keyboard; verify its controls are fully in view and focus is retained.
- Sample a scene for nonblank pixels, containment, motion, drag response, and final cleanup across supported viewports.
- Confirm reduced-motion and unsupported-device visits do not load excluded expensive modules.
- Test image geometry before and after hover and inspect every distinct asset crop.
- Preserve failure screenshots and traces; serial reruns can reveal timing sensitivity but do not establish its cause.

## Common traps

- Equating `toBeVisible` with being on-screen, unobscured, or usable.
- Counting a mounted canvas as successful rendering.
- Measuring only document overflow when a nested element clips its contents.
- Calling screenshots golden baselines when no comparison occurs.
- Claiming a device/backend path is covered because another path passed.

## Evidence

See [portfolio shelf and release](../incidents/portfolio-shelf-and-release.md). Shelf checks covered 1440/768/390/320px; earlier image and motion checks used their own viewport matrices. These sizes are examples, not universal requirements.