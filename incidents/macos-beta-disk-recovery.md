# Incident: macOS Beta Disk Recovery

- **Date**: 2026-09-14
- **Repository**: Local machine / skills
- **Severity**: Low
- **Status**: Resolved

## Symptom

After downloading a macOS 27 beta, the user expected roughly 10 GB of disk space to be consumed and asked for a cleanup path informed by vbrain-private.

## Trigger sequence

The agent read the private local-machine and tooling notes, checked the usual macOS installer and update-cache locations, then measured regenerable development and user caches before deleting anything.

## Evidence

Initial `df -h /System/Volumes/Data` showed about 37 GiB available. The readable macOS update locations were small: `/Library/Updates` was 352K, `/System/Volumes/Update` was 80M, and `/private/var/db/softwareupdate` was 9.1M. No `Install macOS*.app` was found in the common application directories.

Successive Data-volume free-space deltas summed to about 10.64 GiB: 2.66 GiB after build/dependency/archive cleanup, 5.02 GiB after tool/app cache cleanup, 1.68 GiB after browser/editor cache cleanup, and 1.28 GiB after further dependency removal. The same command showed roughly 37 GiB available initially and 47 GiB afterward. The user later reported about 60 GB free in the UI; its units and available/purgeable accounting were not reconciled with `df`. This does not establish an additional reclaimed amount or its cause.

A later process check found a running app updater whose executable lived inside an already-cleared cache directory. The prior check covered test/package-manager processes but not that app's helpers. This exposed a gap in the deletion preflight.

## Root cause

The suspected beta installer was not present as a normal removable app or visible cache. The reclaimable space was instead spread across regenerable development artifacts, duplicate checkout dependencies, package-manager caches, browser/app caches, and stale archives already cataloged as disposable in vbrain-private.

## Fix

Removed build outputs, dependencies, download/app caches, and archives described as disposable in local notes. Process-name checks were performed, but did not establish that every target was unused. Future cleanup must verify current ownership and recovery paths, including updater helpers, rather than treating the historical deletion list as an approved script.

## Regression coverage

No code regression test applies. The operational checks were `df -h`, `du -sh`, common macOS installer searches, and process inspection before cache or dependency removal.

## Residual risk

Removed dependencies and Playwright browsers must be reinstalled on demand; reconstruction was not tested in this cleanup. Archive duplication was not independently verified. No app corruption was reported, but updater health was not validated. The beta payload's location and the later UI free-space difference remain unknown; protected system-managed storage was left untouched.

## Portable lesson

Use [regenerable-cache-disk-recovery](../skills/regenerable-cache-disk-recovery.md) when disk pressure appears after OS updates or local development cache growth.