# Engineering Skills

Engineering skills for teams running coding agents (Copilot, Claude Code, Cursor and the like).
Each skill is one short Markdown file that names when to use it, the invariant to protect, the
cheapest check that proves it and the evidence needed before calling work done. Every skill
comes from a real bug in a real product, and the [incidents](incidents/) keep that evidence.

## Use a skill in 30 seconds

Pick a skill from the [catalog](CATALOG.md), then either:

- **Point your agent at it.** Add a line to `AGENTS.md`, `CLAUDE.md` or
  `.github/copilot-instructions.md`:

  ```text
  Before changing CI workflows, read https://github.com/vanshulgoyal101/skills/blob/main/skills/ci-merge-throughput.md
  ```

- **Install it as an Agent Skill** (`.github/skills/` or `.claude/skills/`). The skill's
  `## Trigger` line becomes the description the agent matches on:

  ```sh
  name=verification-gates
  mkdir -p .github/skills/$name
  curl -fsSL https://raw.githubusercontent.com/vanshulgoyal101/skills/main/skills/$name.md -o /tmp/$name.md
  { printf -- '---\nname: %s\ndescription: "%s"\n---\n\n' "$name" \
      "$(awk '/^## Trigger/{f=1;next} /^## /{f=0} f&&NF' /tmp/$name.md | tr '\n' ' ' | sed 's/ *$//; s/"/\\"/g')"
    cat /tmp/$name.md; } > .github/skills/$name/SKILL.md
  ```

## Start with these

- [multi-worker-delivery](skills/multi-worker-delivery.md): several agents share one repo
  and one main branch without blocking or overwriting each other.
- [verification-gates](skills/verification-gates.md): what to run before claiming a change
  that crosses source, generated files, the database or a deploy is done.
- [provider-cooldown-rotation](skills/provider-cooldown-rotation.md): rotate across LLM
  providers, models or keys without hammering one that is rate-limited.
- [external-api-error-contracts](skills/external-api-error-contracts.md): turn a provider's
  unstable or localized errors into stable, honest messages for your users.
- [security-boundary-contracts](skills/security-boundary-contracts.md): auth, tenant
  ownership, URL fetching and privileged calls, checked at the boundary.

Every skill, incident and checklist is listed in [CATALOG.md](CATALOG.md).
Run `node validate.mjs` after adding or changing an entry.

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

## License

[MIT](LICENSE).
