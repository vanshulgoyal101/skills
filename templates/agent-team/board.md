# Team Board (template)

Create one issue with this body, pin it, label it `board` and `standing`, and put its
number in `team.config.json` (`boardIssue`). The CEO edits **Priorities** and the CTO
edits the **Workers** table directly in the issue body; the waiter prints the role's
row and the Everyone row on every wake, so an edit here reaches every worker without a
PR, a deploy or a chat message.

```markdown
## Priorities (CEO)

Outcome filter: only work that makes **the core loop work in production**, gets
**an outside pilot live**, or **lowers unit cost** is picked up. Nothing else.

1. <P1: one line, issue link, target date>
2. <P2>
3. <P3>

## Workers (CTO)

Exclusive files: only the listed role writes them while the row is active.

| Role | Now | Next | Exclusive files |
| --- | --- | --- | --- |
| Everyone | <team-wide rule this week, e.g. "no new process tickets"> | | |
| CTO | #<n> <one line> | #<n> | `docs/team/`, labels |
| Dev | #<n> <one line> | #<n> | `src/<area>/` |
| QA | review queue: `merge-gate` PRs | #<n> | `tests/e2e/` |
| DevOps | #<n> release | #<n> | `db/migrations/`, `.github/workflows/` |

## Epics

| Epic | Owner | Done when |
| --- | --- | --- |
| #<n> <name> | <role> | <measurable outcome in production> |
```

Rules that keep the board useful:

- Rows name issues, not intentions. An empty **Now** means the role pulls from the
  `ready` pool.
- One line per cell; detail lives on the issue.
- The CTO refreshes the worker table when an item closes; stale rows are worse than
  none, because the waiter prints them.
- Discuss changes to the board on a separate standing issue, not in the board's comments.
