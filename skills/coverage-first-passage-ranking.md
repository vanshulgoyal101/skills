# Coverage-First Passage Ranking

## Trigger

Use this when search ranks passages, documents, or context blocks against a multi-term query.

## Invariant

A passage matching more distinct query terms ranks above one that repeats only one term; term frequency is a tiebreaker, not the primary notion of coverage.

## Failure pattern

Naive term-frequency ranking lets a block spam one query word five times and outrank a block that covers two or three requested concepts once each. The result looks technically relevant while missing the user's intent.

## Recommended method

- Normalize the query into distinct terms.
- Track distinct-term coverage separately from frequency.
- Sort by coverage first, then relevance/frequency, then stable document order.
- Add a fixture where repeated single-term text competes with lower-frequency multi-term text.

## Discriminating checks

- Query `alpha beta`; block A contains `alpha` five times, block B contains `alpha beta` once each. Assert B ranks first.
- Keep stable tie-breaking for equal coverage and score.
- Test punctuation, prefixes, and repeated query terms without changing the coverage invariant.

## Common traps

- Calling raw term frequency "relevance".
- Returning a score without exposing the coverage dimension needed to debug ranking.
- Changing ranking without regression fixtures that explain why the order matters.

## Evidence

The ctx and mcp search ranking changes added coverage-first ordering and tests in `9906bad` and `818a34d`.
