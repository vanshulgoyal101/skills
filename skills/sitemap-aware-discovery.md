# Sitemap-Aware Discovery

## Trigger

When a crawler, documentation importer, site indexer, or agent context builder must discover a bounded set of pages from a website.

## Invariant

Discovery includes sitemap-declared pages as well as pages reachable from the starting URL, while remaining bounded by depth, page, host, and network limits.

## Failure pattern

Important pages that are valid and published but not linked from the starting page never enter the corpus. Search and generated context look complete while silently omitting the site's sitemap inventory.

## Recommended method

Seed the crawl queue from a same-origin sitemap when available, then follow links within explicit bounds. Normalize URLs, deduplicate before fetching, validate redirects at every hop, and preserve a per-run limit.

## Discriminating checks

- Provide a fixture with a sitemap-only page and verify it is discovered.
- Verify depth, page-count, host, and redirect limits terminate the crawl.
- Test malformed sitemap entries and duplicate URLs.
- Confirm sitemap fetching does not bypass the same network safety checks as ordinary pages.

## Common traps

- Assuming the home page links to every indexable document.
- Fetching sitemap URLs without host or SSRF validation.
- Counting duplicate URLs against limits inconsistently.
- Letting sitemap discovery become an unbounded recursive crawl.
