# Runtime Resource Lifecycle

## Trigger

Use this skill for development servers, browser sessions, timers, workers, test processes, sockets, subscriptions, or any resource that can outlive the task that created it.

## Invariant

A temporary resource is bounded, attributable to its owner, and cleaned up when the task or session ends; a resource required by an active workflow is preserved.

## Failure pattern

A detached dev server, browser process, timer, or worker survives the originating task, consumes memory or CPU, and is mistaken for an active dependency. Repeated agent sessions then accumulate orphaned processes and stale caches.

## Recommended method

- Give every long-running process a recognizable command, working directory, port, and parent/session owner.
- Reuse a healthy server before starting another one.
- Set bounded memory, worker, timeout, or retry limits appropriate to the machine.
- Keep temporary servers attached to the task and stop them after browser validation.
- In tests and UI code, invalidate old runs before delayed callbacks can mutate new state.
- During cleanup, inspect parent chains, listeners, age, working directory, and active consumers before terminating anything.
- If workers immediately respawn, act on their supervisor or extension lifecycle rather than repeatedly killing children. Ask before disabling or uninstalling a feature; age, duplicate-looking commands, and a live parent do not establish whether it is needed.
- For editor extensions, use the supported uninstall interface first. Registration, package files, and live workers are separate states: "not installed" can coexist with an old package folder and running children. Verify all three, and remove only the identified obsolete version; preserve current versions, other profiles, and shared editor state.
- After stopping a confirmed leftover worker, check for new PIDs matching the same package path. Report summed RSS as the workers' observed footprint, not guaranteed system-wide RAM recovered; shared pages and compression affect the result.
- For a sluggish low-memory Mac, take a short `memory_pressure`, `vm_stat`, and `sysctl vm.swapusage` snapshot, then sample CPU twice and rank compact RSS/CPU process columns. Attribute high usage using full command, parent, age, working directory, listeners, and active consumers before stopping anything. A large editor renderer or extension host may belong to the user's live session; do not kill it as an orphan based only on RSS or age.
- If confirmed swap is consuming disk, preserve OS-managed swap files and recover them only through a normal restart after saving/ending active work. Verify pressure and swap afterward; do not promise lasting recovery if the workload remains.

## Discriminating checks

- Does the process have an active listener, current client, or current task that requires it?
- Is its parent still alive, or is it parented to launchd/ PID 1 after the originating task ended?
- Does a same-owner process appear after termination, indicating a restart policy rather than an independently orphaned worker?
- Does the command's working directory and port match the current workflow?
- Does the resource stop when the owning task is cancelled or restarted?
- Does memory/CPU recover after removing only the confirmed stale resource?
- Is high VM-volume usage corroborated by `vm.swapusage`, and can the suspected pressure source be attributed to an active workload rather than a stale child?

## Common traps

- Killing all Node or browser processes by name.
- Passing newline-separated PIDs as a scalar to `kill` in zsh; use an array or validated one-PID-at-a-time loop. Recheck current ownership and command identity rather than reusing historical PIDs.
- Treating PID 1 as proof that a process is unnecessary without checking listeners and consumers.
- Leaving dev servers detached after browser validation.
- Using an unbounded default heap on a low-memory machine.
- Treating a one-shot CPU sample, RSS sum, or compressed-memory reading as a complete performance diagnosis; compare repeated samples and distinguish physical free, compressed, swapped, and purgeable memory.
- Fixing a timer race without invalidating pending callbacks from the previous run.

## Evidence

AdBrain's orphaned Next server consumed several gigabytes and extreme CPU; capping its dev heap, excluding generated caches, and cleaning the detached process recovered memory. Arcade and browser-game fixes separately verify run-scoped lifecycle cancellation.

On 2026-09-14, CSS Peek was absent from the extension registry but still had an old package directory and 13 workers totaling about 408 MiB RSS. Removing the identified package and stopping its workers left zero matching processes in the follow-up check. Earlier child-only termination had caused immediate respawns. This supports supervisor-level cleanup, not blanket removal of language servers.

## AdBrain lesson (Oct 29)

- An orphan-exit test must SIGKILL the process's direct parent (a subreaper reparents
  it otherwise) and capture the exit code through an `--import` preload, since the
  grandparent can't wait on it. Mutation-test it with the orphan check removed (#2051).
