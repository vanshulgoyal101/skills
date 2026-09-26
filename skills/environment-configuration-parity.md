# Environment Configuration Parity

## Trigger

Use this skill when behavior depends on environment variables, local defaults, deployment settings, cron jobs, provider models, feature flags, or generated runtime configuration.

## Invariant

The configuration validated in development, committed documentation, CI, and production represents the same contract, with explicit differences that are intentional and testable.

## Failure pattern

A feature is implemented or tested against one environment while another silently uses a missing, stale, or unsafe value. Common symptoms include production-only outages, disabled cron protection, retired model failures, and a local build that does not match the deployed runtime.

## Recommended method

1. Define the configuration contract in one typed/schema boundary.
2. Distinguish required, optional, local-only, and production-only variables.
3. Validate names, formats, bounds, and provider/model compatibility at startup or the operation boundary.
4. Keep `.env.example`, deployment docs, CI, cron configuration, and live settings aligned.
5. Add a safe diagnostic that reports presence and validity, never secret values.
6. Test missing, empty, invalid, and stale configuration as first-class cases.

### Branch rules and real deployment behavior

- Verify the platform's matcher, precedence and unmatched-branch behavior. With
	minimatch-style paths, `*` may not span `/` while `**` does; do not treat them
	as interchangeable catch-all rules.
- Test plain, one-level and nested branch names plus the intended production
	exception. Test the candidate's committed config, not only the default branch.
- Confirm a controlled allowed/disabled deployment through provider records for
	the exact source. A plausible JSON rule or project pointer alone is not proof.
- If observations contradict suppression, stop further affected publication,
	assess configured environment exposure and access controls, and repair the rule.
	Do not claim a breach or rotate/delete resources solely from a preview's existence.
- When repaired behavior and affected candidates are verified, replace the global
	hold with the actual candidate prerequisite. Do not keep resolved incidents as
	permanent approval barriers.
- Inspect environment names/scopes and validity without values. Preview isolation,
	production-only variables and SSO evidence are bounded observations, not proof
	that no historical credential or provider access ever existed.

### Local execution is not environment isolation

- A localhost app can load production data or paid provider keys. Use explicit
	synthetic test configuration and disable implicit dotenv loading where supported.
- Scrubbed environment variables and a process network guard are not an OS sandbox.
	Never claim zero external calls merely because a test was called local or mocked.
- Test/live payment configuration must be explicit and mutually constrained, not
	selected from an ambiguous mixture of legacy and current key names.

## Discriminating checks

- Does the type/schema boundary reject missing or malformed values before the feature runs?
- Does a production-like environment exercise the same provider/model and cron/auth contract?
- Can a diagnostic distinguish unset, empty, invalid, and valid without printing secrets?
- Does the deployed route or scheduled job return the expected status for missing and incorrect credentials?
- Are retired provider models or stale generated configuration detected before user traffic reaches them?

## Common traps

- Copying a local `.env` into production without schema validation.
- Treating an empty secret as equivalent to an absent optional value without documenting it.
- Keeping model names or cron secrets only in deployment UI with no repository contract.
- Logging full environment objects during debugging.
- Assuming a green local test proves Vercel, Worker, or scheduled execution is configured.

## Evidence

AdBrain's provider outage and cron/spend work showed that retired model names and unset deployment secrets can disable otherwise correct product paths. The repo uses typed environment validation and deployment/runtime checks as the durable boundary.
