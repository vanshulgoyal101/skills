# Incident Collection: Arcade Sync and Integrity

## Scope

Verified failures found while hardening Tiny Arcade's local/cloud/database contract.

## Confirmed failures

- Offline score submissions were swallowed instead of queued.
- An unregistered hidden game could survive account switching and upload another account's local score.
- An older in-flight upload could clear a newer queued best.
- Hub upload cleared the retry queue even when Supabase returned `{ error }`.
- Account restore could clear the previous account before the new snapshot succeeded.
- A transient profile read failure could seed Google fallback identity over a custom profile.
- A scalar or array cloud blob could enter restore paths.
- A Flash server cap of 500 truncated a legitimate 665 wpm run while the game allowed 900.
- Hub and game ranks disagreed on ties.

## Durable fixes

The repository now has an account-safe retry queue, value-aware acknowledgements, fetch-first account switching, exact auth-function tests, object-shaped client/database store validation, live cap/integrity audits, and competition-rank semantics.

## Reusable skills

- [cloud-sync-integrity](../skills/cloud-sync-integrity.md)
- [runtime-storage-boundaries](../skills/runtime-storage-boundaries.md)
- [database-invariants](../skills/database-invariants.md)
- [generated-source-parity](../skills/generated-source-parity.md)
