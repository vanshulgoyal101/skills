# DOM Identifier Contracts

## Trigger

Use this skill when more than one widget shares a page or document, when reusing a component's markup where it already exists, or when reading form fields by property name.

## Invariant

Element `id`s are unique per document and namespaced per widget. Form field values are read through an API that cannot be shadowed by the element interface's own IDL properties.

## Failure pattern

Two components write to the same `id` (for example two calculators both targeting `system-size` / `tree-equivalent`), so one silently clobbers the other's output and `getElementById` returns whichever appears first. Or code reads `form.name` / `form.action` / `form.method` / `form.length`, which resolve to the form element's own IDL attribute rather than the control named `name`, so `form.name.value` is `undefined` and the field is dropped without error.

## Recommended method

- Namespace IDs per widget instance (`savings-system-size` vs `system-size`) so co-located components never collide.
- Read form fields via `new FormData(form).get('name')` or `form.elements.namedItem('name')`, never `form.<fieldName>`.
- When embedding a component onto a page that may already host it, verify IDs are unique rather than copied.
- Keep the owning widget responsible for its own namespace so future reuse stays safe.

## Discriminating checks

- A DOM test renders both widgets and asserts that activating one does not mutate the other's nodes.
- Submit the form and assert the payload contains every field's actual value, including one named `name`.
- Assert `id` uniqueness: `querySelectorAll('[id]')` has no duplicate values.

## Common traps

- Reusing a component's markup (and its IDs) on a page that already contains it.
- Accessing `form.name`, `form.id`, `form.method`, `form.action`, or `form.length` as if they were fields.
- Assuming `getElementById` returns "the right one" when the id is duplicated — it returns the first match.
- Testing only pure logic, so the shared-surface collision never appears until production.
