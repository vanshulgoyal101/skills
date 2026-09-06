# Incident: Managed Database Auto-Paused Production Auth

- **Date**: 2026-09-05
- **Repository**: AdBrain
- **Severity**: High
- **Status**: Mitigated

## Symptom

The managed Supabase project auto-paused after inactivity. Because auth and application data shared that project, login and production application flows went down together.

## Trigger sequence

1. Run production auth/data on a free-tier project with inactivity pausing.
2. No uptime probe or explicit billing-tier safeguard exists.
3. The project pauses; the app appears broken even though the application deploy is healthy.

## Evidence

AdBrain recorded the pause and its auth impact in commit `89495e8`; production HTTP and application code were not the root cause.

## Root cause

Availability depended on a managed service tier whose lifecycle policy was not represented in deployment or monitoring checks.

## Fix

Resume the project, then add an uptime probe and make the tier/auto-pause decision explicit in release operations. For production auth, use a non-pausing tier or an intentionally accepted availability budget.

## Regression coverage

Probe the health/auth endpoint on a schedule and alert on non-2xx responses. Include the managed-service status in the deploy checklist.

## Residual risk

A probe may prevent inactivity pauses but does not replace capacity, quota, or incident monitoring. The billing-tier decision remains operational, not test-only.

## Portable lesson

Environment and release operations must include managed-service lifecycle policies, not only application builds.
