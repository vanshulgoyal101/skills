# Incident: Public Indexing Hygiene

- **Date**: 2026-09-05
- **Repository**: `vanshul-portfolio`, `vanshul-blog`, `mcp`, `vanshul-links`
- **Severity**: High
- **Status**: Resolved

## Symptom

Search Console and crawler audits showed that several public surfaces were either missing from the sitemap family, contradicting `noindex`, or routed incorrectly for crawling.

## Trigger sequence

1. A public site was deployed or repointed without updating the master family sitemap.
2. A page remained in sitemap generation even after being redirected or tagged `noindex`.
3. Worker or public API routes were either over-blocked or incorrectly exposed.
4. The links registry and public product list were stale relative to the live site inventory.

## Evidence

- `blog.vanshul.com` had a conflicting `noindex` and public sitemap situation.
- The `vanshul.com` family sitemap index did not consistently include all live public repos.
- `mcp` had a route boundary issue around crawlability vs private health checks.
- The product links site had an incomplete or stale list of active public projects.

## Root cause

The system had multiple public registries that were not synchronized: the links hub, the master sitemap list, the static page metadata, and the actual live route state. This created a publication model where “live” and “discoverable” were not the same thing.

## Fix

- Added the live family entries to the master sitemap list.
- Removed or corrected `noindex` contradictions on public pages.
- Kept private health and redirect-only routes out of the public index.
- Updated the links page to reflect the active product set and public surfaces.
- Re-checked the worker and public-facing path behavior with live HTTP verification.

## Regression coverage

- Sitemap audit across the family
- robots and crawlability checks for `mcp`
- live route verification for canonical and redirect surfaces
- links-page inventory regression checks

## Residual risk

A future repo addition must be added to the public registry and sitemap in the same deployment pass. The risk remains process-related rather than technical if the release gate is kept in place.

## Portable lesson

Which skill should be updated or created?

This incident is the direct source of `public-indexing-hygiene` and `search-console-release-gates`.
