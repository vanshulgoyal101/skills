# AdBrain Production Native Runtime Failure

## Trigger

A real production creative generation request was made after paid OpenRouter
variables and the database receipt migration were configured.

## Impact

The route returned HTTP 500 before model execution because the serverless
function could not load Sharp's Linux native libvips binary. Local macOS tests
and the deployment build had not proved runtime loading. No creative or usage
receipt was created for the initial failures.

## Evidence

Vercel logs reported:

```text
Could not load the "sharp" module using the linux-x64 runtime
ERR_DLOPEN_FAILED: libvips-cpp.so.8.18.6: cannot open shared object file
```

The failure occurred in the creative route's external module loader, before the
provider call. A local dependency override had removed duplicate macOS native
libraries but caused the production tracing problem.

## Root cause

Native optional dependencies were resolved from the developer platform, while
Vercel's Linux runtime and Next's output tracing were not represented explicitly.

## Fix

- Removed the broad Sharp override.
- Added explicit Linux Sharp optional dependencies.
- Added Next output tracing includes for Sharp and Linux Sharp packages.
- Rebuilt and deployed through Vercel.
- Verified CI, Vercel readiness, production HTTP status and a real saved creative
  receipt using paid OpenRouter text and image providers.

## Regression tests

Image execution tests, actual PNG raster tests, production build, GitHub CI,
Vercel deployment logs and one bounded production generation.

## Residual risk

Local macOS emits duplicate libvips warnings because Next has a transitive Sharp
runtime. Those warnings did not prevent the Linux deployment, but Sharp/Next
upgrades require repeating both local raster and production smoke checks.
