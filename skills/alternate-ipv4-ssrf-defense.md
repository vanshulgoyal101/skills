# Alternate-Form IPv4 SSRF Defense

## Trigger

When a URL fetcher blocks private, loopback, link-local, or metadata IP ranges before making outbound requests.

## Invariant

The validator interprets an IP address the same way the underlying fetch stack does, including alternate IPv4 spellings and every redirect hop.

## Failure pattern

A guard recognizes only dotted decimal. An attacker supplies `127.1`, an octal form, hexadecimal integer, or decimal integer that the resolver accepts as loopback, bypassing the block and reaching a local service.

## Recommended method

- Parse inet_aton-compatible forms: dotted decimal, short forms, octal, hexadecimal, and packed decimal.
- Normalize to four octets before checking reserved ranges.
- Resolve and re-check every redirect destination, not only the initial URL.
- Reject malformed, overflowing, ambiguous, and non-HTTP inputs conservatively.

## Discriminating checks

Block all equivalents of loopback: `127.0.0.1`, `127.1`, `0177.0.0.1`, `0x7f000001`, and `2130706433`. Test private, link-local, cloud metadata, IPv6, DNS rebinding, redirect chains, malformed components, and overflow.

## Common traps

- Regex-only dotted-quad checks.
- Validating the initial URL but trusting redirects.
- Checking DNS once and assuming the result cannot change.
- Treating URL parsing and socket resolution as identical without testing the runtime.

## Evidence

Both `ctx/src/security.ts` and `mcp/src/security.ts` use alternate-form-aware SSRF checks; their security tests cover short, octal, hexadecimal, and packed IPv4 forms.