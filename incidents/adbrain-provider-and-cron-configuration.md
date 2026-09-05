# AdBrain Provider And Cron Configuration

## Trigger

AdBrain generation began failing across providers, and spend protection depended on a scheduled route whose production secret had not been confirmed.

## Impact

Generation could fail even with healthy application code because a retired provider model and exhausted fallback pool left no eligible candidate. Spend auto-pause protection could also be absent if the cron secret was unset.

## Evidence

- The configured Groq Llama model returned a model-not-found response after retirement.
- Gemini keys returned quota or overload responses.
- OpenRouter and Cerebras pools were empty.
- The deployed cron route was present, but its secret configuration required an explicit production check.

## Root cause

Provider/model compatibility and deployment configuration were treated as operational details rather than a tested runtime contract.

## Fix

- Make the provider model configurable with a verified default.
- Rotate across providers and keys with cooldowns and bounded failure handling.
- Keep the spend enforcement route and cron declaration together with typed secret validation.
- Add safe environment diagnostics and production checks that report presence/health without exposing credentials.

## Regression coverage

Provider parsing, rotation, cooldown, model failure, environment validation, spend enforcement, and route tests cover the main failure classes.

## Residual risk

External provider retirement, quota changes, and deployment-secret drift remain operational risks; monitoring and periodic production probes are still required.
