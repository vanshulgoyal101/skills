# Pure Logic and DOM Split

## Trigger

When adding or changing browser behavior that combines business rules, state transitions, rendering, timers, input handlers, or persistence.

## Invariant

Rules and state transitions can be executed and tested without a browser. DOM access, rendering, and event wiring remain at the boundary and do not redefine business behavior.

## Failure pattern

A feature works through one click path but cannot be tested reliably, or a UI refactor changes game/product rules because computation and rendering are interleaved. Hidden browser globals make unit tests slow, brittle, or incomplete.

## Recommended method

Put domain decisions in pure functions or small state machines. Keep DOM reads/writes and event registration in an adapter layer. Pass time, randomness, storage, and network dependencies into the boundary rather than importing them from the core.

## Discriminating checks

- Import the rules module in a non-DOM test environment.
- Search the pure module for `document`, `window`, and direct event registration.
- Exercise state transitions with deterministic inputs, including reset and invalid input.
- Add one DOM test for the adapter so wiring is covered separately from rules.

## Common traps

- Moving a small DOM query into an otherwise pure helper.
- Testing only rendered text and never the underlying transition.
- Hiding randomness or current time in a module-level singleton.
- Treating a passing unit test as proof that the shipped event wiring works.
