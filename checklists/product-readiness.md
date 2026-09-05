# Product Readiness Checklist

- [ ] State the customer outcome in one sentence and name the primary user action.
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
