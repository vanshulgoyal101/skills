# Agent Team Orchestration

## Trigger

Use when you want a standing team of AI coding agents (a coordinator plus builders,
reviewers and release roles) to build and run one product together on one repository,
and the team must survive chat restarts, keep shipping without a human relaying
messages, and never break the product's core flow. For the day-to-day rules once the
team runs, read [multi-worker-delivery](multi-worker-delivery.md); this skill is the
blueprint for setting one up. The paste-ready kit is in
[templates/agent-team](../templates/agent-team/README.md).

## Invariant

GitHub and git are the team's only memory and only message bus. Every piece of work is
an issue with exactly one `owner:<role>` label naming who acts next; every mutable
file, branch or production setting has one writer; every role can be restarted from
one line and recover its full state from GitHub; and irreversible actions (money,
migrations, external-platform writes, secrets, production settings) pass a hard gate
that a chat message cannot bypass.

## Failure pattern

Teams built from long-running chats fail the same ways, in roughly this order:

- **Chat as memory.** Decisions live in a coordinator's context. A crash, editor
  restart or handover loses them, and the new coordinator re-asks or re-decides.
- **Chat as bus.** Workers message each other directly. A busy chat never reads the
  message, an idle chat is never woken, and the human ends up relaying.
- **The coordinator builds.** The coordinator fixes "just one thing", then becomes the
  bottleneck for every approval, push and test receipt.
- **Shared writers.** Two workers edit the same file or branch; one silently reverts
  the other on squash-merge.
- **Nested sessions.** Workers started *inside* the coordinator's session die with it,
  so replacing a stalled coordinator takes down the whole team.
- **Idle by default.** A worker finishes, posts "done", ends its turn and can never be
  woken by a label again. Or it invents audits and docs to look busy.
- **Talk inflation.** Status, plan and heads-up comments outnumber merged PRs 4:1, burn
  the shared API budget and bury the real handoffs.
- **Unattended waits.** A worker sleeps on `gh run watch` or a deploy, cannot read
  steering, and holds a machine slot for an hour.
- **Machine exhaustion.** Twenty agents on one laptop each install `node_modules`, run
  full test suites and dev servers; the shared machine swaps and everyone slows down.

## Recommended method

Build these pieces in this order. Each is small; together they make the team
self-running. Paths refer to [templates/agent-team](../templates/agent-team/README.md).

1. **Name the core loop first.** One sentence a customer would recognise (for AdBrain:
   brand → create ads → review → launch → manage results). Every priority, gate and
   "is this worth doing?" check refers to it. Protect it with a required CI job of
   recorded-response tests (`core`) that no PR can skip.
2. **Roles as one-line cards.** A table in `docs/team/orchestration.md`: role, what it
   owns, what it hands off. Start with 4 roles (Coordinator, Dev, QA, DevOps); add one
   role at a time only when a lane has a measured queue. Split by *files and outcomes*
   (one owner per product step or subsystem), not by verbs. The coordinator
   (CEO) owns priorities, money and the human owner's steps and never builds; a CTO owns
   technical direction and the worker table once you have more than ~5 workers.
3. **Labels are the state machine.** `owner:<role>` (who acts next, exactly one),
   `core`/`later` (priority), `ready` + `lane:<x>` (briefed, unowned pull pool),
   `declined:<role>`, `blocked`, `waiting-owner` (only the coordinator asks the human, in
   one batched list), `decision` (coordinator's queue), `parked` (paused with a resume
   trigger), `standing` (umbrella, never offered as next work), `hotfix`,
   `ready-to-ship`. Script them (`labels.sh`) so a new repo gets the whole set at once.
4. **Handoff grammar.** Comments start with the author's role (`QA:`) because every agent
   posts as the same GitHub user; a handoff is one line with an arrow (`→ DevOps:
   release`) plus moving the `owner:` label. PR titles start with the issue number so
   the issue owner hears about the PR. Scheduled checks end with `Next read <ISO>Z`.
5. **A waiter instead of messages.** `wait-for-work --me <role>` runs in the foreground,
   polls the issue queue with one or two API calls, and returns when something is
   labelled for the role, someone addresses it, a PR naming its issue changes, or a
   scheduled read is due. It prints the role card, the board row and any unsaved
   worktree on start, so a restarted chat recovers in one step. It exits when its parent
   chat dies, refuses a second copy per role, and refuses to wait at all while the role
   owns actionable work. Workers loop work → waiter → work and never end their turn.
6. **A pinned board issue.** Priorities (coordinator) and a worker table (CTO): each row
   is the role's ordered queue plus the **exclusive files** it may write. The waiter
   prints the role's row and an `Everyone` row on every wake, so a team-wide rule is one
   issue edit, not twenty messages.
7. **Pull pool.** The CTO keeps a few briefed `ready` issues per lane (why with evidence,
   do, done-when, files, risk). An idle worker claims the oldest in its lane; the
   waiter offers it. Rank by production evidence, not ticket count; with nothing
   valuable, the worker waits instead of inventing work.
8. **One worktree per issue.** `wt.sh <issue>` branches `work/issue-<n>` from the
   integration branch into a persistent folder outside `/tmp`, cloning dependencies from
   a per-lockfile cache (copy-on-write) in seconds. The human owner's checkout is never
   edited.
9. **Integration branch plus deploy train.** PRs target `next` and auto-merge on green CI;
   a scheduled workflow promotes a green `next` to `main` (production) at most every
   15–30 minutes. PRs opened against `main` are retargeted automatically unless they are
   hotfixes or migrations. This batches deploys under platform limits and keeps a broken
   PR out of production.
