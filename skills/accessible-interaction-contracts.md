# Accessible Interaction Contracts

## Trigger

Use this skill whenever adding icon-only controls, dynamic game state, keyboard input, modal behavior, focus styling, or custom pointer targets.

## Invariant

Every control has an accessible name, keyboard users retain a visible focus indicator, and visible UI state matches the semantic state.

## Recommended method

- Add `aria-label` to symbol-only buttons; `title` alone is not sufficient.
- Scope focus rings with `:focus-visible` on every selector, never a bare selector list with only the last item scoped.
- Keep buttons as buttons; custom gesture surfaces need an equivalent keyboard path.
- Give dialogs close behavior, focusable controls, and predictable Escape/backdrop semantics.
- Test labels through an accessibility tree or DOM assertions, not only screenshots.
- Preserve accessible state during animations and asynchronous updates.

## Discriminating checks

- Enumerate icon-only controls and assert non-empty accessible names.
- At rest, controls should have no focus ring; after Tab, the focused control should have one.
- Open/dismiss a modal with close button, Escape, backdrop, and replay paths.
- Update a dynamic label and assert its semantic text/value matches the visual state.
- Test at least one keyboard and one pointer path for custom interactions.

## Common traps

- `a, button, input, [tabindex]:focus-visible` scopes only the last selector.
- A screenshot can look fine while a screen reader sees a symbol like “↺”.
- A title tooltip is not a reliable accessible name.
- Adding `outline: none` after a shared focus rule can silently remove keyboard focus for a specific control type.
