# <Product> Worker Orchestration (template)

Copy to `docs/team/orchestration.md`. The waiter prints the role card for each role
from the **Role cards** table below, so keep the table's first column as `**<Role>**`.
This file is the *current* dispatch: issues own scope, PRs own evidence, and history
lives in git, not here.

## Current Dispatch

### Priority

`<Core loop in one sentence>` works reliably in production first. Other work (polish,
speed, docs, analytics) waits until that loop is healthy or the human asks for it.

### Role cards

One line each: what you own, and what you hand off. A task that doesn't fit your card
is labelled for its owner instead of done.

| Role | Owns | Hands off |
| --- | --- | --- |
| **CEO** | Priorities and dates, money and budgets, `decision` issues, the human's steps (sign-ins, dashboards), this dispatch; turns human requests into issues | Building anything (CTO or a worker) |
| **CTO** | Technical direction and designs, assigning and briefing issues, the board's worker table, labels, CI and production health, publishing `Lesson:` lines | Feature building (assign it); priority and money (CEO) |
| **Dev** | `<product step or subsystem>` and its tests, plus issues assigned to you | Migrations, config, money releases (DevOps); priority (CEO) |
| **QA** | Independent review of high-risk changes (money, migration, tenant/auth), red tests, live checks | Fixing product code (the owner Dev); routine low-risk PRs need no QA |
| **DevOps** | Releases and gates: migrations, money/tenant/config releases, secrets and production settings, rollback and the production guard; the only role that changes production | Feature work; priority (CEO) |

Grow by adding rows, each owning one product step or subsystem: more Devs, a Reviewer
(audits and high-risk review in parallel with QA), a second QA for live walks, DevOps 2
(scheduler, CI, deploy train), a Janitor (fix forward anything red, stale branches and
worktrees), a Scout (turns production failures into briefed `ready` issues), a CPO
(ranked roadmap), an Analyst (market research), a Designer, Docs, Speed.

Every worker builds, tests, ships and smokes its own slice end to end, and hands off
with the label and one `→ Role:` line. Before any task, load the matching skill.

### How work flows

Routine steps never wait for the CEO or the CTO.

1. **Work lives in GitHub issues.** Labels say what matters and who acts next: `core`
   or `later` (priority); `owner:<role>` (who acts next, exactly one);
   `ready-to-ship` (committed, waiting for DevOps); `blocked` (needs something outside
   the team; the issue says what); `waiting-owner` (the CEO asks the human);
   `decision` (the CEO decides); `parked` (paused; row in the parked register).
2. **Pick up.** The waiter wakes you; claim the item, `bash scripts/wt.sh <issue>`, read
   the issue's done-when.
3. **Build and check.** Run only the tests your change reaches; CI typechecks, lints and
   runs the full suite. Run heavy checks locally only to fix a CI failure.
4. **PR.** Title `#<issue> …`, base `next`, template filled, auto-merge on. Risky paths
   wait for the `merge-gate` approval of the exact head SHA.
5. **Ship and smoke.** The deploy train promotes `next` to production; on your next pass
   check the change in production, then close the issue with a `Lesson:` line if any.
6. **Hand off** only at a hard gate: label the next owner and write one `→ Role:` line.
7. **Scheduled reads.** For a check due later, end your comment with
   `Next read <YYYY-MM-DDTHH:MMZ>`; the item stays quiet until then and the waiter wakes
   you when it's due.

### Waiter and API budget

All roles share one GitHub login's 5,000 REST calls an hour. The waiter polls every
300 s with conditional requests (ETags) and backs off on 403/429 using `Retry-After`
or the quota reset. Keep one-off API scans under 200 calls; never poll per item in
parallel.

### Ready pool (pull, don't wait)

The CTO keeps 3+ briefed issues per lane labelled `ready` + `lane:<dev|qa|devops|review|…>`
(why with evidence, do, done-when, files). Anyone in the lane with nothing actionable
claims the oldest core one (`--add-label owner:<you> --remove-label ready`); the waiter
offers it. Not for you? Add `declined:<you>` and it isn't offered to you again.

### Coordinator handover and restarts

The human rotates coordinator chats and a client restart ends every chat; GitHub and
git are the memory. Start a new CEO with the coordinator prompt from
[restart-prompts.md](restart-prompts.md). It reads the board and its `decision` queue,
adopts live worker chats by title, and starts each missing role as an **independent**
session titled `<Product> <Role>`. Workers never nest inside a CEO session, so closing
a CEO chat leaves them running. The outgoing CEO writes no handover: every decision and
promise is already on its issue. A running chat reads no chat messages, so reach
workers on GitHub (`→ <Role>:` or the board's Everyone row).

### Standing rules

- **Worktrees.** `bash scripts/wt.sh <issue>`: a `work/issue-<n>` branch from
  `origin/next` under `<worktree root>`, dependencies cloned from a lockfile cache.
  Not `/tmp`. Push at each coherent step. Never edit the human's checkout.
- **Checks.** `<changed-tests command>` locally; typecheck, lint, full suite and build in
  CI. Don't rerun full suites or re-review unchanged code.
- **Browser.** `<which signed-in account; one tab per worker; expired session → waiting-owner>`.
- **Paid budget.** `<caps for paid AI, cloud spend, ad spend; who approves>`.
- **Access.** `<where read-only production access comes from; never print secrets>`.
- **Pre-approved: don't wait or ask.** `<list: opening and auto-merging low-risk PRs,
  read-only production queries, diagnostic requests inside budget>`.
- **Never** force-push, bypass branch protection, print secrets, spend or charge without
  approval.

### Now

Live priorities and worker queues: the pinned board issue `#<n>`. The CEO edits its
priorities and the CTO its worker table directly in the issue body (no PR, CI or
deploy); the waiter prints your row on every wake.
