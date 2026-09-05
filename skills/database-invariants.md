# Database Invariants

## Trigger

Use this skill when correctness depends on SQL triggers, RPCs, caps, RLS policies, constraints, or SECURITY DEFINER functions.

## Invariant

The database is the final authority for safety and integrity. Every client write path, including direct fallback writes and old clients, must pass the same invariant boundary.

## Recommended method

- Put caps and normalization in one canonical SQL function.
- Enforce the invariant with a trigger or constraint on every write path.
- Keep monotonic fields monotonic in the trigger, not only in an RPC.
- Validate JSON shape and size at the boundary.
- Use explicit `search_path` on privileged functions and schema-qualify calls.
- Test behavior, not only function definitions.
- Use throwaway rows, existing valid foreign keys, and `finally` cleanup for live integration tests.
- Use a read-only audit to compare authoritative columns with derived values in stored blobs.

## Discriminating checks

- Insert a negative value and assert the normalized value.
- Write above each product's legitimate maximum and assert clamp behavior.
- Insert high then upsert low and assert the high value remains while allowed metadata updates.
- Write oversized and wrong-shaped JSON and assert null/rejection policy.
- Assert zero-score backup rows do not rank.
- Assert tied-score rank semantics.
- Recompute every stored headline from its blob and flag under-reported rows.

## Common traps

- PostgreSQL trigger operation names are uppercase (`UPDATE`, not `update`).
- A passing `pg_get_functiondef` check does not prove a trigger branch executes.
- A cap that is below the game's reachable maximum silently corrupts legitimate scores.
- `SECURITY DEFINER` without a fixed search path is fragile.
- Management API tests do not automatically reproduce `auth.uid()` context; distinguish admin tests from authenticated-client tests.
