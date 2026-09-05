# Environment Validation Schema

## Trigger

When an application depends on environment variables, deployment secrets, provider settings, URLs, numeric limits, or comma-separated configuration.

## Invariant

Invalid configuration is rejected at startup or at the configuration boundary with field-specific errors. Runtime code receives one validated, typed configuration object rather than reading raw environment variables throughout the application.

## Failure pattern

A missing, malformed, or incorrectly coerced environment value is discovered only after a request reaches the affected code path. Deployments appear healthy while a provider, URL, limit, or feature silently fails in production.

## Recommended method

Define one declarative schema at the configuration boundary. Separate required values from optional values with explicit defaults, coercion, URL parsing, and list transforms. Export a typed accessor and keep raw environment reads out of business logic.

## Discriminating checks

- Start with a missing required variable and verify startup fails with the variable name.
- Supply malformed URLs, numbers, and comma-separated values and verify they are rejected or normalized intentionally.
- Test the optional/default path separately from the required path.
- Search changed code for direct raw environment reads outside the configuration module.

## Common traps

- Treating a present-but-empty value as valid.
- Using string values where a boolean or number is required.
- Logging the full configuration and leaking secrets.
- Validating only in deployment scripts while local tests bypass the same contract.
