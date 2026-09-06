# Incident: Internal Route Was Publicly Reachable

- **Date**: 2026-09-03
- **Repository**: AdBrain
- **Severity**: High
- **Status**: Fixed

## Symptom

The Meta traffic-runner endpoint under `/api/internal/` could be reached without the intended authorization guard after an allowlist guard was removed during workflow work.

## Trigger sequence

1. Add a privileged route under an `/internal/` path.
2. Remove an email allowlist while debugging or changing access behavior.
3. Assume the path name communicates internal intent.
4. The route remains callable without auth and can perform expensive or externally visible campaign work.

## Evidence

The guard was added, removed, then restored across `778e588`, `980108`, and `b61653c`; the route now has auth and rate limiting, with tests covering anonymous rejection and rate-limit ordering.

## Root cause

The boundary was encoded in naming and a local allowlist instead of an invariant tested across the route surface. `/internal/` is a URL convention, not authorization.

## Fix

Reject anonymous callers before doing work, authorize the resource, and rate-limit the expensive route. Keep the guard in the route contract and route-walk tests rather than relying on a path prefix.

## Regression coverage

`tests/api-routes.test.ts` covers the route guard and rate limiter before work. The deploy suite also checks the route contract.

## Residual risk

Every future privileged route still needs to be included in the route-walk inventory; path-based conventions remain useful for organization only.

## Portable lesson

[security-boundary-contracts](../skills/security-boundary-contracts.md).
