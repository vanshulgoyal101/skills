# Mobile Input and Motion

## Trigger

Use this skill for touch, pointer gestures, swipes, keyboard fallbacks, animated grids, sliders, or any interaction that must work on small screens.

## Invariant

A gesture reaches the intended interaction exactly once, at the moment its intent is clear, while the page remains scrollable when the surface is not actively handling the gesture.

## Recommended method

- Capture the pointer on `pointerdown` when a gesture may leave the element.
- Decide the direction when movement crosses a threshold, not only on `pointerup`.
- End/cancel the gesture on `pointerup`, `pointercancel`, and capture loss.
- Use `touch-action: none` only on the active gesture surface, not the whole page.
- Separate static layout cells from animated content layers.
- Animate transforms between model positions; keep scale/opacity effects independent from translation.
- Preserve a reduced-motion mode.
- Verify at narrow, medium, and desktop widths.

## Discriminating checks

- Start a gesture near each edge and move outside the original element.
- Move past the threshold while the pointer is still down; assert one move.
- Tap/nudge below threshold; assert no move.
- Rapidly perform a second gesture during the first animation.
- Sample the transform mid-flight; it must be neither the old nor final position.
- Assert no horizontal overflow at 320, 390, 480, and desktop widths.

## Common traps

- Relying on pointerup drops edge flicks without pointer capture.
- Pointerleave cancels a gesture before its intent threshold is reached.
- Rewriting text in layout cells looks like no animation at all.
- `transform` animations conflict when scale and translation share the property.
- A hidden browser tab throttles rAF; use deterministic DOM/model tests for timer endings.
