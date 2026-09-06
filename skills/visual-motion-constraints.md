# Visual Motion Constraints

## Trigger

Use this skill when a UI feature adds decorative motion, pointer magnetic behavior, parallax, or animated transforms that can become overpowering or interfere with usability.

## Invariant

Motion must remain subtle, bounded, and user-aware: it should feel intentional without overpowering the interface or ignoring reduced-motion preferences.

## Failure pattern

A decorative effect drifts too far from the pointer, moves too aggressively, or ignores the user's motion preference. The result is a polished effect that feels chaotic, makes content harder to read, or causes the layout to feel unstable during interaction.

## Recommended method

- Keep the displacement ratio small and explicit.
- Honor the `range` or intensity parameter instead of hardcoding a default.
- Clamp movement to a reasonable delta and prevent the effect from exceeding the element's visual footprint.
- Disable the effect when reduced motion is active or when a pointer is unavailable.
- Separate decorative motion from functional state changes so the interaction remains usable without the polish layer.
- Preserve explicitly valued motion during a refactor. Optimization does not authorize deleting a signature intro or effect; use deferred mounting, pause/resume, and cleanup where appropriate.
- Verify event producers and consumers mount together. A launch event with no smoke listener is a broken interaction, not merely a visual simplification.
- For multi-stage introductions, drive timer progression from committed/rendered state when animation sequencing can skip queued content. Check the final state actually appears and pending timers are cancelled.
- Keep underlying content inert and scroll-locked only while the introduction owns the screen; release both on completion/unmount and bypass decorative sequences under reduced motion.
- Distinguish once-per-app-load behavior from once-per-route-navigation behavior. Test that internal navigation does not replay an intro.

## Discriminating checks

- Compare pointer offset with the configured range and confirm the delta stays bounded.
- Toggle reduced-motion mode and assert the decorative layer no longer moves.
- Test hover and leave paths to ensure the object returns cleanly to rest.
- Verify the effect does not obscure text, buttons, or screen-reader targets.
- Run the full launch/transition/reset sequence twice; verify actual pixels and the delayed navigation/focus result, not only emitted events.
- Assert introduction final text, interaction lock release, deep-link completion, and reduced-motion bypass.

## Common traps

- Treating “more dramatic” as a valid product decision without measuring the effect.
- Hardcoding motion values instead of honoring the API contract.
- Using the same intensity on desktop, tablet, and mobile without checking usability.
- Allowing a visual effect to fight the user instead of supporting the intended interaction.

## Evidence

The portfolio's magnetic effect initially ignored the configured range and moved too strongly. The fix was to soften the follow ratio, clamp the displacement, and disable the decorative motion when reduced motion was requested.

Later work restored the user's original multilingual introduction and rocket smoke after an overbroad cleanup. The smoke emitter had remained while its listener was removed. The restored intro also required rendered-state timer sequencing to avoid skipping its final Welcome state. See [design intent preservation](design-intent-preservation.md) and [rendered UI evidence](rendered-ui-evidence.md).
