# Incident Collection: Arcade Generated and Production Runtime

## Scope

Verified failures where source was locally correct but production behavior failed because of generated assets, cache-busted no-build modules, or runtime CDN module resolution.

## Confirmed failures

- The live hub showed only the Random button because `auth.js` removed Account and Leaderboard after initialization failed.
- First root cause: `pageshow`/`online` listeners were registered before `let currentUser` and `let syncedFor`; a `pageshow` event during module evaluation triggered a temporal-dead-zone `ReferenceError`.
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
