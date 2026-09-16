# Security Boundary Contracts

## Trigger

Use this skill when a feature crosses authentication, tenant ownership, URL fetching, browser automation, storage, database policy, external APIs, or privileged operations.

## Invariant

Every boundary has one explicit owner for authorization, validation, scope, and failure behavior; downstream code cannot accidentally widen access by trusting a weaker representation.

## Failure pattern

A route checks that a user is signed in but not that they own the target business; a fetcher validates only the first URL form or redirect; a browser tool runs arbitrary code against an untrusted origin; or a database policy and application assumption disagree. The feature appears functional while its trust boundary is porous.

## Recommended method

- **Authorization:** check resource ownership after lookup. Walk the route tree and test anonymous rejection before work, including internal-looking endpoints.
- **Runtime input:** normalize URLs, IPs, paths and scopes as the consumer does. Validate JSON shape and database bounds before defaults or side effects, including restores/retries. Return bounded errors without raw provider diagnostics.
- **DNS:** validate at connection lookup; reject empty or mixed public/private answers. Pass validated addresses directly to the socket while retaining the URL hostname for HTTP/TLS.
- **Transport:** share the guard with media downloads. Validate every redirect, use one deadline, prevent sensitive headers crossing origins, and cancel rejected bodies.
- **Resource limits:** count streamed bytes despite missing/dishonest Content-Length; bound decoded image pixels separately. Declared MIME types do not validate bytes.
- **Auth destinations:** accept an explicit local-path grammar and check the resolved URL. Reject authority forms, backslashes and control characters; unchecked concatenation can change the host.
- **Analytics:** apply privacy rules to every collector. Disable SDK auto-events; omit private routes and unnecessary URL/referrer data. Recheck route and DNT/GPC on delayed load, and cancel stale callbacks on navigation/unmount.

## Discriminating checks

- Change tenant IDs, omit credentials, and exercise alternate syntax/redirects. Assert rejection at the actual route and consumer, not only a schema helper.
- Check browser/external-content paths never treat untrusted remote text as executable instructions.
- Use the real guarded dispatcher with internal, mixed and mapped-IPv6 DNS answers. Ordinary domains resembling IP prefixes must still work.
- Feed multibyte text with dishonest Content-Length; assert the oversized stream cancels before buffering the remainder.
- Reject malformed bodies and callback destinations before writes or external calls.
- Navigate public-to-private before analytics loads, change privacy preferences, and unmount with a pending event. Inspect exact fields and assert no stale/private count.

## Common traps

- Treating sign-in or an `/internal/` prefix as resource authorization.
- Regex-only URL checks, or validating DNS before an independent client lookup.
- Trusting types after JSON, storage or network input.
- Checking only the first request, collector or callback state.
- Treating character counts, MIME declarations or Content-Length as authoritative limits.

## Evidence

- [SSRF incident](../incidents/ssrf-alternate-ipv4-bypass.md) and [JSON-LD incident](../incidents/vbrain-jsonld-injection.md): runtime-aligned validation.
- AdBrain `8a87d5b` (2026-09-16), `tests/ssrf.test.ts`: guarded dispatcher, mapped addresses, redirect deadline, byte limits and cancellation. `fb5b0cf`: direct callback/autofill/API rejection tests.
- Portfolio `556536a` (2026-09-16), `src/components/Analytics.test.jsx`: sanitized counts, private routes, DNT/GPC and delayed-load cleanup.

Fixtures do not establish production egress or provider success. Preventing new analytics collection does not remediate historical records.
