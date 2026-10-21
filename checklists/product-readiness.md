# Product Readiness Checklist

- [ ] State the customer outcome in one sentence and name the primary user action.
- [ ] Name the core loop end to end and prove it works in production before secondary work; park everything else while it fails.
- [ ] When removing process for speed, add structural core protection in the same step: a required gate built from recorded real responses, a smoke after every deploy, rollback first and debugging second, and revert (not patch forward) any non-core change that breaks the core.
- [ ] No spend in tests: create spend-capable objects paused, never automate an action that starts spending (activate/resume), and know which local actions also mutate the provider (a local delete that deletes the remote campaign).
- [ ] Get real provider evidence from a sacrificial paused test object in a spend-capped account. Do not fake an external asset or test through a workspace bound to another brand's account or page.
- [ ] Map the workflow from first entry through completion, including empty, loading, error, paused, and success states.
- [ ] Identify the source of truth for local state, server state, generated output, URLs, and permissions.
- [ ] Make spend, publishing, destructive actions, and external side effects explicit and reversible where possible.
- [ ] Validate environment configuration and external-provider failure paths.
- [ ] Enforce tenant and storage boundaries at the database or service boundary.
- [ ] Keep business rules independently testable from the view and event layer.
- [ ] Test mobile, keyboard, focus, responsive layout, and real shipped interaction paths.
- [ ] Test restart, retry, stale request, corrupt storage, offline, and account-switch behavior when relevant.
- [ ] Verify generated artifacts, service-worker caches, metadata, routes, and deployment URLs.
- [ ] Add observability for failed workflows and user-visible recovery guidance.
- [ ] Record residual risk, non-goals, rollout steps, and the exact focused and broad validation commands.
