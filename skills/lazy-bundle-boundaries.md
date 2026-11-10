# Lazy Bundle Boundaries

## Trigger

Use when a heavy SDK, renderer or private route should load on demand, especially
after a bundler upgrade or manual chunking change.

## Invariant

A lazy feature must stay outside the initial static dependency graph. A separate
filename is not proof of lazy loading.

## Failure pattern

A bundler places its statically imported preload helper inside a lazy vendor
chunk. The entry now depends on that chunk, defeating the intended split. A
top-level SDK import can produce the same result even when its caller is lazy.

## Recommended method

1. Inspect emitted entry imports and HTML modulepreloads, not only source imports.
2. Isolate shared bundler helpers from feature-only chunks.
3. Import optional services inside their first-use function.
4. Share the pending initialization promise across concurrent callers; clear it
   on rejection so a later call can retry, and propagate the failure.
5. Disable auth persistence, refresh and URL-session detection on clients whose
   contract is anonymous reads only. Keep authenticated clients separate.
6. Assert forbidden eager chunks against every generated route's HTML.
7. Rebuild and repeat browser route checks after bundler/plugin upgrades.

```js
// Wrong: initialization is eager even if getClient is only called later.
import { createClient } from 'heavy-sdk';

// Right: initialization starts at the feature boundary.
let pending;
const getClient = () => pending ??= import('heavy-sdk')
  .then(({ createClient }) => createClient())
  .catch(error => {
    pending = undefined;
    throw error;
  });
```

## Discriminating checks

- Fail the build when a feature-only chunk appears in entry modulepreloads.
- Inject one forbidden preload and prove the verifier rejects it.
- Test simultaneous initialization, rejected initialization and retry.
- Exercise the real deferred feature in a production browser build.
- Distinguish initial-load cost from the deliberate idle/first-use download.

## Common traps

- Assuming a chunk named `lazy-*` is actually lazy.
- Caching a rejected promise forever.
- Dropping the import error and pretending the service initialized.
- Keeping old chunk assumptions after a bundler changes its runtime helpers.

## Evidence

The portfolio isolated Vite's preload helper and deferred its anonymous Supabase
client. The build verifier rejects eager renderer, Markdown, SDK and dashboard
preloads. See [configuration and measurements](https://github.com/vanshulgoyal101/vanshul-portfolio/blob/41ac89c/documentation/config.md)
and [client initialization](https://github.com/vanshulgoyal101/vanshul-portfolio/blob/41ac89c/src/lib/supabaseClient.js).
