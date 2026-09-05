# Bug Fix Checklist

- [ ] Capture the exact trigger sequence.
- [ ] Reproduce it with the cheapest executable check.
- [ ] Name the root owner: state, timer, storage, network, SQL, artifact, or UI contract.
- [ ] Add a failing regression test before or alongside the fix when practical.
- [ ] Search the skills catalog for an existing invariant; add a new skill only if the failure is portable and distinct.
- [ ] Invalidate stale callbacks/runs/requests before resetting state.
- [ ] Test a nearby edge case that would have the same failure class.
- [ ] Run the focused test before broad exploration.
- [ ] Build all touched consumers and inspect generated output.
- [ ] Check unrelated worktree changes before staging.
- [ ] Record residual risk and update the relevant incident/skill.
- [ ] Record the incident when the trigger sequence or residual risk would help future work.
