# Task-Aware LLM Routing

## Trigger

Use this skill when one product sends multiple kinds of work to several LLM
providers, especially when some tasks are expensive or latency-sensitive and
others are extraction, summarization, classification, or conversational glue.

## Invariant

Every LLM call declares its task class and is routed only through the provider
pool allowed for that class. A low-risk task cannot silently spend through the
premium pool, while a quality-critical task is not accidentally downgraded.

## Failure pattern

A global provider order is reused for every call. A website autofill or short
summary reaches a reasoning-heavy paid model, exhausts its output budget, costs
money, or fails with an error that incorrectly tells the operator to change
creative-generation settings.

## Recommended method

1. Define named routing pools such as `standard` and `budget`; keep the pool
   policy in the orchestrator, not scattered across callers.
2. Require every non-default task to declare its route and a human-readable task
   name. Do not infer cost policy from prompt wording.
3. Make budget routes exclude premium providers by construction. If the budget
   pool is empty, fail closed rather than falling through to the premium pool.
4. Keep model-specific reasoning controls separate from the total output budget.
   Use minimal or disabled reasoning for extraction and summaries where supported.
5. Record provider, model, route, task, usage, latency and failure reason without
   logging keys or prompt secrets.
6. Keep high-value creative planning and campaign decisions on the stronger route;
   cost control is not permission to lower quality everywhere.

## Discriminating checks

- Put the premium provider first globally and verify a budget call still selects
  the budget provider.
- Empty every budget-provider key pool and verify the budget call fails without
  contacting the premium provider.
- Simulate a truncated budget response and verify the error names the actual task.
- Verify creative generation and campaign planning retain the standard route.
- Inspect production variable presence and route receipts without printing values.

## Common traps

- Calling every task through `LLM_PROVIDER_ORDER`.
- Calling a pool "free" when the provider account may still bill.
- Falling back from a budget route into a paid route to improve availability.
- Setting one global reasoning effort and token budget for every model/task.
- Treating a successful HTTP response as proof the intended provider was used.

## Evidence

AdBrain's website autofill inherited the paid OpenRouter creative route and failed
with a creative-specific token-budget message. Explicit `standard`/`budget`
routing moved autofill, interviews and campaign summaries to Groq/Google/Cerebras,
while creative and campaign planning retained the premium route.
