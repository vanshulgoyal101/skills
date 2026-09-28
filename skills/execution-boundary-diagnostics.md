# Execution Boundary Diagnostics

## Trigger

A command works interactively but fails in an agent, sandbox, container, or CI session with a missing executable, `EPERM`, connection failure, or credential-helper error.

## Invariant

Identify the failing execution boundary before changing application code or permissions. Use the narrowest authorized remedy, preserve dependency identity, and never interpret an unexecuted check as a pass.

## Failure pattern

Private operational notes recorded npm cache write failures, shell-dependent Node resolution, denied local port binding, and credential helpers needing unavailable filesystem access. Treating these as application defects leads to irrelevant edits, broad permission changes, or tests run against a different dependency set.

## Recommended method

1. Record the exact command, exit code, and first relevant error without printing credentials or full environment objects. Historical sandbox behavior is a hypothesis, not a current platform guarantee.
2. Separate executable lookup, filesystem access, listener binding, network reachability, and authentication. Test only the boundary named by the error.
3. For executable lookup, inspect `command -v node`, `command -v npm`, and `node --version` in the failing shell. Use the project's verified runtime or version manager; do not hard-code someone else's home directory or runtime version.
4. For npm cache write errors, inspect the configured cache and its permissions. A command-scoped writable cache such as `npm_config_cache="$TMPDIR/npm-cache" npm ci` can avoid changing global ownership; first verify the temporary directory is writable. Do not apply recursive permission changes to the home directory.
5. A failed localhost request does not prove the server is down. Check its listener and inspect it from an authorized browser or execution context. An HTTP 403 is a response to investigate, not proof that every network operation is blocked.
6. If a credential helper cannot access its keychain or temporary files, use the supported authentication flow in an authorized context. Do not copy credentials into commands or repositories, or disable the sandbox globally to fix one operation.
7. Rerun the same focused check after the boundary fix. If dependencies cannot be installed, report that limitation. Borrowed or symlinked dependencies are diagnostic only unless lockfile, version, platform, and resolution equivalence are established. Reuse a matching verified installation; use a clean locked install for an actual mismatch rather than changing source to hide missing modules.
8. Treat an interrupted or `outcome_unknown` tool result as unknown, not failed.
	 Inspect the current file/ref/resource before retrying a mutation. A compound
	 command can report failure after an earlier push or write already succeeded.
9. Filter large API output before a subprocess captures it. For example, project
	 Git metadata with the CLI's JSON query option before `execFileSync` buffering;
	 a buffer-overflow exception can dump an entire response. Suppress raw error
	 bodies for requests that might carry credentials or customer data.

### Interactive input and command transport

- A submitted command is not proof a hidden-input prompt is ready. Long multiline
	terminal input can be garbled by concurrent manual pasting; characters entered
	before no-echo mode may be displayed. Ask users to wait for the actual prompt.
- For a nontrivial interactive operation, write a small owned temporary helper,
	syntax-check it, and launch with a short command. Keep secret values out of
	source/arguments/history; never send them through a chat question or tool result.
- If command construction fails, identify whether parsing happened before any
	side effect. Literal newlines in a single-quoted JavaScript string are invalid;
	use correct quoting or structured input instead of retrying the same payload.
- Cancel only the malformed command you own. Do not terminate worker terminals
	or assume an empty output buffer means cancellation or successful persistence.

### Test and browser execution boundaries

- On macOS, `/tmp` may resolve to `/private/tmp`. Canonicalize paths for test
	selection and CLI-entry comparisons; a path filter matching no tests is not a pass.
- Keep caches and temporary configuration outside a borrowed dependency tree.
	Disable implicit environment loading and close programmatic test contexts.
	Check the runner's current API rather than copying obsolete configuration flags.
- Temporary network guards and artifacts may disappear between sessions. Verify
	their existence and scope; do not silently drop protection when a path is missing.
- Read-only review uses an immutable commit or detached overlay, not the author's
	moving working files. A red regression belongs with the eventual repair.
- A dependency's runtime export shape can differ by version, and an SDK factory
	can ignore a typed option. Check installed runtime code and a focused transport
	probe before adapting imports, endpoints or timeout behavior.
- Hidden/streamed DOM content is not evidence of visible UI, and a hidden embedded
	browser tab can distort the observation. Bring it into view; record and restore
	any required focus emulation. Do not patch the DOM or weaken assertions to claim a pass.
- Use the current snapshot or actual accessible name for a control. Visible text
	inside an element does not always equal its computed accessible name. Avoid
	recording sensitive account-page snapshots when only status labels are needed.

## Discriminating checks

- Does the executable resolve to the expected runtime in the exact shell that failed?
- Does `npm config get cache` point to a writable location? Does a scoped cache change remove the same write error?
- Does `lsof -nP -iTCP:<port> -sTCP:LISTEN` show the intended listener? Restricted visibility is inconclusive.
- Does the local route work from an authorized browser while the original request still fails? Distinguish listener failure from reachability and authentication.
- Does the original command succeed under the narrow correction with the same source, lockfile, and runtime?

## Common traps

- Treating all Git commands, including local history reads, as requiring network access.
- Interpreting curl status `000` as an HTTP response; inspect its exit code and error instead.
- Assuming an empty terminal buffer means a server exited.
- Granting broad filesystem or network permissions based on stale machine notes.
- Calling tests against a sibling project's dependency tree equivalent to a clean install.

## Evidence

Distilled from private local sandbox and Git troubleshooting records dated August 2026. Those records report scoped temporary npm caches and explicit runtime selection as workarounds. Exact permission behavior is environment-specific and must be checked again; private paths, identities, and credentials are intentionally omitted.