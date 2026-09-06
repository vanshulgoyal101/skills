# Security Response Headers

## Trigger

Use this when a browser-facing app or static site serves HTML through Next.js, Cloudflare, Vercel, GitHub Pages, or another web origin.

## Invariant

Every HTML response carries a tested security baseline, and the deployed response matches the tested policy.

## Failure pattern

A green build ships without CSP, MIME-sniff protection, frame protection, or a referrer policy. The omission is invisible in local UI testing. The inverse failure is an over-strict CSP that blocks required analytics, OAuth, images, or API calls.

## Recommended method

- Keep the header policy in one source of truth.
- Include CSP, `X-Content-Type-Options: nosniff`, frame protection via `frame-ancestors` or `X-Frame-Options`, `Referrer-Policy`, and a restrictive `Permissions-Policy`.
- Build CSP from the actual configured origins used by the app.
- Unit-test the header map and add a post-deploy `curl -I` check.
- Treat third-party analytics and OAuth as explicit allowlist decisions, not reasons to remove CSP.

## Discriminating checks

- Assert every required header and its value in unit tests.
- Run `curl -sSI https://production.example` and grep the live response for the baseline.
- Load the production app with analytics, OAuth, images, and API calls enabled; verify CSP reports no required-origin blocks.

## Common traps

- Testing only the local response while the CDN or platform rewrites headers.
- Using `X-Frame-Options` alone when nested framing policy needs `frame-ancestors`.
- Adding `'unsafe-eval'` or wildcard origins to make a broken CSP disappear.
- Forgetting that a static site can still need security headers.

## Evidence

AdBrain added and tested an OWASP baseline in `c79879f`; vbrain later had to adjust CSP so Cloudflare analytics was not blocked in `8fb86a9`.
