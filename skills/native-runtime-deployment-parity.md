# Native Runtime Deployment Parity

## Trigger

Use this skill when serverless code imports native modules, platform-specific
optional dependencies, image/audio/video codecs, database drivers, or binaries
that behave differently on the developer machine and the deployment runtime.

## Invariant

The production build contains the native binary and its transitive runtime assets
for the actual deployment OS/architecture. A successful local macOS build is not
sufficient evidence for a Linux serverless function.

## Failure pattern

A direct dependency or deduplication override makes a native module work locally
while the deployment tracer omits the Linux binary. The route then crashes before
its business logic runs, often returning a generic 500 and leaving paid upstream
requests unattempted or ambiguous.

## Recommended method

1. Identify the deployment runtime, architecture, Node version and function
   bundling/tracing behavior before changing dependency resolution.
2. Keep the native package explicit and install the deployment platform's optional
   packages when the package manager cannot reliably resolve them from the local
   platform.
3. Configure output tracing includes for native module and platform package paths
   used by the serverless route.
4. Build with the production bundler and inspect deployment logs, not just local
   `npm test` or `next build`.
5. Add a route-level smoke path that loads the native module before any paid
   provider call, and distinguish module-load failures from provider failures.
6. Avoid broad dependency overrides intended only to remove local duplicate native
   libraries; they can select the wrong platform artifact in production.
7. Keep native runtime warnings visible and investigate duplicate libvips/codec
   versions separately from the production packaging fix.

## Discriminating checks

- Run the affected route on the deployment platform and confirm no native module
  load error appears in logs.
- Inspect the build output/traced files for the target OS package.
- Test decoded input and output, not only module import.
- Force a provider failure and verify the error occurs after native initialization,
  proving the route reached business logic.
- Compare local and production runtime architecture before trusting parity.

## Common traps

- Installing only the current machine's optional native package.
- Using a dependency override to deduplicate native libraries without a Linux build.
- Treating a green local build as proof Vercel can load the binary.
- Retrying paid generation while the route fails during module initialization.
- Hiding native load failures behind generic provider errors.

## Evidence

AdBrain's production creative route returned 500 because Vercel could not load
Sharp's Linux libvips binary even though macOS raster tests passed. Explicit Linux
Sharp optional dependencies plus Next output tracing resolved the packaging issue;
CI and Vercel then passed.
