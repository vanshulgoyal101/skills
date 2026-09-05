# Learning Sources

This file tracks where future skills and incidents come from. It is deliberately high-level: do not copy source code, secrets, customer data, or private documents into this repository.

| Repository | Current extraction areas | Status | Next useful slice |
|---|---|---|---|
| `arcade` | Browser game lifecycle, sync integrity, DB invariants, generated assets, mobile input, accessibility | Seeded | Keep adding only verified incidents |
| `adbrain` | Budget/spend safety, provider rotation, creative persistence, auth and database boundaries | Planned | Extract spend enforcement and provider-failure invariants |
| `vanshul-portfolio` | Build/deploy gates, generated SEO/OG assets, client hydration, browser verification | Planned | Extract build artifact and deployment parity |
| `tools` | Multi-tool UI workflows, links/assets, E2E verification | Planned | Extract user-facing tool contract and navigation checks |
| `vbrain` | Knowledge provenance, privacy boundaries, durable personal context | Planned | Extract source trust and sensitive-data handling |
| `reader` | Worker boundaries, URL fetching, content normalization | Planned | Extract network timeout and untrusted-content rules |

## Intake protocol

For each repository:

1. Read its local instructions and build/test commands.
2. Find a concrete bug, failing behavior, or verified design constraint.
3. Record an incident with evidence and residual risk.
4. Generalize the smallest portable pattern into a skill.
5. Add a checklist only when the pattern recurs across work.
6. Link the new entry in `CATALOG.md` and update this table.
