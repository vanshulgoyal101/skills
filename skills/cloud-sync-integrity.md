# Cloud Sync Integrity

## Trigger

Use this skill for offline-first sync, account switching, retries, restore, leaderboard data, optimistic writes, or local/cloud reconciliation.

## Invariants

- A failed write is durable and retryable.
- A retry belongs to exactly one account.
- A newer local best cannot be deleted by an older in-flight acknowledgement.
- Account switching never uploads the previous account's local data.
- Restore errors do not clear local state or advance ownership.
- The blob shape is validated before it enters game state.
- Leaderboard and in-game rank semantics are identical.

## Failure patterns

- Queue key is global but not account-scoped.
- `{ data, error }` is treated as success because the promise resolved.
- Upload success unconditionally deletes a queue entry that was replaced while in flight.
- Account switch clears local data before the new cloud snapshot is known to be usable.
- Hub and deep-linked game use different sync paths.
- Cloud `best` is monotonic but a multi-metric blob is last-write-wins.
- Ties use `row_number()` in one surface and `count(greater)+1` in another.

## Recommended method

1. Store the highest pending value per account and game. If the identity cannot be known offline, do not blindly upload it under a new session.
2. Treat resolved `{ error }` responses as failures.
3. Acknowledge a queue value only if the acknowledged value is at least the currently queued value.
4. Fetch and validate the new account snapshot before clearing old-account data.
5. Reconcile multi-metric blobs explicitly; do not pair a single `best` column with a blob blindly.
6. Make rank semantics explicit. Competition rank is usually `rank()`; deterministic ordering can remain separate.
7. Test both hub and game-side paths.

## Discriminating checks

- Offline game-over, close the tab, reconnect, reopen the game.
- Queue 10, begin upload, queue 12, resolve upload, assert 12 remains.
- Switch A → B while restore is offline; assert A's local data and queue are not uploaded as B.
- Cloud RPC returns `{ error }`; assert retry remains.
- Restore returns scalar/array/corrupt data; assert it is ignored safely.
- Insert tied scores; compare hub rank and in-game rank.

## Common traps

- “The SDK call did not throw” is not success.
- Clearing local state is not rollback.
- A client-side queue without ownership metadata is a cross-account risk.
- A leaderboard cap can hide legitimate product behavior if it is below the game's real maximum.
