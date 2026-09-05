# Incident Collection: Arcade UI and Lifecycle

## Scope

Verified failures found while hardening Tiny Arcade's browser interactions.

## Confirmed failures

- Delayed Where callbacks opened game-over over a fresh mode.
- Word daily and practice callbacks crossed tabs.
- Flash Stop during countdown still launched a hidden reader.
- Flashmath's wrong-answer cleanup erased new-run input.
- Wordle reveal callbacks painted stale colors after restart.
- Hue Hunt's answer reveal was lost in a source revert while CSS remained.
- 2048 tiles snapped instead of moving, and merge overshoot was visually excessive.
- A malformed `:focus-visible` selector put permanent outlines around 2048 controls.
- A symbol-only 2048 restart button lacked an accessible name.

## Durable fixes

The games now use run/view generations where required, explicit cancellation for countdowns and cleanup timers, transform-based tile layers, restrained animation, accessible focus contracts, and regression tests for restart/tab/gesture paths.

## Reusable skills

- [async-lifecycle-guards](../skills/async-lifecycle-guards.md)
- [mobile-input-and-motion](../skills/mobile-input-and-motion.md)
- [accessible-interaction-contracts](../skills/accessible-interaction-contracts.md)
- [verification-gates](../skills/verification-gates.md)
