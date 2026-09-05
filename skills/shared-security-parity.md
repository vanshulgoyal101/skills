# Shared Security Parity

## Trigger

When sibling services, workers, libraries, or repositories implement the same security boundary more than once.

## Invariant

Equivalent inputs receive equivalent security decisions across every implementation that can reach the protected operation. A security fix in one sibling cannot leave a weaker copy active elsewhere.

## Failure pattern

One service validates alternate URL or IP forms, redirect hops, content types, or authorization boundaries correctly while another copy recognizes only the common representation. Attackers choose the weaker path.

## Recommended method

Identify the shared security contract before changing a copy. Prefer one shared module when runtime constraints allow it; otherwise maintain a parity test matrix and compare behavior across implementations. Treat a stronger sibling implementation as evidence, not as proof that every sibling is safe.

## Discriminating checks

- Run the same adversarial fixture matrix against every implementation.
- Compare alternate encodings, malformed values, redirects, boundary ranges, and error paths.
- Search for duplicated security helpers and require a review when one changes.
- Add a regression test to the weaker implementation before declaring parity restored.

## Common traps

- Assuming sibling code was copied recently and is still equivalent.
- Testing only canonical inputs such as dotted-decimal IPv4.
- Sharing names but not behavior between security helpers.
- Fixing the known service while leaving batch, preview, or legacy routes on the weaker copy.
