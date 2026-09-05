# Incident: Tenant Policy Coverage Gap

- **Date**: 2026-09-05
- **Repository**: adbrain
- **Severity**: Critical
- **Status**: Resolved by complete table and storage policy coverage

## Symptom

A shared database can contain multiple customers, but a newly added table or object path may not automatically inherit the tenant boundary from existing application code.

## Trigger sequence

Add a table, relation, RPC, or storage object, then query it with an authenticated identity that does not own the data.

## Evidence

AdBrain's database schema and schema tests enumerate row-level-security policies and owner-scoped access rather than relying only on application filters.

## Root cause

Tenant isolation was treated as a route-level behavior instead of a database invariant that must be re-established for every exposed surface.

## Fix

Enable RLS, define explicit operation policies, constrain inserts and updates, and mirror the boundary in storage policies. Add enumeration tests for future schema changes.

## Regression coverage

Schema-level policy tests and cross-tenant integration tests should fail when a table or storage path lacks the expected owner boundary.

## Residual risk

Service-role operations intentionally bypass user policies and require separate authorization review and audit coverage.

## Portable lesson

Use [supabase-rls-complete](../skills/supabase-rls-complete.md) for every multi-tenant database change.
