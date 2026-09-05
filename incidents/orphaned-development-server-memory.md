# Orphaned Development Server Memory

## Trigger

A browser-validation session left an AdBrain Next.js development server detached after the agent task ended.

## Impact

The orphaned server reached several gigabytes of memory and sustained roughly 250-400% CPU on an 8 GB Mac. Swap grew to roughly 9.5 GB and the machine experienced severe memory pressure.

## Evidence

- The process tree was `npm run dev -> next dev -> next-server`, parented to PID 1.
- No active browser process required it.
- The generated `.next` development cache was about 1.2 GB.
- Stopping only the confirmed stale tree immediately reduced swap usage; the active Arcade server was preserved because a shared page still used it.

## Root cause

The temporary server had no lifecycle owner or heap bound, and generated development output was not excluded from the editor's watchers.

## Fix

- Cap the AdBrain dev server heap at 1.5 GB.
- Reuse healthy servers and stop temporary browser-validation servers at task completion.
- Exclude generated output, dependencies, coverage, and browser-test artifacts from watchers and search.
- During cleanup, inspect parent chain, working directory, listener, age, and active consumers before killing a process.

## Regression coverage

The dev command was invoked with `--help` to verify the bounded launcher; process and listener checks distinguished stale servers from the active Arcade server.

## Residual risk

A detached process can still be created by another launcher or extension. Periodic process-tree checks and a VS Code reload remain useful on a low-memory machine.
