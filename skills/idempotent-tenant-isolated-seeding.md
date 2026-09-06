# Idempotent Tenant-Isolated Seeding

## Trigger

Use this when a script creates demo, fixture, or sample data in a multi-tenant database protected by auth and row-level security.

## Invariant

Re-running the seed updates the same tenant-owned rows without duplication, and demo data belongs to a dedicated demo identity rather than the operator's account.

## Failure pattern

Unconditional inserts duplicate every run. Seeding into the developer's own account makes the data fail to exercise real RLS and can contaminate the account's primary-business selection. Creating auth users through raw SQL can also leave token columns incomplete, making normal sign-in fail.

## Recommended method

- Create the dedicated demo auth user through the provider Admin API with email confirmation.
- Sign in as that demo user and perform writes through the same RLS-scoped client as production.
- Match rows on stable natural keys such as `(owner, name)` and update-or-insert.
- Support `--dry-run`, stable asset paths, and safe retries/backoff for external assets.
- Run twice and compare IDs, row counts, ownership, and assets.

## Discriminating checks

- Two consecutive runs produce the same business ID and no duplicate assets/rows.
- The operator's own account is unchanged.
- Demo auth can sign in through the normal path.
- RLS rejects cross-user reads/writes from the demo and operator identities.

## Common traps

- Raw SQL insertion into auth tables instead of the provider Admin API.
- Attaching demo data to the developer account because it is convenient.
- Using a display name as a global key without owner scope.
- Testing only the first run; idempotence is a second-run property.

## Evidence

AdBrain's `seed-demo-clinic.mjs` introduced a dedicated demo user, RLS-scoped writes, stable owner/name keys, dry-run support, and two-run verification in `0c81c25`.
