# Incident: Strict IPv4 parsing left SSRF alternate forms

- **Date**: 2026-09-04
- **Repository**: ctx and mcp
- **Severity**: Critical security boundary
- **Status**: Fixed and covered by tests

## Symptom

A URL guard that recognized only dotted-decimal IPv4 could miss loopback addresses written in forms accepted by common resolvers.

## Trigger sequence

Inputs such as `127.1`, `0177.0.0.1`, `0x7f000001`, or `2130706433` can resolve to `127.0.0.1` while bypassing a dotted-quad-only check.

## Evidence

`ctx/tests/security.test.ts` and the corresponding MCP security tests cover alternate forms and redirect validation.

## Root cause

The validation parser and the fetch runtime did not share the same address grammar.

## Fix

Parse inet_aton-compatible forms into normalized four-octet addresses, block reserved ranges, and revalidate every redirect hop.

## Regression coverage

Security tests cover strict, short, octal, hexadecimal, packed decimal, malformed, overflow, and redirect cases.

## Residual risk

DNS rebinding and runtime resolver behavior still require defense-in-depth at the network boundary; URL validation alone is not a complete network policy.

## Portable lesson

See [alternate-ipv4-ssrf-defense](../skills/alternate-ipv4-ssrf-defense.md).
