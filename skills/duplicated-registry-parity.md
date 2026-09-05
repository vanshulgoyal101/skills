# Duplicated Registry Parity

## Trigger

When the same product registry is maintained in more than one runtime file, language, or package: game slugs, storage keys, route names, feature flags, or field mappings.

## Invariant

Every supported item has the same identifier, storage key, metric mapping, and lifecycle semantics in every registry. Adding or removing an item cannot silently affect only one runtime path.

## Failure pattern

One registry makes a feature visible while another registry omits it from restore, sync, routing, or account-switch logic. The code compiles and the item appears to work until a cross-surface operation runs.

## Recommended method

1. Define the canonical item set from the filesystem or one structured source.
2. Parse each runtime registry in a test, even when the files use different languages.
3. Compare identifiers and all behavior-bearing fields, not just names.
4. Test the cross-registry operation: restore, account switch, migration, or route dispatch.
5. Prefer generating registries when the build boundary is reliable; otherwise keep the parity test as the contract.

## Discriminating checks

- Add a fixture item to one registry only and assert the parity test fails.
- Enumerate all product directories and assert each has exactly one entry in every registry.
- Run the operation that previously crossed registries, such as account restore, with a fixture for every item.

## Common traps

- Checking only that an item appears in the hub UI.
- Comparing slugs but not storage keys or metric fields.
- Assuming TypeScript and JavaScript registries stay aligned because both compile.
- Treating an intentionally unlisted item as an undocumented exception; encode the exception and test it.

## Evidence

Tiny Arcade's `tests/registry-parity.test.ts` compares the hub registry with `shared/cloud.ts` after a sync failure involving `interval`.