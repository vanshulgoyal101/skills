# Shipped DOM Module Testing

## Trigger

Use this skill when a static or no-build web app keeps its UI, routing, and event handlers inside an HTML module or another directly shipped browser file.

## Invariant

The interaction test executes the same UI module and imports the same logic file that production serves. Tests must dispatch real DOM events rather than call private handler replicas.

## Failure pattern

Logic tests stay green while a handler is nested in the wrong registration scope, a hash route renders the wrong view, a label targets the wrong element, or an async callback mutates a destroyed view. These failures live at the DOM/module boundary and are invisible to pure-function tests.

## Recommended method

- Parse the shipped document and extract its actual module source.
- Remove only the browser import and inject the real tested module exports.
- Boot it in jsdom with explicit shims for browser APIs the route needs.
- Dispatch `input`, `change`, `click`, keyboard, and `hashchange` events.
- Test route registration as a registry-wide smoke check in addition to feature-specific paths.
- Wait on observable UI state for async handlers; never rely on one arbitrary timer turn.

## Discriminating checks

- Add a route and assert it appears in navigation and renders its matching heading.
- Type invalid input, assert the error state, then type valid input and assert recovery.
- Open a palette or dialog with a keyboard event and assert focus, dismissal, and restoration.
- Run the same route under missing and present browser capabilities.
- Destroy the jsdom window only after async output settles; fail on unhandled rejections.

## Common traps

- Testing a copied renderer instead of the shipped module.
- Calling a function directly and missing the event wiring that broke in production.
- Assuming a hash assignment synchronously delivers `hashchange` in jsdom.
- Using broad selectors such as `[role="region"]` when the semantic contract is more specific.
- Letting jsdom teardown turn late promises into false-positive or hidden failures.
