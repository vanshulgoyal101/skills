# Incident Collection: Arcade UI and Lifecycle

## Scope

Verified failures found while hardening Tiny Arcade's browser interactions.

## Result controls outliving their run (2026-09-28)

- Trigger: finish Wordle, dismiss its result, restart from the toolbar, enter a
	new guess. The old Play again pill remained over the active keyboard.
- Root cause: shared overlay replay state was cleared only by its own replay
	button. Game start functions hid the modal but did not clear helper-owned UI.
- Impact: stale restart actions in new runs/views; hidden replay could be invoked
	twice. Closed dialogs could retain focus because opacity/pointer rules did not
	remove keyboard access. Right-clicking a backdrop dismissed results.
- Fix: explicit shared reset used by all twelve game start/view paths; guard hidden
	replay activation, make closed dialogs inert, release hidden focus, focus the
	visible replay action, and reject secondary backdrop presses. Keep 2048's win
	continuation separate from destructive replay.
- Adjacent reproduced faults: Flash counted a completed quiz again after dismissal;
	an active-quiz guard now locks answers and submission until the next passage.
	Sprint's Enter-to-restart and Chromatic's Enter-to-submit intercepted focused
	buttons; native control activation now takes precedence.
- Evidence: failing regressions before fixes; 754 tests across 52 files passed,
	all twelve builds, and two real result cycles per game at 320/390/1280px in
	Chromium. WebKit passed every game at 390px in isolated contexts. Hidden dialog
	focus was detected only by the stronger browser check, not the initial CSS test.
- Regression gate: `scripts/result-lifecycle.mjs`, called by `test:browser`, drives
	real results, close/backdrop dismissal, toolbar/mode/tab or replay starts, then
	checks the next active run and delayed callbacks. No production score writes.
- Fixture lessons: move focus back to the game before testing gameplay Enter;
	retaining New word focus correctly restarts instead. A WebKit virtual-clock
	initialization failure on a reused context was resolved by per-game contexts.
- Limits: engine tests are not physical iPhone testing; mocked external services
	do not establish production OAuth or score persistence. This is coverage of
	specific result/input lifecycles, not proof that every possible game state is correct.

## Input and layout follow-ups (2026-09-24 to 2026-09-25)

- Native keyboard answers and secondary-pointer rejection were verified in Echo,
	Flash, Hue Hunt, Where, Word and Wordle; numeric input stays usable after toolbar
	focus. Hue keyboard score feedback uses the tile center.
- Flashmath exact answers retain 300ms confirmation; edits and expiry cancel it.
	Bonus timing uses answer completion, not the confirmation delay.
- Interval cancels queued autoplay when manual playback or an answer takes over.
	Digit Span keeps disabled keypad geometry during playback and guards duplicate Start.
- Word daily completion reveals once after repeated presses. Echo settings remain
	locked through the missed-pad reveal. Wordle's 320px toolbar wraps without
	shrinking buttons, and the signed-in stats header has an explicit inner gap.
- Verification traps: module resets do not detach event listeners; new tabs in a
	context retain storage. Compare cumulative counters to a baseline or isolate
	contexts. Resolve asset URLs relative to each deployed game path and assert
	the expected asset count before claiming byte-for-byte verification.

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
