# Multi-Worker Delivery

## Trigger

Use when independent coding agents share repositories, split implementation and
review, hand off idle workers, or prepare a release from several feature branches.

## Invariant

Each mutable surface has one writer, each task advances a customer outcome, and
acceptance names exact source. Coordination must remove waits rather than become
a new dependency. Assigned, running, committed, reviewed and deployed are distinct.

## Failure pattern

A coordinator becomes the approval point for helper names, worktree allocation,
every push and repeated test receipts. Independent chats stop after handoffs;
editing the board does not wake them. Completed work waits behind unrelated
documents, whole-suite reruns and stale approval holds. Several workers then
repair or integrate the same file while the user sees a growing local backlog.

## Recommended method

1. Choose a complete customer workflow or demonstrated release blocker. Use the
   smallest dependency-complete slice, not the smallest visible code change.
2. Keep a short current dispatch with outcome, owner, exact source, real blocker
   and next action. Archive old decisions; do not reread the whole history to start.
3. Give authors isolated issue worktrees and authority for routine helpers, tests
   and scoped dependencies. One executor owns shared integration and production.
4. Assign files and interfaces, not just role names. Parallelize UI and server
   repairs only when their component/test/schema ownership is unambiguous.
5. Let owners discuss routine interfaces directly. Escalate scope, authority,
   unavailable external decisions or genuine conflicts to the coordinator.
6. Commit coherent locally checked work before handoff or task switching. Review
   only owned paths/hunks; publication and deployment remain separate decisions.
7. Review while CI runs. Name the accepted source and conditions; integrate in
   parallel without changing the reviewer's frozen candidate. Review later deltas.
8. Hand off issue/source, result, concrete blocker and next owner, with one link
   to existing evidence. Do not make a new report or validation harness per handoff.
9. Reuse published commits or shared local Git objects. Require an uncommitted
   source manifest only when a commit cannot represent the candidate.
10. Resume idle independent chats through their real communication mechanism.
    A board update is not a wake-up, acknowledgement or lock. Leave workers idle
    when no independent useful work exists; do not invent audits to fill capacity.

## Discriminating checks

- Can each worker state its owned files and next executable action without asking
  for routine permission or reopening the full repository map?
- Does a claimed missing handoff actually exist as a commit, issue comment or
  current receipt? Check once before turning it into a blocker.
- Is the expensive shared step genuinely serial? Split independent source work,
  but do not add several operators changing one production database/environment.
- Does the next check cover a changed input, required gate or uncovered behavior?
  If not, reuse the existing result rather than keeping a worker busy.
- Are local HEAD, remote HEAD, integration HEAD and deployed source distinguished?
  A dirty old checkout can coexist with already-committed worker branches.
- Can a complete accepted feature ship independently of another feature? Check
  actual imports, schema/grants and configuration; never infer independence from
  a small diff or include unfinished work merely to empty the backlog.

## Common traps

- Rewriting the dispatch for every idle/running notification.
- Treating a conditional QA pass as production permission or a real-provider test.
- Applying another worker's red regression without its fix and calling it green.
- Waiting for publication when the exact local commit is already reviewable.
- Re-adding tests already adopted from a QA overlay during integration.
- Using broad standing access as financial consent or applying one project's
  permissions to another repository.
- Solving slow releases by removing required CI, tenant or money protections.

## Related methods

- [Evidence-first development](evidence-first-development-plans.md) for the first edit.
- [Verification gates](verification-gates.md) for risk and evidence reuse.
- [Runtime resource lifecycle](runtime-resource-lifecycle.md) for owned services.
- [Release checklist](../checklists/release.md) for the production handoff.

The failure pattern was observed in multi-worker web-app implementation and
release work. It supports these ownership and evidence rules, not a numerical
claim about agent throughput or guaranteed delivery time.