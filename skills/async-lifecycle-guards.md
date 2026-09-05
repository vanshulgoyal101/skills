# Async Lifecycle Guards

## Trigger

Use this skill whenever a callback can outlive the state that created it: `setTimeout`, promises, `requestAnimationFrame`, animation callbacks, image loads, countdowns, debounced work, or network responses.

## Invariant

A callback may mutate UI or state only if it still belongs to the active run/view/request that created it.

## Failure pattern

A user restarts, switches tabs, changes mode, dismisses a modal, or starts a new request while an older callback is pending. The old callback then:

- paints stale content into a fresh view;
- opens an old modal over a new run;
- clears new input with an old cleanup timer;
- starts a hidden reader/timer after the user stopped it;
- duplicates async UI such as rank badges.

## Recommended method

Choose the smallest lifecycle primitive that matches the scope:

- **Run/view generation**: increment a token on every restart, tab switch, mode change, or new request. Capture it in callbacks and return when it is stale.
- **Cancelable timer**: keep the timer handle and clear it before resetting state.
- **Latest-request-wins**: store a monotonically increasing request id per DOM target or resource. Ignore older responses.
- **AbortController**: use when the underlying API supports cancellation.
- **Promise cancellation result**: async countdowns should return `false` when invalidated, not continue implicitly.

Invalidate before resetting or replacing the state that the old callback could touch.

## Discriminating checks

- Restart halfway through a transition and advance all fake timers.
- Switch tabs during a reveal, countdown, or delayed modal.
- Submit twice while the first network request is unresolved.
- Start a second request before the first response arrives.
- Assert no stale DOM classes, text, modal, score, or input remain.

## Common traps

- Guarding only the final callback while leaving intermediate timers active.
- Clearing a timer after rendering the new run instead of before it.
- Assuming `await` cancels when the caller navigates away.
- Using a single global generation for unrelated DOM targets.
- Testing only after timers settle; race tests must sample during the pending window.
