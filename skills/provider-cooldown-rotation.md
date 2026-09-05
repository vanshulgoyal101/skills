# Provider Cooldown Rotation

## Trigger

When a product calls multiple external providers, models, accounts, or API keys for the same operation.

## Invariant

One provider failure does not make the user-visible operation fail when another eligible provider can complete it; rate-limited or retired combinations are not hammered repeatedly.

## Failure pattern

A sequential fallback retries a dead model or exhausted key, then emits a generic error even though another configured provider could serve the request. The operator cannot tell whether the problem is quota, authentication, retirement, or a transient outage.

## Recommended method

1. Model each provider/key pair as a candidate with a standard error category.
2. Try each eligible pair once per operation in round-robin order.
3. Cool down rate-limited pairs; fail fast on retired models or invalid configuration.
4. Record provider, model, key slot, status, and reason without logging secrets.
5. Throw one actionable aggregate error only after all candidates are exhausted.

## Discriminating checks

- Mock a 429 and verify the pair is skipped during cooldown and retried after expiry.
- Mock a 404 model-retired response and verify the next provider is attempted without repeated hammering.
- Mock a 5xx and verify bounded retry behavior.
- Configure no candidates and assert a clear configuration error.
- Make every candidate fail and assert the aggregate error names provider/reason, never the key value.

## Common traps

- Retrying a rate-limited key immediately.
- Rotating keys while keeping a retired model name.
- Hiding all provider failures behind “AI unavailable.”
- Logging authorization headers or full provider responses.

## Evidence

AdBrain's `src/lib/llm/index.ts` rotates providers and keys with cooldowns; tests and operational notes cover Gemini 429s and retired Groq models.