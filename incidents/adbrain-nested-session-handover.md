# Incident: Nested Worker Sessions Died With A Stalled Coordinator

- **Date**: 2026-11-02
- **Repository**: AdBrain
- **Severity**: Medium (no work lost; about 20 minutes of team downtime)
- **Status**: Fixed by process; worker sessions are now independent

## Symptom

The coordinator (CEO) chat stalled: its last two requests to the owner had been
cancelled and it no longer acted on its queue. The owner asked for a fresh CEO and for
the stalled session to be removed. Deleting it also ended 19 of the 22 worker chats,
because they had been started *inside* the CEO's session as child sessions. Only the
three workers started separately (Dev 5, Dev 6, Speed) kept running.

## Trigger sequence

1. Earlier CEOs started worker chats with a session tool whose default was a child of
   the calling session.
2. The CEO stalled. A replacement was needed.
3. Deleting the stalled session deleted its children with it.
4. Their waiters (DevOps 3, Dev 4, CTO, Scout) and a QA 2 dev server kept running as
   orphans that would have duplicated the replacements.

## Evidence

- The session list after deletion showed only the three separately created workers.
- `git worktree list` plus `git status --porcelain` per worktree: seven worktrees had
  uncommitted changes; the rest were clean.
- Snapshot branches: five carried real diffs (1 to 12 files each); two were empty
  because those worktrees were clean by then and their branch tips were already pushed
  (`git ls-remote` matched local `HEAD`).
- A later full rescan found one more dirty worktree; its files all changed after the
  handover and were in a mid-merge state, i.e. a new worker's live work, not a leftover.

## Root cause

Worker lifetime was coupled to coordinator lifetime. The handbook already said "workers
never nest inside a CEO session", but nothing enforced it: the session tool's default
and the restart instructions disagreed, and nobody checked the session tree.

## Fix

1. Before deleting anything, snapshot every dirty worktree to a remote branch
   `wip/<handover-date>/<worktree>` (commit on a detached copy; the worktree itself is
   untouched).
2. Delete the stalled coordinator and leftover one-shot sessions; stop orphaned waiters
   and servers by PID.
3. Start the new coordinator from the generated restart prompt.
4. Recreate every missing role as an independent, top-level session titled
   `<Product> <Role>`, each with its role's restart prompt plus the item it was on and the
   snapshot branch names.
5. Rescan all worktrees after the handover and distinguish new live work (recent
   mtimes, held by a running process) from leftovers.

## Regression coverage

- The coordinator's restart prompt now says: create workers with relationship
  `independent`, adopt live chats by title, never delete another session.
- Discriminating check in [agent-team-orchestration](../skills/agent-team-orchestration.md):
  delete the coordinator session and confirm every worker session survives.

## Residual risk

- Child-by-default session tools remain a trap for any agent that forgets the rule.
- Interrupted mid-step tasks (a review, a release) resume only if their last state was
  posted on the issue; the new coordinator must check each within the hour.

## Portable lesson

Coordinator and workers must have independent lifetimes; a handover is "snapshot,
delete, recreate independently, rescan". Updated:
[agent-team-orchestration](../skills/agent-team-orchestration.md) and
[multi-worker-delivery](../skills/multi-worker-delivery.md).
