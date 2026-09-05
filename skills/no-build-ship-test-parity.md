# No-Build Ship/Test Parity

## Trigger

When a static product ships source JavaScript directly with no bundler, transpiler, or runtime dependency installation.

## Invariant

The module imported by tests is the same file the user downloads and executes in production.

## Failure pattern

Tests pass against one source or generated copy while the deployed static page serves another copy, or a missing build step leaves stale output with no compiler to expose it.

## Recommended method

- Keep runtime code dependency-free where the product intentionally uses a no-build architecture.
- Import the exact shipped module from tests.
- Scan HTML/module imports and test imports for parity.
- Checksum or timestamp-promote the shipped files in release checks.
- If a build step becomes necessary, replace this skill with generated-artifact parity tests rather than pretending source equals output.

## Discriminating checks

- Resolve every test import and shipped import to the same path.
- Run the static server from the clean checkout and smoke-test the downloaded module.
- Assert the working-tree/deployed artifact checksum matches the commit.
- Deliberately alter a generated copy and verify CI catches it.

## Common traps

- Adding a build step without updating the parity contract.
- Testing a source TypeScript module while shipping a stale JavaScript file.
- Assuming a static deploy provider rebuilt after a push.
- Calling zero dependencies “zero risk”; browser APIs and service workers still need tests.

## Evidence

Tools ships `lib.js` directly, and `tests/lib.test.js` imports that same file; its architecture explicitly treats this as the test-to-production contract.