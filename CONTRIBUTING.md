# Contributing Skills

## The extraction loop

1. **Anchor**: name the concrete behavior, file, symbol, command, or failing test.
2. **Hypothesis**: write one falsifiable local explanation.
3. **Discriminating check**: choose the cheapest check that could disprove it.
4. **Fix**: change the owning abstraction, not only the visible symptom.
5. **Regression**: add a focused test or executable invariant.
6. **Verification**: run the narrow check first, then the appropriate broader gates.
7. **Extraction**: record the portable pattern without leaking repository-specific or sensitive material.

## Skill format

Use [templates/skill.md](templates/skill.md). A skill should be concise enough to route quickly and concrete enough to act on.

Required sections:

- Trigger
- Invariant
- Failure pattern
- Recommended method
- Discriminating checks
- Common traps

## Incident format

Use [templates/incident.md](templates/incident.md). Incidents must distinguish:

- observed evidence;
- confirmed root cause;
- fix and regression coverage;
- remaining uncertainty.

## Naming

Use lowercase kebab-case. Prefer the reusable concept over the product name: `async-lifecycle-guards`, not `arcade-timer-fix`.

## Review standard

Reject entries that are:

- generic advice without a verified failure;
- framework-specific when the lesson is portable;
- duplicated by an existing skill;
- missing a testable invariant;
- carrying secrets, customer data, or copied proprietary implementation.

## Local validation

Run the repository's zero-dependency validator before committing:

```bash
node validate.mjs
```

It checks top-level headings, local Markdown links, catalog targets, and
secret-shaped values. GitHub Actions runs the same command for pushes and pull
requests.
