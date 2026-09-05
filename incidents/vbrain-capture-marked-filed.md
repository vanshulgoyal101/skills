# Incident: Capture marked filed without being written

- **Date**: 2026-09-03
- **Repository**: vbrain-private
- **Severity**: High — user-visible data appeared lost
- **Status**: Fixed and deployed

## Symptom

A capture disappeared from the inbox and could not be found by search after the user clicked the filing control.

## Trigger sequence

1. Private Worker had `edit:false` because `GITHUB_WRITE_TOKEN` was absent.
2. The UI hid the real write-through control and showed `✓ filed`.
3. That control only set `filed=true` in Supabase; it did not write the text into a note.
4. The inbox query filters `filed=eq.false`, so the capture vanished from the UI and remained outside searchable Markdown.

## Evidence

`healthz` reported `edit:false`. `drain-inbox.mjs --filed` recovered capture #2. Search matched it only after it was manually added to `worldview.md`.

## Root cause

The UI label implied a stronger operation than the backend performed, and there was no read-back path for already-filed captures.

## Fix

- Label the fallback honestly: `mark done (not saved to a note)`.
- Require confirmation before hiding an un-written capture.
- Add `drain-inbox --filed`.
- Reload the in-memory bundle after successful write-through so search sees the new note immediately.

## Regression coverage

Private Worker deployed as `f83cb210`; both frontend copies contain the label and `reloadBundle()` path. The recovered text was verified against the real search engine.

## Residual risk

The real write-through remains disabled until `GITHUB_WRITE_TOKEN` is configured.

## Portable lesson

Use [semantic-delimiter-safety](../skills/semantic-delimiter-safety.md) for data boundaries and require UI copy to describe the actual persistence contract, not the intended one.
