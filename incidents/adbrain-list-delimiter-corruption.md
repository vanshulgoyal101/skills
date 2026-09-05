# Incident: Commas in free-text lists were treated as separators

- **Date**: 2026-09-04
- **Repository**: adbrain
- **Severity**: High — brand targeting and ad inputs could be silently corrupted
- **Status**: Fixed and covered by tests

## Symptom

A location such as `Austin, Texas` or a USP such as `Affordable, transparent pricing` could reopen as multiple list items after a form save.

## Trigger sequence

The form serialized a list with newlines, while the parser split on both commas and newlines. A comma that belonged to the content was interpreted as a boundary.

## Evidence

`tests/brand-inputs.test.tsx` covers token fields and the exact comma-containing round-trip.

## Root cause

The serialization format had no unambiguous delimiter contract. Presentation punctuation was allowed to change data structure.

## Fix

Use a declared delimiter for free-text lists and test the actual form serialization boundary. Keep legacy migration parsing separate from the steady-state parser.

## Regression coverage

Brand input tests assert item count and exact values after save/reload for comma-containing content.

## Residual risk

Legacy records created with ambiguous separators may be impossible to reconstruct perfectly; migration must preserve uncertainty rather than invent boundaries.

## Portable lesson

See [semantic-delimiter-safety](../skills/semantic-delimiter-safety.md).
