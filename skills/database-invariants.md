# Database Invariants

## Trigger

Use this skill when correctness depends on SQL triggers, RPCs, caps, RLS policies, constraints, or SECURITY DEFINER functions.

## Invariant

The database is the final authority for safety and integrity. Every client write path, including direct fallback writes and old clients, must pass the same invariant boundary.

## Failure pattern

A browser can forge usage events, an API row limit truncates monthly totals, or concurrent requests each count the same available rate-limit slot before inserting. RLS alone does not make accounting trustworthy or serialize read-then-write decisions.

## Recommended method

- Put caps and normalization in one canonical SQL function.
- Enforce the invariant with a trigger or constraint on every write path.
- Keep monotonic fields monotonic in the trigger, not only in an RPC.
- Validate JSON shape and size at the boundary.
- Use explicit `search_path` on privileged functions and schema-qualify calls.
- Test behavior, not only function definitions.
- Use throwaway rows, existing valid foreign keys, and `finally` cleanup for live integration tests.
- Use a read-only audit to compare authoritative columns with derived values in stored blobs.
- Restrict authoritative usage writes and limiter execution to trusted server roles while preserving owner-scoped reads. Test actual browser-role denials, not only policy text.
- Aggregate quota inputs in the database with tenant scope intact; exercise more rows than the API's default page size and prevent historical negative values from reducing totals.
- Serialize count-and-insert decisions by rate-limit key. Read wall-clock time after acquiring the lock so waiting does not consume the new event's window.
- Fail closed when shared production protection is unavailable. A per-instance development fallback is not equivalent protection across production instances.
- Coordinate permission-changing migrations with compatible application code. Describe both deployment orders and keep trusted-client behavior in the rollback; never restore browser write access as a shortcut.

## Discriminating checks

- Insert a negative value and assert the normalized value.
- Write above each product's legitimate maximum and assert clamp behavior.
- Insert high then upsert low and assert the high value remains while allowed metadata updates.
- Write oversized and wrong-shaped JSON and assert null/rejection policy.
- Assert zero-score backup rows do not rank.
- Assert tied-score rank semantics.
- Recompute every stored headline from its blob and flag under-reported rows.
- Run fresh installation, ordered upgrade and repeated migration paths against temporary PostgreSQL, including authenticated tenant isolation and denied browser writes/RPC calls.
- Race more concurrent requests than the available slots and assert the exact admitted count. Test unavailable shared protection separately from development fallback.
- Seed beyond the API page limit and compare the owner-scoped aggregate with the complete expected total.

## Common traps

- PostgreSQL trigger operation names are uppercase (`UPDATE`, not `update`).
- A passing `pg_get_functiondef` check does not prove a trigger branch executes.
- A cap that is below the game's reachable maximum silently corrupts legitimate scores.
- `SECURITY DEFINER` without a fixed search path is fragile.
- Management API tests do not automatically reproduce `auth.uid()` context; distinguish admin tests from authenticated-client tests.
- A `NOT VALID` constraint protects new writes but does not certify historical rows; audit and validate those separately without silently rewriting history.
- Best-effort telemetry after paid work plus a quota preflight is not an atomic reservation or a hard provider spending cap.
- Publishing code does not prove the matching migration has been applied to the intended database.

## Evidence

AdBrain commit `1dbb4e9` (2026-09-16), its trusted-usage/rate-limit migration and `scripts/check-meta-connect-db.mjs`, records fresh and ordered-upgrade checks, browser privilege denial, tenant isolation, 1,100-event aggregation and twelve concurrent requests competing for three slots. The dated security audit records local PostgreSQL evidence, not remote migration completion.
