# Service Worker Deploy Pattern

## Trigger

When a static site or PWA caches an app shell, hashed assets, API responses, or offline content across deployments.

## Invariant

A new deployment becomes visible promptly while cached assets remain available offline. The shell and immutable assets use strategies appropriate to their update and freshness requirements.

## Failure pattern

Users receive an old HTML shell that references missing or stale assets, or a service worker keeps serving an outdated deployment after a release. Offline support becomes a reason to hide production fixes.

## Recommended method

Use network-first for the mutable shell and cache-first for immutable, content-hashed assets. Version or invalidate caches deliberately, keep fallback behavior bounded, and test install, activate, fetch, update, and offline paths as one lifecycle.

## Discriminating checks

- Change the shell version and verify a fresh navigation sees it without manually clearing storage.
- Confirm hashed assets remain available when offline.
- Test a missing asset and an unavailable network separately.
- Run browser tests with isolated service-worker and cache state for each test.

## Common traps

- Cache-first HTML with no update escape hatch.
- Updating the service worker without changing its cache contents or version.
- Sharing persistent browser state between tests.
- Assuming a local hard refresh represents a real returning user.
