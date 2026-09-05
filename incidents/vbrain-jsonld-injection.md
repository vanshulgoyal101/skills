# Incident: JSON-LD broke out of its script block

- **Date**: 2026-09-04
- **Repository**: vbrain
- **Severity**: High — generated pages had an HTML injection path
- **Status**: Fixed and deployed

## Symptom

The static-site generator inserted `JSON.stringify()` output directly into a JSON-LD script block.

## Trigger sequence

A note title or description containing `</script>` was serialized into JSON-LD. `JSON.stringify` preserved `<`, so the browser could close the script element early and parse attacker-controlled markup as HTML.

## Evidence

A direct generator probe with `</script><img src=x onerror=...>` produced an `<img>` outside the intended JSON-LD block before the fix.

## Root cause

JSON validity and safe embedding in an HTML script context are different contracts. The serializer handled the former but not the latter.

## Fix

`jsonLdScript()` unicode-escapes `<`, `>`, `&`, U+2028 and U+2029 before embedding. JSON parsers still recover the original values.

## Regression coverage

`site/test/ssg.test.js` asserts there is only one real script terminator, the JSON round-trips, and line separators are escaped. Public tests reached 248.

## Residual risk

The static renderer still accepts Markdown-derived HTML elsewhere; the build's first-party-content assumption and CSP remain part of the boundary.

## Portable lesson

Treat every serialization context separately: JSON, HTML text, HTML attributes, URLs, and JavaScript strings need different escaping contracts.
