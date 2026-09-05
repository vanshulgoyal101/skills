# Service Worker Test Isolation

## Trigger

Use this skill when browser tests run an offline-first app with a service worker, runtime cache, cache-busted assets, or a persistent browser context.

## Invariant

Every browser test starts from a known asset state and observes the current source under test, not a shell or module cached by another test or an earlier run.

## Failure pattern

A test intermittently sees no app shell, stale exports, old metadata, or a missing route. The failure disappears in isolation because a service worker or browser cache has changed which files the test receives.

## Recommended method

- Block service workers in Playwright test contexts unless the test specifically verifies service-worker behavior.
- Keep one dedicated opt-in test for registration, cache population, and offline fallback.
- Version every changed non-hashed module and the service-worker cache together.
- Verify the network request uses the current module version before trusting a browser pass.
- Run the suite repeatedly when a failure is intermittent; a single green run is not evidence of isolation.

## Discriminating checks

- Repeat the browser suite several times and compare failures by test name.
- Run the failing test with a fresh context and with service workers blocked.
- Inspect requests for the expected cache-busted module URL.
- Deliberately serve an old cached module and confirm the isolated test still loads the current one.
- Run a separate offline/service-worker test against a controlled cache lifecycle.

## Common traps

- Treating a flaky missing-heading failure as an application race without inspecting asset requests.
- Globally testing service-worker behavior while allowing it to leak state into every UI test.
- Bumping the cache name without bumping the imported module URL, or vice versa.
- Using `git checkout` or cleanup commands that discard another contributor's uncommitted cache fix.
