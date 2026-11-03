# Agent Team Kit

Everything needed to run a standing team of AI coding agents on one GitHub repository,
the way AdBrain does: a coordinator, builders, reviewers and a release role that
coordinate only through GitHub labels, comments, PRs and CI, survive restarts, and ship
to production many times a day without breaking the core flow.

Read the blueprint first: [agent-team-orchestration](../../skills/agent-team-orchestration.md).
The running rules and their history: [multi-worker-delivery](../../skills/multi-worker-delivery.md).
The incident that made sessions independent: [nested-session handover](../../incidents/adbrain-nested-session-handover.md).

## What's in the kit

| File | Copy to | Purpose |
| --- | --- | --- |
| [AGENTS.md](AGENTS.md) | `AGENTS.md` (or `.github/copilot-instructions.md`, `CLAUDE.md`) | The rules every agent loads: communication, one writer, gates, waiter, worktrees, subagents |
| [orchestration.md](orchestration.md) | `docs/team/orchestration.md` | The current dispatch: role cards, how work flows, pull pool, standing rules, handover |
| [board.md](board.md) | body of a pinned issue | Live priorities and the worker table with exclusive files |
| [restart-prompts.md](restart-prompts.md) | keep in the repo | The one message that (re)starts the coordinator or any role |
| [github-templates.md](github-templates.md) | `.github/ISSUE_TEMPLATE/work.md`, `.github/pull_request_template.md` | Why / do / done-when / files / risk / next owner |
| [automations.md](automations.md) | your scheduler | Recurring one-shot helper runs: scorecard, cleanup, UI walk, backlog, lessons |
| [metrics.md](metrics.md) | a pinned experiments issue | The weekly scorecard and how to run process experiments |
| `labels.sh` | run once | Creates the label state machine |
| `scripts/team.config.example.json` | `scripts/team.config.json` | Repo, roles, lanes, gated paths, worktree root |
| `scripts/wait-for-work.mjs` | `scripts/` | The waiter: blocks until there is work for one role |
| `scripts/merge-gate.mjs` | `scripts/` | Sets the required `merge-gate` status on risky PRs |
| `scripts/no-deploy-wait.mjs` + `hooks/no-deploy-wait.json` | `scripts/`, `.github/hooks/` | Pre-tool hook refusing long sleeps and CI watches |
| `scripts/wt.sh` | `scripts/` | One worktree per issue with cached dependencies |
| `workflows/pr-base.yml` | `.github/workflows/` | Retargets PRs from `main` to `next` |
| `workflows/merge-gate.yml` | `.github/workflows/` | Runs the gate from the default branch |
| `workflows/deploy-train.yml` | `.github/workflows/` | Promotes a green `next` to `main` on a schedule |

The scripts need Node 20+, `git` and an authenticated `gh` CLI, and nothing else.
Tests: `node --test scripts/*.test.mjs`.

## Set it up in an afternoon

### 1. Decide three things (15 minutes)

- **The core loop**: one sentence a customer would recognise. Everything is ranked
  against it.
