# Zero-Dependency CI Validators

## Trigger

When a repository needs structural, link, secret, generated-file, or content-integrity checks that must run in CI and during repository intake.

## Invariant

The validator can run from a clean checkout with the platform runtime alone, reports specific violations, and checks the same contract locally and in CI.

## Failure pattern

A repository's integrity gate depends on the application dependency tree, cannot run before installation, or reports only a generic failure. Broken links, orphaned files, drift, or secret-shaped text reach review or deployment.

## Recommended method

Implement small zero-dependency scripts using the platform runtime. Walk only intended files, encode explicit checks, print actionable paths and reasons, and invoke the script from CI and contributor documentation.

## Discriminating checks

- Run the validator before installing project dependencies.
- Remove or hide an expected file and verify the output names the violation.
- Test a broken local link and secret-shaped fixture in a temporary safe copy.
- Ensure the CI command and documented local command are identical.

## Common traps

- Importing application packages into a repository integrity script.
- Scanning generated or dependency directories unintentionally.
- Failing without naming the file and invariant.
- Letting CI use stricter rules than local validation without documenting why.
