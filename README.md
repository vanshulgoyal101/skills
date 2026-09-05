# Engineering Skills

A growing, evidence-backed engineering playbook extracted from real repositories.

This is not a scrapbook of tips. Each entry exists to prevent a class of bug from returning. Skills describe the reusable pattern; incidents preserve the concrete failure that taught it; checklists turn the pattern into a repeatable workflow.

## Why This Exists

Across projects, the same failures recur under different names:

- delayed callbacks mutate a newer run or view;
- parsed JSON is trusted as if TypeScript survived runtime;
- offline writes disappear or cross account boundaries;
- database guards disagree with what the product can legitimately produce;
- generated output and source registries drift;
- mobile gestures are measured at the wrong lifecycle boundary;
- accessibility regressions hide inside seemingly harmless CSS or icon changes;
- tests prove green paths but not the restart, race, corruption, and deployment edges.

The skills repository makes those lessons portable.

## Repository Layout

```text
skills/
  CATALOG.md
  skills/       reusable engineering patterns
  checklists/   short workflow gates
  incidents/    verified failures and their fixes
  PRODUCT_CATALOG.md  distilled capability map across products
  templates/    formats for adding future knowledge
```

## Adding Knowledge From Another Repository

1. Start with a concrete anchor: bug report, failing test, file, symbol, or live symptom.
2. Reproduce the behavior with the cheapest discriminating check.
3. Record the root cause and the smallest safe fix in an incident.
4. Extract only the portable pattern into a skill.
5. Add or update a checklist if the lesson belongs in a recurring workflow.
6. Update `CATALOG.md` and run the repository's validation gate.

For product-level context, update the source repository's own feature docs first,
then distill the stable capability into [PRODUCT_CATALOG.md](PRODUCT_CATALOG.md).

Do not copy proprietary source, secrets, customer data, or large code blocks. Capture the behavior and the reasoning, then link back to the owning repository only when that reference is safe and useful.

## Working Agreement

A good skill answers:

- When should an engineer reach for it?
- What failure mode does it prevent?
- What invariant should remain true?
- What is the cheapest test that can disconfirm the assumption?
- What evidence is required before calling the work complete?

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full format.
