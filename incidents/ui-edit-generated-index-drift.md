# Incident: Web note edits broke strict validation

- **Date**: 2026-09-04
- **Repository**: vbrain-private
- **Severity**: Medium — every UI note edit could leave CI red
- **Status**: Fixed

## Symptom

A note edited from the web UI passed its own GitHub commit but the next strict validation failed because `llms-full.txt` was stale.

## Trigger sequence

1. The Worker committed the Markdown note.
2. The generated AI index files were not regenerated.
3. Private CI ran `validate.mjs --strict` and rejected the commit.

## Evidence

The Kochi note commit failed private CI with `llms-full.txt: stale — run: node scripts/gen-llms.mjs`.

## Root cause

Generated files had a validation contract but no owner on the write path. The UI wrote source content without running the generator.

## Fix

Private CI now has a push-time index-refresh job that regenerates and commits `llms.txt` and `llms-full.txt` when they drift. Pushes made with `GITHUB_TOKEN` do not trigger another workflow, so it cannot loop; pull requests report drift without committing.

## Regression coverage

Private CI run `33860319169` passed the index job, strict validation, and site tests.

## Residual risk

Generated-index commits are asynchronous; a consumer may briefly see the source commit before the index commit. The validation gate still prevents an invalid release from being treated as healthy.

## Portable lesson

Every generated artifact needs an explicit owner: generate at source-write time, regenerate in CI, or remove the generated artifact from the validation contract.
