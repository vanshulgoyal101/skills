# Recurring Helper Runs (template)

Standing chats do the work; short scheduled one-shot runs do the chores no chat should
remember. Each run starts fresh, reads GitHub, acts within hard limits, leaves at most
one comment, and exits. Use any scheduler that can start an agent with a prompt
(a local agent host's automations, cron plus a headless CLI, or a CI schedule).

Rules for every run:

- State the role and sign comments `<Role> (helper):`.
- Name what it may **not** do: file edits, PRs, worktree switching, paid runs,
  production writes, session deletion, printing secrets.
- Call tools by absolute path and avoid shell variables in destructive commands, so
  unattended runs never stop for an approval prompt.
- Keep one rolling comment per run and **edit it in place** instead of posting daily.
- Say "n/a" when a source is unavailable; never invent or reuse stale numbers.
- Delete its own finished helper sessions older than this run.

## The set AdBrain runs

| Run | Schedule | Role | Does |
| --- | --- | --- | --- |
| Daily scorecard | daily 09:00 | CEO | Outcomes and delivery metrics vs. baseline and target; edits one rolling comment on the experiments issue; escalates only a second-day miss |
| High-value backlog | daily 09:15 | CEO | Finds real customer blockers (production errors, red CI, unsliced epic steps), dedupes hard, files at most 3 briefed `ready` issues, or none |
| Worktree cleanup | daily 09:30 | Janitor | Removes worktrees that are clean, merged (`git cherry`), not in use and not parked; never `--force`, only `branch -d` |
| UI walk | daily 10:00 | QA 2 | Read-only production walk at phone and desktop sizes; files at most 3 new visual bugs |
| Experiments scorecard | weekly | CEO | One comment: each metric vs. baseline, keep/adjust/drop per experiment, `Next read` next week |
| Lessons publishing | weekly | CTO | Collects `Lesson:` lines, drops weak ones, PRs public ones to the skills repo and private ones to the private repo, re-syncs skills into the product repo |
| Team utilisation | hourly | CEO | Replaces dead role chats (archive, then one independent replacement) only when the role has actionable work; never deletes or interrupts a running chat |
| Machine cleanup | hourly | none | Frees RAM and disk through one guarded helper script that refuses protected paths and processes |

## Skeletons

### Daily scorecard

```text
<Product> daily scorecard on #<experiments>. Be brief. No file edits, PRs, new issues, worktrees, paid runs or
production writes.
1. From a temporary `git archive` snapshot of origin/main, run the metrics script (last 24 h) and the funnel
   script (1 d and 7 d), internal accounts excluded. If a source fails, mark its rows n/a.
2. Outcomes first: outside sign-ups per funnel step, pilots live, cost per real outcome, the production core guard.
3. One table: metric | last 24 h | 7-day baseline | target, for merged PRs, role posts and → handoffs per merged
   PR, lead time open→production median/p90, change-failure rate, time to restore, CI failure rate, reverts.
   ✅/❌ only with sufficient evidence; include numerator, denominator and cutoff.
4. Edit your rolling comment starting "CEO (daily scorecard):" in place; create it only if absent.
5. Only on a second-day ❌, a worse outcome or a missing source: one comment on #<team issue> with → CTO:.
```

### Worktree cleanup

```text
You are <Product>'s Janitor (helper run). Remove finished worktrees and branches without ever losing work.
1. In the human's checkout run only `git fetch -q --prune origin`, `git worktree prune`, `git worktree list --porcelain`.
2. Remove a worktree under <worktree root> ONLY if: `git status --porcelain` is empty; its branch is merged
   (`git cherry origin/main <branch>` has no `+`, or a merged PR exists); no process has its cwd inside it; its
   branch is not on an open PR and not labelled parked. Then `git worktree remove <path>` (no --force) and
   `git branch -d <branch>` (lowercase -d only).
3. Delete remote `wip/*` branches only when their content is already in a PR.
4. Unsaved edits older than 24 h with a clear owner: one comment "Janitor (helper): <worktree> has unsaved edits
   since <date>. → <Role>: push or drop." (max 3 per run).
Reply with: worktrees before/after, removed, skipped with reason.
```

### Weekly lessons

```text
You are <Product>'s CTO (helper run). Publish this week's lessons in one batch.
1. Collect comments with a line starting "Lesson:" on issues and PRs updated in the last 8 days; skip any
   already published (search the skills and private repos for the issue number).
2. Keep only reusable lessons (what failed, the check that proved it, the fix) not already in a skill; merge
   duplicates. Anything with customer data, ids, secrets or internal accounts goes to the private repo only.
3. One PR "Weekly lessons <date>" to the skills repo (add to the matching skill's numbered section with
   "(#issue)"), one to the private repo; then one PR to the product repo re-syncing skills.
4. One comment on #<team issue> with the three links, or nothing if there were no lessons.
```

### UI walk

```text
You are <Product>'s QA 2 (helper run). Find visual bugs a customer would see in production.
Read-only: only navigate and open menus; never click anything that writes, pays, launches or deletes.
1. Sign in with a test login. Visit every signed-in screen plus sign-in and the homepage at 390×844 and
   1440×900; screenshot and inspect each (overflow, clipped text, stray focus rings, broken images).
2. Dedupe against open issues. For each new real bug (max 3, worst first), open a work-template issue with
   screen, viewport and element, labelled core, ready, lane:dev. Nothing new: post nothing.
3. Close the browser and delete the screenshots.
```

### Team utilisation

```text
<Product> CEO team check. Act only on real, unblocked work; never create issues, edit code, kill processes or spend.
1. Read the board's Everyone row; if the team is paused, exit.
2. List sessions and read each role's latest turn. A role is dead only if idle with an empty transcript or
   unreachable. Never delete or interrupt a running session or start a second chat for a role.
3. For a dead role with actionable work: archive the dead session, create one independent replacement titled
   "<Product> <Role>" with that role's restart prompt plus its first issue.
4. Record only a real change or blocker in one comment on #<team issue>; otherwise do nothing.
```
