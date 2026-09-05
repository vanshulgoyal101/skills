# Link Hub Registry Design

## Trigger

Use this skill when a landing page or directory is meant to present many current products, projects, and public surfaces without turning into an unscannable dump of links.

## Invariant

The hub remains easy to scan, accurately reflects the live project list, and separates current public work from archived, private, or deprecated destinations.

## Failure pattern

Link aggregators become noisy because they list every old project, mix active and inactive pages, or fail to provide visual hierarchy. The result is a cluttered page that users ignore and a stale registry that no longer represents the actual product portfolio.

## Recommended method

- Group by responsibility or product family instead of one long flat list.
- Use consistent card structure, labels, and descriptions.
- Keep the live registry explicit and reviewed as a product artifact.
- Distinguish current public projects from private or legacy surfaces.
- Prefer a curated list of active destinations over a complete dump of every project ever built.

## Discriminating checks

- Audit the live list against the actual deployed product inventory.
- Check that each card resolves to an active canonical destination.
- Ensure the hub is readable without scrolling through an undifferentiated wall of items.
- Confirm the page still works when the number of projects grows.

## Common traps

- Treating the links page as a memory dump instead of a curated registry.
- Listing redirect-only or dead destinations without clear labeling.
- Overloading the page with equal-weight cards and no hierarchy.
- Forgetting to keep the links page aligned with the master sitemap index.

## Evidence

The `vanshul-links` refresh required a better registry structure and a curated list so that live domains like `adbrain`, `ctx`, `mcp`, `vbrain`, and the public portfolio family all appear clearly and consistently without visual clutter.