10. **Risk-proportional gates in code, not prose.** Low-risk PRs (no money, migration,
    tenant/auth or config) auto-merge on green CI and the author smoke-tests production.
    Gated paths need a required status (`merge-gate`) that only an approval naming the
    current head SHA turns green; a hold *comment* cannot stop auto-merge, a missing
    required status can. Migrations, secrets, production settings and rollback belong to
    one release role. Before asking for approval, the author runs a subagent that did not
    write the change to attack it and pastes its one-line result.
11. **Independent sessions and a restart prompt.** Every role runs as its own top-level
    chat titled `<Product> <Role>`, never nested in the coordinator's chat. Keep a
    generator for each role's restart prompt (read the handbook, your card, your board
    row, your queue; work in your worktree; loop the waiter; never end the turn). A new
    coordinator adopts live chats by title and starts only the missing roles.
12. **Recurring helper runs.** Scheduled one-shot agent runs do the chores no standing
    chat should hold: a daily scorecard, worktree and branch cleanup, a production UI
    walk, backlog refill from production errors, weekly lesson publishing, a machine
    RAM and disk cleanup. Each prompt states hard limits (no writes to money, Meta or
    production; no session deletion; no secrets).
13. **Machine guard rails.** Size the team to the machine (8 GB holds about 20 mostly
    idle chats, not 20 test runs). One heavy job per worker; push and let CI typecheck
    and run the full suite instead of local full runs; a pre-tool hook refuses long sleeps
    and CI watches; stop every server you start.
14. **Measure the process like a product.** Weekly: deploys, lead time open →
    production, change-failure rate, time to restore, CI failure rate, role posts and
    handoffs per merged PR. Run process changes as dated experiments with a baseline and
    keep, adjust or drop them on the numbers. Reusable lessons (`Lesson:` lines on
    closed issues) are published weekly to a shared skills repo.

## Discriminating checks

- **Restart test:** close every chat, then start one role from its restart prompt alone.
  Within one waiter run it must print its card, its queue and any unsaved worktree, and
  resume the right item without asking anyone.
- **Coordinator swap:** delete the coordinator's session. Every worker session must still
  be running (`list_sessions`); none may have been nested in it.
- **Handoff latency:** label an issue `owner:qa` with `→ QA: review #n`. QA's waiter
  should return within one poll interval; measure it.
- **Gate test:** open a PR touching a gated path, enable auto-merge, post a "please hold"
  comment. It must still be blocked by the required status until an approval naming the
  head SHA exists; push a new commit and the approval must no longer count.
- **One writer:** for every open PR, the changed files must appear in exactly one role's
  board row (or be the author's own new files).
- **Talk ratio:** role posts per merged PR ≤ 2 and `→` handoffs per merged PR ≤ 1 over a
  week; above that, coordination is costing more than it saves.
- **Machine:** `memory_pressure`/swap and free disk before and after a busy hour; if
  swap is near full, cut concurrent heavy jobs, not chats.

## Common traps

- Starting with 20 roles. Each role costs coordination; add one when a lane's queue
  stays non-empty for a day.
- Letting the coordinator fix a bug "because it's quick". It becomes the bottleneck and
  stops coordinating.
- Treating a board edit or a direct chat message as a wake-up. Only the waiter wakes a
  worker; direct messages are for waking an idle chat or stopping harm.
- Workers that finish, call "task complete" and end the turn. An ended turn cannot be
  woken by a label; the loop must be work → waiter → work.
- Nesting worker chats inside the coordinator's session (some session tools default to
  child sessions). Create them `independent`.
- Assuming a create-chat call runs once. The agent host replayed earlier create requests
  and about 50 duplicate role chats appeared within two minutes. Re-list sessions before
  every create, tag each request with a reserved spawn id, and have the scheduled check
  flag any role with more than one chat (#364).
- Writing a team rule only in the handbook. Chats load the instructions file
  (`AGENTS.md`) every turn but read the handbook only when told to, so a rule changes
  behaviour once it is in `AGENTS.md` (#2617).
- Deleting a stalled coordinator before snapshotting dirty worktrees. Push every unsaved
  worktree to a `wip/<handover>/<worktree>` branch first; an empty snapshot means the
  worktree was clean, so check its branch is pushed instead.
- Gating on prose ("QA must approve money PRs") instead of a required status. Auto-merge
  ignores prose.
- Required checks that bot-opened PRs (the deploy train, a back-sync) can never satisfy;
  the train then stalls silently.
- A waiter that only reads issue comments: it misses PR reviews, CI going red and merged
  PRs reaching production. Watch those too.
- One shared API token for all roles with per-item polling: 20 waiters × many calls
  exhaust 5,000 requests/hour. Poll the label query and one comments-since query, honour
  ETags and rate-limit resets.
- Process tickets to fill idle time. When nothing passes the outcome filter, wait.
- Public repo hygiene: customer names, phones, emails and platform IDs go to a private
  evidence repo; the public issue gets an opaque key.

## Related methods

- [Multi-worker delivery](multi-worker-delivery.md): the running rules and 93 dated
  lessons behind each component above.
- [CI merge throughput](ci-merge-throughput.md): keeping required checks fast and fair.
- [Post-deploy production guard](post-deploy-production-guard.md): smoke and roll back
  each train deploy.
- [Verification gates](verification-gates.md): evidence proportional to risk.
- [Nested-session handover incident](../incidents/adbrain-nested-session-handover.md).

Source: AdBrain, October 21 to November 3, 2026: one owner, 23 agent roles, about 1,000
merged PRs a week on one 8 GB Mac.