- **The first roles**: start with four: `ceo` (coordinator: priorities, money, the
  human's steps; never builds), `dev`, `qa` (independent review of risky changes) and
  `devops` (migrations, secrets, production settings, releases, rollback). Add a `cto`
  when you pass about five workers, then more builders, each owning a product step or a
  subsystem.
- **The gated paths**: regexes for money, migrations, auth/tenant boundaries and
  external-platform writes. Everything else auto-merges on green CI.

### 2. Repository plumbing (30 minutes)

```sh
git switch -c next && git push -u origin next          # integration branch
bash labels.sh owner/repo ceo dev qa devops            # label set
cp scripts/team.config.example.json scripts/team.config.json   # then edit
```

- Copy the scripts, hook and workflows. Protect `next` and `main` (branch protection
  or a ruleset) and require your CI jobs plus `merge-gate`; `main` must not require a
  human review, or the train's bot PR can never merge. Enable auto-merge and "delete
  head branch". The protection on `next` is what stops the train's `next → main`
  merge from deleting `next`.
- Add a `core` CI job that runs recorded-response tests of the core loop, and make it
  required. No PR may skip it.
- Copy the issue and PR templates.

### 3. The handbook (30 minutes)

- Paste [AGENTS.md](AGENTS.md) into your agent instructions and fill the `<…>`
  placeholders.
- Fill [orchestration.md](orchestration.md): one role card per role (owns / hands off).
- Create the board issue from [board.md](board.md), pin it, and put its number in
  `team.config.json` (`boardIssue`).

### 4. Start the team (15 minutes)

1. Start the coordinator in its own chat with the coordinator prompt from
   [restart-prompts.md](restart-prompts.md).
2. The coordinator turns your first requests into issues (why / do / done-when / files),
   labels each `owner:<role>`, and starts one **independent** top-level chat per role,
   titled `<Product> <Role>`, with that role's restart prompt.
3. Each worker reads its card and queue, runs `bash scripts/wt.sh <issue>`, works,
   opens a PR to `next` titled `#<issue> …`, enables auto-merge, hands off with one
   `→ Role:` line, and runs `node scripts/wait-for-work.mjs --me <role>` in the
   foreground. When the waiter exits, it works or runs the waiter again. It never ends
   its turn.

### 5. Add the recurring helpers (15 minutes)

Schedule the runs in [automations.md](automations.md): at least the daily scorecard,
the daily worktree cleanup and the weekly lesson publishing.

## How a piece of work flows

```text
owner request ─▶ CEO opens issue (why/do/done-when/files/risk), label owner:<role> or ready+lane:<x>
                 │
worker waiter ◀──┘ wakes; worker claims, runs wt.sh <n>, builds, tests the changed files
                 │
PR "#<n> …" to next ─▶ CI (+ merge-gate on risky paths ─▶ QA/Reviewer approves head SHA)
                 │
auto-merge into next ─▶ deploy train promotes green next to main every 15–30 min
                 │
author smokes the change in production on its next pass, closes the issue (+ "Lesson:" line)
```

## Sizing and cost

- One 8 GB Mac carried about 20 mostly idle agent chats plus their worktrees, with swap
  nearly full under load. The limit is concurrent heavy jobs (test suites, builds, dev
  servers, browsers), not chats: one per worker at a time, and CI does typecheck, lint
  and the full suite.
- Every role shares one GitHub login's 5,000 REST calls/hour. The waiter's default poll
  is 300 s with two calls per poll; keep ad-hoc scans under 200 calls.
- Worktrees cost about 700 MB each when they hold their own `node_modules`; `wt.sh`
  clones from a per-lockfile cache, and a daily cleanup removes merged, clean worktrees.
- Vercel Hobby allows 100 deploys a day, which is why merges batch on `next` and a
  train promotes them.

## Limits of the portable scripts

- **Approvals are per head SHA:** every push needs a new `merge-gate` approval. Fork
  PRs can't receive the status (read-only token). Same-repo `next → main` and
  `main → next` PRs pass without approval.
- **`merge-gate.yml`** runs the script from the default branch and reads
  `scripts/team.config.json` there; without it, the job skips quietly.
- **Waiter:**
  - Each poll reads up to 100 repo-wide comments and ignores bot comments.
  - `@role` mentions can collide with real GitHub usernames.
  - Orphan detection uses `ps`, so Unix only.
  - Don't make one role name the end of another (`QA` and `Lead QA`); prefixes like
    `Dev` / `Dev 2` / `DevOps` are handled.
  - The coordinator's own `decision` items count as actionable for it.
- **Not ported from AdBrain's waiter:** wakes on a red `next`/`main` run, CTO
  off-track checks, skill hints, the unsaved-worktree report, and `--wake`. Add the
  red-branch wake first if you need it (multi-worker-delivery rule 90).
- **Deploy train:** merges made with `GITHUB_TOKEN` trigger no workflows, so the train
  dispatches its follow-ups itself. Sync `main` back into `next` after each hotfix.
- **Before adopting:** run `actionlint` on the workflows and `shellcheck` on `wt.sh`.
  SC2088 on `root='~/…'` is expected: the path is expanded later.

## What to measure

See [metrics.md](metrics.md). AdBrain's first baseline: about 1,000 merged PRs a week,
lead time median 18 / p90 108 minutes, change-failure rate 11 %, about 4.4 role posts
and 3.5 handoffs per merged PR (targets ≤ 2 and ≤ 1).
