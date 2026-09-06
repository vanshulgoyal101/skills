# Budget-Aware Provider Routing

## Trigger

Use this when a product calls paid LLM or image providers for tasks with different value, latency, or quality requirements, or when it has per-tenant AI quotas.

## Invariant

Each task selects an explicit cost tier; budget tasks use only the budget pool and fail closed if that pool is unavailable. Quota and prompt-cost checks happen before provider spend.

## Failure pattern

One provider order makes low-value summaries or extraction burn premium tokens. A missing cheap-provider key silently falls through to the expensive pool. A quota is checked after the request, turning a control into an audit log.

## Recommended method

- Declare a task tier such as `budget` or `standard` at the call site.
- Build separate provider registries and never let an empty budget pool escalate to premium providers.
- Record usage, estimated prompt cost, tenant, task, and provider.
- Check monthly quota and prompt-cost limits before making the provider call.
- Return a typed, actionable error when a budget task is not configured.
- Keep this separate from availability cooldowns: cooldowns choose a healthy provider; budget routing chooses an allowed cost class.

## Discriminating checks

- Empty budget pool: assert no premium provider is called.
- Quota exceeded: assert the request fails before any provider call.
- Repeated request: assert usage ledger and cache/single-flight behavior do not double-charge unexpectedly.
- Standard task with budget providers unavailable: assert the standard policy, not accidental fallback, decides the result.

## Common traps

- Reusing provider rotation as cost governance.
- Treating a missing budget key as permission to spend from the paid pool.
- Charging by requested max tokens rather than actual or bounded estimated cost.
- Keeping the ledger separate from the decision path so enforcement is too late.

## Evidence

AdBrain added low-risk budget routing, a paid-usage ledger, monthly quotas, and prompt-cost guards in `16f00e9`, `228a453`, and `bb858ff`.
