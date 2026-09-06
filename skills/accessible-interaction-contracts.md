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
- Separate visual control geometry from the hit target. A global minimum size for inputs can distort a small switch; constrain its track/thumb while retaining the accessible target on its associated label.
- Opening a disclosure near the viewport bottom may require bringing its controls into view without stealing focus. CSS visibility alone is insufficient.
- Scope outline suppression to deliberately marked noninteractive scroll destinations. Never remove focus rings from actual controls to fix an oversized section outline.
- Closed mobile navigation must remove hidden controls from keyboard traversal; verify Escape, focus wrapping, focus restoration, and scroll-lock cleanup.

## Discriminating checks

- Enumerate icon-only controls and assert non-empty accessible names.
- At rest, controls should have no focus ring; after Tab, the focused control should have one.
- Open/dismiss a modal with close button, Escape, backdrop, and replay paths.
- Update a dynamic label and assert its semantic text/value matches the visual state.
- Test at least one keyboard and one pointer path for custom interactions.
- Measure switch track/thumb and label bounds with the global stylesheet active at narrow widths.
- Use actual Tab input before asserting keyboard focus styling; pointer clicks do not establish keyboard modality.
- Require expanded controls to be fully in the viewport and still reachable by keyboard.

## Common traps

- `a, button, input, [tabindex]:focus-visible` scopes only the last selector.
- A screenshot can look fine while a screen reader sees a symbol like “↺”.
- A title tooltip is not a reliable accessible name.
- Adding `outline: none` after a shared focus rule can silently remove keyboard focus for a specific control type.

## Evidence

Portfolio checks exposed switch distortion from global 44px input minima, footer settings expanding below the viewport, and a Home wrapper outline mistaken for a visual separator. Component geometry, viewport-aware disclosure behavior, and narrowly scoped noninteractive focus handling resolved those failures. See [rendered UI evidence](rendered-ui-evidence.md).
