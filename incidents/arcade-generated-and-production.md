# Incident Collection: Arcade Generated and Production Runtime

## Scope

Verified failures where source was locally correct but production behavior failed because of generated assets, cache-busted no-build modules, or runtime CDN module resolution.

## Confirmed failures

- The live hub showed only the Random button because `auth.js` removed Account and Leaderboard after initialization failed.
- A separate initialization failure: `pageshow`/`online` listeners were registered before `let currentUser` and `let syncedFor`; a `pageshow` event during module evaluation triggered a temporal-dead-zone `ReferenceError`. This event exception did not cause the SDK import catch; fixing it alone did not restore the controls.
- Second root cause: the floating `https://esm.sh/@supabase/supabase-js@2` import resolved to `2.116.0`, whose generated submodule imports returned 404; the catch path treated Supabase as unavailable and removed the controls.
- GitHub Pages had built the correct commit, but the custom domain briefly served old HTML/assets until edge caches refreshed.

## Durable fixes

- Register top-level browser-event listeners only after all module state they read has been initialized.
- Pin no-build CDN imports to a known working, bundled version: `@supabase/supabase-js@2.45.4?bundle`.
- Apply the same pinned import to hub, stats, game-side shared helpers, and modulepreload.
- Rebuild every generated game bundle after changing a shared runtime import.
- Bump query-string versions and update digest pins for no-build assets.
- Verify production with the actual browser console/network path, not only `curl` and `node --check`.

## Reusable skills

- [generated-source-parity](../skills/generated-source-parity.md)
- [verification-gates](../skills/verification-gates.md)
- [async-lifecycle-guards](../skills/async-lifecycle-guards.md)

## Follow-up audit (2026-09-14)

Evidence: Arcade fix commit `47207fa693f2be2f378a78c8210a240109b45ad2`; deployed sitemap descendant `4e269c473404e1a44fcd8f7878187827eae480d6`. These are dated verification results, not a statement of current production state.

| Trigger and impact | Root fix | Discriminating coverage |
|---|---|---|
| Hub upload starts, then another game or a higher score is queued; successful old upload deletes the whole queue. | Acknowledge only uploaded rows whose score and progress still match. | Delayed upsert with newer and unrelated retries preserves both. |
| Zero-score daily backup is in flight while its learned-word progress changes; score-only ACK deletes the new backup. | Compare the current blob with the submitted snapshot before acknowledging; queue submissions before network work. | Real cloud helper with an injected SDK retains the equal-score backup. |
| Profile, restore, save, or leaderboard response resolves after account change. | Capture account generation and discard stale local/cache/UI commits; return loaded profiles rather than mutating shared state during fetch. | Delayed profile load after sign-out, switched-account save, and expired restore tests. |
| Auth callback returns a promise that performs SDK calls under the SDK auth lock. | Return synchronously; defer sync and use the SDK's initial-session event. | Complete hub module boot with an auth-lock simulation, not just extracted helpers. |
| Initialization fails once, or count queries resolve with errors and null counts. | Permit later initialization retries; reject failed count results instead of constructing a rank. | Before fixes: retry stayed signed out and failed queries produced rank 1 of 1; both regressions now pass. |
| Shared changes are released using default lists that omit 2048. Repeat promotion sees only a redirect stub and deletes served assets before failing. | Include every game in build and promotion lists; preflight all inputs before deleting any served files. | Registry parity plus disposable filesystem fixtures for repeat and incomplete-batch promotion. |
| Featured-count regex includes commented-out Word card, certifying eleven while ten cards render. | Parse actual card elements; align README, metadata, and generated social image. | DOM count and structured metadata agree; genuine duplicate cards are not deduplicated away by the test. |
| 2048 is absent from the database audit's headline readers, yet unreadable rows produce a clean summary. | Add its reader, verify all-game coverage, and fail the audit on unreadable or under-reported rows. | Live read-only audit: no unreadable or under-reported saved stores after correction. |
| Stats uses UTC day keys with local labels while server groups in IST; a late response can repaint private data after sign-out. | Use the server calendar and stable labels; invalidate responses on auth or range change. | IST-next-day/UTC-previous-day test and in-flight sign-out regression. |
| Edge-flick test chooses a random board already aligned in the swipe direction. | Fix initial RNG so the gesture must cause a valid move. | Keep the original movement assertion; do not rerun randomly until green. |

Validation: 452 tests across 46 files; all twelve games built and promoted; 14 live database invariant checks. Chromium loaded all twelve generated games at 1280px and 390px without observed page errors, horizontal overflow, or broken images. Production verification found ten leaderboard sections with scores, the stats sign-in view, and exact matches for the auth digest and all twelve game bundles.

Residual limits: no real Google OAuth consent or authenticated owner dashboard was exercised. Snapshot ACK checks do not solve server-side write ordering or every cross-tab/account ownership race. Promotion preflight is not an atomic filesystem transaction. Browser smoke and green tests do not establish that all bugs are absent.

Related: [cloud sync integrity](../skills/cloud-sync-integrity.md).
