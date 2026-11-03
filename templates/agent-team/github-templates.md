# GitHub Templates (template)

The issue and PR templates make every handoff self-contained: a worker that wakes on
an issue it has never seen can start without asking anyone. Copy each block to the
named file.

## `.github/ISSUE_TEMPLATE/work.md`

```markdown
---
name: Work item
about: One real problem, with the evidence and when it's done
---

**Why:** what's wrong or missing, with evidence (production row, screenshot, failing test, link).

**Do:** the change, in a sentence or a short list.

**Done when:** the check that proves it (a test, a production smoke, a query result).

**Files:** where to start (`src/…`, `tests/…`).

**Risk:** low / money / migration / tenant

→ Role: ready to pull
```

## `.github/pull_request_template.md`

```markdown
Role: fixes #

**Why:** the problem and its evidence.

**Change:** what this PR does.

**Done when / evidence:** the red-then-green test, the core check, and the production check after release.

**Files:** the main ones.

**Built properly:**
- [ ] Every layer it needs changed in the right place: types, DB, service, API, UI, words, docs
- [ ] Reused or extended existing code; no duplicated logic, no one-off special cases
- [ ] Tests at the right level (unit / recorded core test / e2e)
- [ ] Any shortcut has a `TODO(#issue)` and a follow-up issue
- [ ] Risky path: a subagent that did not write this attacked it; result: <one line>

**Risk:** low / money / migration (base `main`) / tenant. Low auto-merges on green CI; anything else waits for the merge-gate approval.

→ Role: next step
```

## Comment shapes

| Purpose | Shape |
| --- | --- |
| Handoff | `Dev 2: PR #812 merged, smoked in production (screenshot in PR). → QA: walk the phone view.` |
| Gate approval (merge-gate reads it) | `gh pr review <n> --comment --body "QA review of <head-sha>: **approved**. <one line why>"` |
| Scheduled check | `QA 2: launched test run; first results tomorrow. Next read 2026-11-03T06:00Z` |
| Escalation to the coordinator | new issue labelled `decision`: the question, the options, a recommendation |
| Blocked on the human | label `waiting-owner` + one line of the exact action needed |
| Lesson on close | `Lesson: <what failed>; <the check that proved it>; <the fix>.` |

Everyone posts as one GitHub user, so the role prefix is the only author signal; the
waiter treats a comment whose prefix is your role as "you spoke last".
