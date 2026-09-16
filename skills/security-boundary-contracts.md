# Security Boundary Contracts

## Trigger

Use this skill when a feature crosses authentication, tenant ownership, URL fetching, browser automation, storage, database policy, external APIs, or privileged operations.

## Invariant

Every boundary has one explicit owner for authorization, validation, scope, and failure behavior; downstream code cannot accidentally widen access by trusting a weaker representation.

## Failure pattern

A route checks that a user is signed in but not that they own the target business; a fetcher validates only the first URL form or redirect; a browser tool runs arbitrary code against an untrusted origin; or a database policy and application assumption disagree. The feature appears functional while its trust boundary is porous.

## Recommended method

- Identify the trust boundary before implementing the happy path.
- Normalize inputs in the same form used by the runtime: URLs, IPs, paths, IDs, account scopes, and browser origins.
- Authorize at the narrowest resource boundary and re-check ownership after lookup.
- Validate every redirect, retry, storage restore, and external response that can cross the boundary.
- Return safe, bounded errors and avoid exposing secrets or untrusted content as instructions.
- Add tests for alternate representations, wrong tenants, missing auth, redirects, stale state, and malformed input.
- Walk the route tree on disk and assert every privileged endpoint rejects anonymous callers before doing work; `/internal/` in a URL is organization, not authorization.
- Bind DNS validation to the connection lookup, not a separate preflight query. Reject empty or mixed public/private answer sets and pass only validated addresses to the socket while preserving the URL hostname for HTTP/TLS.
- Route user-controlled media downloads through the same guarded transport. Use one deadline across redirects, reject sensitive-header forwarding across origins, and cancel rejected bodies.
- Enforce streamed byte limits even when Content-Length is missing or dishonest. Bound decoded image pixels separately; upload MIME declarations are usability checks, not validation of image bytes.
- For post-auth destinations, accept an explicit local-path grammar and validate the resolved URL. Reject authority forms, backslashes and control characters; concatenating an origin with unchecked text can change the parsed host.
- Validate JSON shape and numeric database bounds before choosing defaults or performing work. Malformed requests must have no side effects, and client errors must not expose raw database/provider diagnostics.

## Discriminating checks

- Can an authenticated user access another tenant's resource by changing an ID or slug?
- Does validation cover alternate syntax and every redirect/retry hop?
- Does the same normalized value reach the database, socket, browser, or filesystem runtime?
- Do missing credentials fail closed without leaking secrets?
- Does a browser or external-content path distinguish trusted local content from arbitrary remote code?
- Does a real fetch using the guarded dispatcher reject an internal DNS answer before connecting? Include mixed DNS answers and IPv4-mapped IPv6, plus ordinary domains that resemble IP prefixes.
- Does an oversized stream stop and cancel without buffering the remainder, including multibyte text under a dishonest Content-Length?
- Do malformed bodies and rejected callback destinations fail safely before writes or external calls? Test the actual route, not only the schema helper.

## Common traps

- Authentication-only guards for resource-scoped operations.
- Regex-only SSRF or path checks.
- Validating the initial request but not redirects or retries.
- Trusting TypeScript types after JSON, storage, or network input.
- Turning user-controlled external content into executable instructions.
- Assuming an internal-looking route prefix is an auth boundary.
- Checking DNS and then letting the HTTP client resolve the hostname again.
- Treating character counts, declared MIME types, or Content-Length as authoritative resource limits.

## Evidence

The ctx/MCP SSRF incidents, vbrain JSON-LD boundary work, AdBrain tenant and Meta routes, and the browser approval investigations all required runtime-aligned trust boundaries rather than surface checks.

AdBrain commit `8a87d5b` (2026-09-16), `src/lib/security/ssrf.ts` and `tests/ssrf.test.ts`, adds connection-time DNS rejection through the actual dispatcher, mapped-address cases, a shared redirect deadline, and streaming byte/cancellation checks. DNS and provider fixtures do not establish production egress policy or real provider success.

AdBrain commit `fb5b0cf` adds direct auth-callback, autofill and API-route tests for local-only destinations, malformed bodies, bounded spend values and zero work on rejected inputs.
