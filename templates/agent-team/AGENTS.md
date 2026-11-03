# Agent Team Rules (template)

Paste into `AGENTS.md` (or your agent's instruction file) and replace every `<…>`.
Each rule is here because its absence caused a real failure; see
[multi-worker-delivery](../../skills/multi-worker-delivery.md) for the history.

## Worker coordination

- **Leadership.** The CEO (coordinator chat) owns priorities, money and budgets, and
  every step that needs the human (`<owner-assisted steps: sign-ins, payment
  dashboards, platform approvals>`). The CTO owns technical direction: who works on
  what, briefs, CI and production health, high-impact reviews and lessons. On conflict,
  money and priority follow the CEO; the technical approach follows the CTO. The CEO
  never builds.
- **Communication lives on the issue or PR.** Hand off with the `owner:<role>` label
  plus one line addressed to the next owner with an arrow (`→ QA: ready at <sha>`),
  five lines at most; long evidence goes in the PR. Start your comments with your
  role (`Dev 2:`): everyone posts as one GitHub user, and the waiter wakes on `→ Role`.
  Start PR titles with the issue number (`#274 …`). New issues and PRs use the
  templates: why, do, done-when, files, risk, next owner.
- **Escalation.** Need the CEO (priority, money, human approval)? Open an issue
  labelled `decision`. Need the CTO? Label `owner:cto`. Blocked on the human? Label
  `waiting-owner`; only the CEO asks the human, in one batched list.
- **Trails, not talk.** Code on `next`, CI, production, labels and PR state *are* the
  status. Comment only to hand off, record a decision or attach evidence; never to say
  what you are about to do, are doing or just pushed. No status or idle posts.
- **One owner end to end.** The author takes an issue from code to production smoke and
  hands off only at a hard gate: money, external-platform writes, migrations, secrets,
  production settings, `merge-gate` approval.
- **Fix forward.** A red `next` or a non-core break in production gets a fix PR from
  whoever sees it first, with no author ping. A core break in production rolls back
  first.
- **Try to break it yourself.** Before asking for `merge-gate` approval, run a subagent
  that did not write the change to attack it, and paste its one-line result in the PR.
- **GitHub queue first; direct chat messages rarely.** Message another chat only to wake
  an idle one that has queued work (one line, pointing at the issue) or to stop harmful
  work now. Never end a turn silently: run your waiter or post `→ <Role>` first.
- **One writer per file or resource.** The board lists each worker's exclusive files.
  Never interrupt another worker's terminal, server, database, tests or worktree;
  never switch a shared branch or alter shared credentials.
- **Merging.** Low-risk PRs auto-merge on green CI and the author smokes production.
  The required `merge-gate` status holds any PR touching `<gated paths>` until QA, the
  Reviewer or the CTO approves its exact head SHA. To hold a PR use
  `gh pr merge <n> --disable-auto`; a comment cannot stop auto-merge.
- **The waiter.** When nothing you own is actionable, run
  `node scripts/wait-for-work.mjs --me <role>` **in the foreground**. It lists items
  where someone else spoke last, then returns when something is labelled for you, you
  are addressed, or a scheduled `Next read <ISO>Z` is due; when idle it offers the
  oldest `ready` issue in your lane. Never run it while you own an actionable item (it
  exits 6 and lists them). After its timeout, run it again; don't stop.
- **Restart-proof.** End each work step with the issue's latest comment saying what's
  done and what's next, and push the branch. If it isn't in GitHub or git, it doesn't
  survive a chat restart.
- **Outcome first.** Work only on items that move `<the outcome filter: core loop works
  in production / a pilot goes live / unit cost drops>`. When none exists, run the
  waiter instead of opening docs, wording, refactor or process tickets.
- **Lessons.** Closing an issue, add one `Lesson:` line if you learned something
  reusable (what failed, the check that proved it, the fix). The CTO publishes them.
- **Worktrees.** Keep the human's checkout clean. Work only in
  `<worktree root>/<issue>` made by `bash scripts/wt.sh <issue>`. Never leave a merge,
  staged files or local edits behind.
- **Delete as you go; never lose built work.** Delete a finished branch, worktree and
  one-off scripts, but only after `git cherry origin/main <branch>` shows no `+` lines.
  Paused work gets the `parked` label and a row in `<parked register issue>`.
- **Secrets.** Only `<.env.local>` holds secrets; never create other env files; never
  paste a secret into an issue. Private customer data goes in `<private repo>`; the
  public issue gets an opaque key.

## Execution speed

- Build a small slice, open a PR to `next`, enable auto-merge, check it in production,
  move on. No staging, no extra approvals, no reports.
- Only the core check, the production smoke, money and secrets slow this down on purpose.
- Don't ask permission for routine steps. Report a real blocker once, with the exact
  missing action, and work on something else meanwhile.
- Never sleep-poll CI. Push, then pull the next item; the waiter or the next pass reads
  the result.

## Subagents

- Split an issue into independent parts and run them in parallel: research, CI logs,
  tests, reviewing your own diff, the doc update. Brief each (goal, files it may
  change, checks, what to return), review its output and commit it yourself.
- At most one heavy job per worker at a time (full suite, build, dev server, browser):
  all workers share one machine.
- No paid AI runs, external-platform writes, production settings or secrets unless the
  brief allows them.

## Skills

| Task | Keywords (title or label) | Skills |
| --- | --- | --- |
| `<area>` | `<keywords>` | `<skill names>` |

The waiter prints the matching skills next to each item; this table is the only copy.

## Engineering priorities

- **The core comes first:** `<core loop>`. No change merges unless the `core` CI job
  passes. Any change to the core path adds or updates a core test with recorded real
  responses. After every production deploy the core smoke runs; if it fails, roll back
  first and debug second.
- **Lean.** Delete before you add. Removing a feature needs the human's scope and a row
  in `<removal log issue>`.
- **Build it properly.** Design first when a change crosses layers; change every layer
  it needs; split files past ~400 lines; a shortcut needs `TODO(#issue)` and a
  follow-up issue.

## Branches and deployments

- Branch from `origin/next` (`bash scripts/wt.sh <issue>`), open the PR to `next`, enable
  auto-merge. PRs opened against `main` are retargeted. `main` is production; the
  deploy train promotes a green `next` every `<15–30>` minutes.
- Hotfixes and migration or money releases go to `main` (DevOps or CTO; label `hotfix`).
- Migrations, production settings and rollbacks go through DevOps. Never force-push.
- Update the matching doc in the same PR when you change a route, schema or setting.
