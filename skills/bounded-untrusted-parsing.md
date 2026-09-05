# Bounded Untrusted Parsing

## Trigger

Use this skill when users can paste or upload patterns, queries, markup, source code, or other input whose parser or matcher can consume unbounded CPU or memory.

## Invariant

Malformed or pathological input produces a bounded, explicit result and never freezes the UI, silently changes program meaning, or sends the input to an untrusted service.

## Failure pattern

A regex with catastrophic backtracking hangs the tab; a formatter splits inside a quoted string; a parser guesses indentation or structure and changes semantics; or a local file workflow adds a network fallback that violates the product's privacy boundary.

## Recommended method

- Tokenize with awareness of strings, comments, escapes, nesting, and delimiters.
- Put hard match, size, depth, and wall-clock budgets around expensive scans.
- Surface partial-result and stopped-early states instead of pretending output is complete.
- Warn on known danger patterns, but treat heuristics as warnings rather than proofs.
- Preserve opaque regions byte-for-byte when the formatter cannot prove a safe rewrite.
- Keep privacy boundaries explicit: local input stays local, including on unsupported-browser paths.

## Discriminating checks

- Test a known catastrophic pattern such as `(a+)+$` against a long non-match and assert bounded completion.
- Test delimiters, escapes, comments, nested groups, and quoted values containing punctuation.
- Mutation-test the size or match cap and verify the guard fails when the bound is removed.
- Compare formatted output for strings/comments/triple-quoted blocks against exact preservation expectations.
- Test unsupported browser APIs and confirm the UI gives a useful local-only explanation rather than uploading input.

## Common traps

- Treating a regex timeout heuristic as a complete ReDoS defense; use isolation for stronger guarantees.
- Splitting source with a raw comma, whitespace, or quote regex.
- Returning partial output without saying that it is partial.
- Adding a convenient server fallback to a privacy-first tool.
- Calling a formatter "safe" when it guesses structure it cannot validate.
