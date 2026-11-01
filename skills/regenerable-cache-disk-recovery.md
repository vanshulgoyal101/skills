# Regenerable Cache Disk Recovery

## Trigger

A machine needs disk space after a large OS update, installer download, browser profile growth, package-cache buildup, or many local project checkouts.

## Invariant

Delete only explicitly scoped data whose current owner, disposability, and recovery path have been verified. An old note calling a folder unused or an archive duplicated is a candidate list, not proof. Preserve personal files, secrets, source, browser profiles, editor workspace state, database volumes, and system-managed update data.

## Failure pattern

The visible storage loss is attributed to one suspected payload, such as an OS download, without locating it. Cleanup can then miss measured cache growth or delete active runtime files merely because their directory is named `Caches`. An absent installer search result does not establish that the update was applied or purged.

## Recommended method

1. Establish a baseline with `df -h / /System/Volumes/Data` and measure candidates with `du -sh`, not Finder estimates alone. On APFS, compare the container and volume accounting rather than adding mounted views together.
2. Check the suspected OS-update locations first: `/Applications/Install macOS*.app`, `/Library/Updates`, `/System/Volumes/Update`, `/private/var/db/softwareupdate`, and relevant Software Update asset caches. For a sudden unexplained multi-GB drop on macOS, also inspect `sysctl vm.swapusage`, `du -sh /System/Volumes/VM`, and `diskutil apfs list` read-only. A large VM volume plus high swap use is evidence of memory pressure, not disposable cache.
3. Check process ownership, working directories, open files, and active consumers; a process-name filter alone is insufficient. Include app updaters and background helpers. Quit an app through its normal lifecycle with permission before clearing its cache.
4. Prefer measured build outputs and download caches. Confirm build outputs are not tracked, dependencies have a lockfile and no local modifications, and the runtime is idle. Prefer the tool's supported cleanup command or an explicit cache subdirectory over deleting its entire state directory. VM download caches are not VM disks or database volumes.
5. Agree on recovery costs before removing installed dependencies or Playwright browsers. Restore with the repository's package manager and lockfile (for example, `npm ci`), its build command, and its pinned Playwright CLI (`npx playwright install` when Playwright is already installed). Redownloads need network access, time, and disk space.
6. Record same-volume `df -k /System/Volumes/Data` readings before and after each small batch, along with failed deletions. Report the observed delta, not the sum of candidate sizes; APFS snapshots, shared blocks, and concurrent writes affect physical recovery. Keep GB, GiB, free, and purgeable/available readings distinct. Do not attribute a later UI difference to cleanup without equivalent measurements.
7. Treat `/System/Volumes/VM/swapfile*` as active OS-managed state: never delete swap files manually. If swap is confirmed to be the cause, save work and close active workloads before a normal restart; re-check `sysctl vm.swapusage` and same-volume free space afterward. Swap can grow again when memory pressure returns. Preserve the sealed system snapshot and protected Apple asset stores.

## Discriminating checks

### Application remnants

- Compare app bundles in system/user application directories and indexed locations with bundle IDs, running executables, registered helpers, and app-specific storage. Absence from one directory or Spotlight is not proof of uninstallation.
- Match exact products and channels. An obsolete Stable or Canary profile does not authorize deleting an installed PTB profile; uninstalling Calendar/Mail does not authorize deleting the vendor's main notes app. Verify historical updater names against their installer payloads or app metadata.
- Inspect Application Support, caches, HTTP storage, preferences (including ByHost), saved state, logs, crash metadata, and the user's temporary cache directory. A folder called `Caches` can contain a WebView profile or updater executable: remove verified cache children, not the entire parent by name.
- For each bounded target, verify ownership, reject unexpected symlinks, check open files, and verify the path is gone afterward. Keep destructive targets explicit; do not use a vendor-wide wildcard across the Library. A read-only inventory can be broad, but deletion must remain narrow.
- A browser profile, OBS scene collection, recording, or database can remain valuable after its app disappears. Request approval for non-regenerable data. Local app deletion neither deletes online accounts nor revokes their OAuth grants.
- Leave shared vendor agents and privacy-protected data alone unless separately verified and authorized. Do not disable SIP, broadly change permissions, edit TCC databases, or interpret suppressed permission errors as a clean scan.

### Git worktree retirement

- Use `git worktree list --porcelain`, compare commit ancestry, and inspect tracked changes, untracked files, and ignored files separately. `git status --short` alone misses ignored QA screenshots and local environment files.
- Preserve unique evidence in an agreed non-colliding, ignored destination before removing a redundant checkout. Never copy secrets to a tracked archive. Check running consumers; read-only language-server handles differ from an active development server.
- Prefer `git worktree remove <path>` without force, then verify both the registration and directory are gone and the retained checkout is unchanged. Removing checkout folders is not permission to delete local/remote branches.

### Measurements and checks

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
- Deleting `/System/Volumes/VM/swapfile*` to reclaim disk space, or treating high swap as a removable cache. Swap is controlled by macOS; restart only through the normal OS lifecycle after saving work.
- Emptying personal folders such as Desktop or Downloads during an automated cleanup; they may contain sensitive identity, visa, finance, or customer documents.
- Assuming a Maven `target` directory is wholly disposable: the recorded audit found tracked files inside three such directories and preserved them.
- Deleting a non-purgeable OS update snapshot because `tmutil` lists no Time Machine snapshots. They are different snapshot classes; inspect APFS metadata and preserve system recovery state.
- Sweeping build folders by name (`find ~ -name target -exec rm -rf`) after reading this skill's tracked-files warning. The November 2026 repeat deleted 26–27 tracked files from `target/` in each of five checkouts. Run `git ls-files <dir>` per directory first; if it already happened, restore with `git ls-files -z --deleted | grep -z '/target/' | xargs -0 git checkout --`. A user's "go aggressive" instruction widens scope, not the safety checks.
- Summing `du` sizes of many sibling `node_modules` as the expected gain. Package managers that hard-link or clone from a shared store make each copy look full size: 19 GiB of worktree `node_modules` returned about 6 GiB when deleted.
- Deleting a lockfile-hash-keyed install cache wholesale. Keep the entries matching current lockfiles (usually the newest one or two) and prune older hashes; an orchestrator that seeds worktrees from it would otherwise reinstall from the network.
- Relying on `brew cleanup` when the Xcode license is unaccepted: it exits early. Clearing the contents of `$(brew --cache)` is the safe equivalent.
- Repeating full process command dumps until terminal output truncates. Rank compact `ps` columns first, then inspect full arguments only for candidates; summarize large inventories by family, count, size, and access failures.

## Evidence

The September 2026 audit preserved tracked Java outputs and VM disks, retired two same-revision worktrees while preserving eight ignored QA files, and removed an obsolete extension version only after checking the registered newer version. A later absent-app comparison removed 84 narrowly matched remnants across 12 app groups with about 70 MiB of observed recovery, not another multi-gigabyte gain. Firefox data remained inaccessible; recording deletion required a separate choice. See [the cleanup incident](../incidents/macos-beta-disk-recovery.md).

The October 31 – November 1, 2026 runs on an 8 GB machine with many agent worktrees recovered about 8 GiB and then about 4 GiB (observed `df` deltas). Issue worktrees were stripped of `node_modules`/`.next` only when no process had them as cwd (`lsof -d cwd`) and they were not modified that day; role worktrees used by live agents were kept. VS Code `workspaceStorage` entries were removed only when their `workspace.json` folder no longer existed (1 of many). RAM had no safe kill target; the editor was the largest consumer, and a later restart restored headroom. The run also repeated the tracked `target/` deletion above; all files were restored from git the next day.