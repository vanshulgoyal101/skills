# Aggregate Metric Healing

## Trigger

When local state has independent sub-metrics or map keys but the server stores only an aggregate such as a maximum, sum, or overall rank.

## Invariant

Restore may improve a value that was previously played, but it must never invent progress for an unplayed configuration or difficulty.

## Failure pattern

A cloud maximum is copied into every local key because the restore code lacks provenance for which sub-metric produced it. The player sees a high score on a mode they never used, and later submissions can corrupt comparisons.

## Recommended method

- Store per-key cloud values when the product needs exact restoration.
- If the cloud stores only an aggregate, heal only the field that can be proven to have produced it.
- For map-keyed state, do not synthesize missing keys from an aggregate.
- Keep aggregate calculation and restore policy separate and name the loss of information explicitly.

## Discriminating checks

- Play exactly one difficulty, sync its aggregate, restore into a fresh local blob, and assert every unplayed difficulty remains absent or unchanged.
- Restore a single-field metric and assert `max(local, cloud)` remains monotonic.
- Assert multi-key configurations have no generic single-field `apply` healer unless the server stores per-key provenance.

## Common traps

- Treating an aggregate as if it were a complete state snapshot.
- Filling every map key “for consistency.”
- Testing only a player who has played every mode.
- Adding a new configuration without deciding how old aggregate data should restore.

## Evidence

Tiny Arcade's `tests/cloud-sync.test.ts` covers Where difficulty healing and rejects invented Hard records when only Easy produced the cloud maximum.