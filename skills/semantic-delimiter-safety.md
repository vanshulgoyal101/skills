# Semantic Delimiter Safety

## Trigger

When a list field contains free text that may include punctuation also used as a serialization delimiter: locations, USPs, offers, tags, or descriptions.

## Invariant

Saving and reopening a value preserves item boundaries and item content exactly, including punctuation inside an item.

## Failure pattern

A form renders `Austin, Texas` as a list and the parser splits on both commas and newlines. Saving turns one location into `Austin` and `Texas`, silently corrupting targeting or copy.

## Recommended method

- Choose a delimiter that the field contract excludes, usually newline for free-text lists.
- Make serialization and parsing explicit with named functions.
- Add a migration rule for legacy data instead of broadening the parser until it becomes ambiguous.
- Round-trip through the real form boundary, not only the helper in isolation.

## Discriminating checks

- Round-trip items containing commas, quotes, colons, and Unicode.
- Assert item count and exact values before and after save/reload.
- Test legacy input separately and document what cannot be recovered unambiguously.
- Verify the submitted payload uses the declared delimiter only.

## Common traps

- Splitting on every plausible separator “to be forgiving.”
- Using display formatting as the storage format.
- Treating a migration parser as the permanent parser.
- Testing only simple one-word list items.

## Evidence

AdBrain's brand input tests caught comma-containing locations and USPs being split into separate values on form save.