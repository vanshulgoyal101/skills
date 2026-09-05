# Incident: Reader Alternate IPv4 SSRF Bypass

- **Date**: 2026-09-05
- **Repository**: reader
- **Severity**: High
- **Status**: Resolved

## Symptom

Reader's URL guard blocked canonical private IPv4 addresses but did not recognize equivalent short, octal, hexadecimal, or packed-decimal forms.

## Trigger sequence

Submit a URL using `127.1`, `0177.0.0.1`, `0x7f000001`, or `2130706433` as the host and pass it to the fetch boundary.

## Evidence

The original Reader parser accepted only four dotted decimal components. The sibling MCP service already handled inet_aton-compatible forms. Reader regression tests now cover all four loopback spellings.

## Root cause

Two sibling products implemented the same SSRF contract independently and diverged in how URL runtimes interpret IPv4 literals.

## Fix

Align Reader's parser with the alternate-form-aware implementation and normalize every supported spelling to four octets before private-range checks.

## Regression coverage

`reader/tests/security.test.ts` rejects canonical, short, octal, hexadecimal, and packed-decimal loopback forms. Run `npm test -- --run tests/security.test.ts` and `npm run typecheck` from the Reader repository.

## Residual risk

DNS rebinding and resolver behavior remain runtime-specific concerns. Redirect destinations must continue to pass the same validation boundary.

## Portable lesson

Use [shared-security-parity](../skills/shared-security-parity.md) together with [alternate-ipv4-ssrf-defense](../skills/alternate-ipv4-ssrf-defense.md) whenever sibling fetchers share a security contract.
