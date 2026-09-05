# Verification Gates

## Trigger

Use this skill for any change that crosses source, generated assets, shared modules, database behavior, or deployment state.

## Invariant

The checked-in source, generated artifact, live behavior, and documentation agree before release.

## Gate order

1. **Focused behavior check**: reproduce the reported or hypothesized failure.
2. **Narrow tests**: exercise the touched model, DOM path, or integration boundary.
3. **Type/build check**: compile every consumer of changed shared code.
4. **Artifact check**: promote and inspect generated references, asset versions, and URLs.
5. **Full suite**: run all tests.
6. **Live invariant check**: only where the change affects production database or sync behavior.
7. **Browser check**: verify one real desktop/mobile interaction and one accessibility state.
8. **Diff hygiene**: inspect staged paths, preserve unrelated work, run whitespace checks.
9. **Documentation**: update the catalog/skill/incident if the new knowledge is reusable.

## Reporting standard

Record exact counts and commands, distinguish warnings from failures, and call out anything not tested. A green unit suite does not prove generated assets or live SQL are correct.

## Common traps

- Trusting stale language-server diagnostics over the build.
- Running only the full suite after a bug fix and missing the causal check.
- Calling a database definition check “functional” without exercising the trigger.
- Forgetting to rebuild all consumers of a shared module.
- Committing generated output from another actor or leaving the tree dirty.
