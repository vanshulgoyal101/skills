# Regenerable Cache Disk Recovery

## Trigger

A machine needs disk space after a large OS update, installer download, browser profile growth, package-cache buildup, or many local project checkouts.

## Invariant

Delete only explicitly scoped data whose current owner, disposability, and recovery path have been verified. An old note calling a folder unused or an archive duplicated is a candidate list, not proof. Preserve personal files, secrets, source, browser profiles, editor workspace state, database volumes, and system-managed update data.

## Failure pattern

The visible storage loss is attributed to one suspected payload, such as an OS download, without locating it. Cleanup can then miss measured cache growth or delete active runtime files merely because their directory is named `Caches`. An absent installer search result does not establish that the update was applied or purged.

## Recommended method

1. Establish a baseline with `df -h / /System/Volumes/Data` and measure candidates with `du -sh`, not Finder estimates alone.
2. Check the suspected OS-update locations first: `/Applications/Install macOS*.app`, `/Library/Updates`, `/System/Volumes/Update`, `/private/var/db/softwareupdate`, and relevant Software Update asset caches.
3. Check process ownership, working directories, open files, and active consumers; a process-name filter alone is insufficient. Include app updaters and background helpers. Quit an app through its normal lifecycle with permission before clearing its cache.
4. Prefer measured build outputs and download caches. Confirm build outputs are not tracked, dependencies have a lockfile and no local modifications, and the runtime is idle. Prefer the tool's supported cleanup command or an explicit cache subdirectory over deleting its entire state directory. VM download caches are not VM disks or database volumes.
5. Agree on recovery costs before removing installed dependencies or Playwright browsers. Restore with the repository's package manager and lockfile (for example, `npm ci`), its build command, and its pinned Playwright CLI (`npx playwright install` when Playwright is already installed). Redownloads need network access, time, and disk space.
6. Record same-volume `df -k /System/Volumes/Data` readings before and after each small batch, along with failed deletions. Report the observed delta, not the sum of candidate sizes; APFS snapshots, shared blocks, and concurrent writes affect physical recovery. Keep GB, GiB, free, and purgeable/available readings distinct. Do not attribute a later UI difference to cleanup without equivalent measurements.

## Discriminating checks

- `df -h / /System/Volumes/Data` before and after cleanup.
- `du -sh` for each candidate before deletion.
- `git ls-files -- <candidate>` plus `git status --short -- <candidate>` from the owning repo to check tracked or changed files; inspect ignored artifacts for irreplaceable outputs too.
- `lsof -a -p <pid> -d cwd` for a candidate process's working directory; check open files in the specific target when ownership remains ambiguous. Restricted output is inconclusive, not proof of inactivity.
- `find /Applications "$HOME/Applications" /System/Volumes/Data/Applications -maxdepth 1 -iname 'Install macOS*.app' -print -exec du -sh {} \;` to locate removable installers.
- `ps -axo pid=,ppid=,rss=,command= | grep -E -i 'next-server|next dev|vite|vitest|playwright|npm|node|bun'` to avoid deleting active runtime state.

## Common traps

- Using an unmatched zsh glob such as `/Applications/Install\ macOS*.app` without `NULL_GLOB`; it aborts the rest of the measurement command.
- Deleting `node_modules` from the repo currently under active development without warning that `npm install` is required later.
- Clearing Playwright browser caches while tests or browser automation are active.
- Assuming `~/Library/Caches` contains only inert files: an app updater was observed executing from there during the recorded cleanup. Check before deletion, not afterward.
- Treating a permission-denied or truncated scan as a complete inventory, or escalating to deletion of protected OS update data.
- Copying machine-specific PATH, sandbox settings, credentials, or sensitive filenames into a portable cleanup recipe.
- Treating `/System/Volumes/Data` and `/` free-space output as separate disks; on APFS they are commonly different views of the same container.
- Emptying personal folders such as Desktop or Downloads during an automated cleanup; they may contain sensitive identity, visa, finance, or customer documents.