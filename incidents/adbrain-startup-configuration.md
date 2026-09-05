# Incident: Configuration Failure Discovered Too Late

- **Date**: 2026-09-05
- **Repository**: adbrain
- **Severity**: High
- **Status**: Resolved with startup schema validation

## Symptom

A deployment can appear available while a missing or malformed provider, URL, or limit setting only fails when the affected request path is first used.

## Trigger sequence

Deploy with an absent required environment value or a value in the wrong format, then invoke the dependent feature.

## Evidence

AdBrain centralizes environment parsing in `src/lib/env.ts` and tests required values, defaults, URL parsing, coercion, and comma-separated configuration in `tests/env.test.ts`.

## Root cause

Raw deployment configuration was allowed to cross into runtime behavior without one typed validation boundary.

## Fix

Validate configuration through a declarative schema before business logic receives it, and keep secrets out of diagnostics.

## Regression coverage

Configuration tests cover required/optional paths and malformed values. The focused command is the repository's environment test file.

## Residual risk

Provider availability and credentials can still fail after validation; health checks and provider-specific smoke tests remain separate concerns.

## Portable lesson

Update [env-validation-schema](../skills/env-validation-schema.md) when the configuration contract changes.
