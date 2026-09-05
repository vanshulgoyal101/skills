# Codec Invertibility Tests

## Trigger

When encoding, decoding, formatting, escaping, serializing, or converting user-controlled values between representations.

## Invariant

For values inside the supported domain, decoding an encoded value returns the original semantic value. Boundary and Unicode values do not silently lose information.

## Failure pattern

A converter passes a familiar example but corrupts delimiters, whitespace, Unicode, empty values, nested structures, or boundary lengths. The corruption may only appear after a save-and-restore cycle.

## Recommended method

Define the supported domain, then test round trips as a property of the codec: `decode(encode(value))` equals the original. Add explicit fixtures for empty, boundary, delimiter, malformed, and Unicode values, and distinguish canonicalization from accidental data loss.

## Discriminating checks

- Add a round-trip test for every public encode/decode pair.
- Include empty input, maximum expected input, delimiter characters, and multibyte text.
- Test malformed encoded input and verify a deliberate error or fallback.
- Compare semantic structures rather than incidental formatting when canonicalization is allowed.

## Common traps

- Testing only one happy-path string.
- Choosing a delimiter without escaping or length-prefixing it.
- Treating a parseable result as proof that it is faithful.
- Hiding lossy conversion inside a UI formatter.
