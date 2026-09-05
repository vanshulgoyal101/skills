# New Feature Checklist

- [ ] Define the user-visible contract and the owning state abstraction.
- [ ] Start from a concrete anchor, write one falsifiable hypothesis, and choose the cheapest discriminating check.
- [ ] Identify local, cloud, database, generated, and accessibility sources of truth.
- [ ] Implement the smallest root change.
- [ ] Add pure/model tests for rules and edge cases.
- [ ] Add DOM/input tests for the real interaction path.
- [ ] Add race/restart/corrupt-storage tests where applicable.
- [ ] Add parity/invariant tests for duplicated or generated surfaces.
- [ ] Build every consumer of changed shared code.
- [ ] Update generated output and cache versions.
- [ ] Check duplicated registries, list delimiters, aggregate restore rules, provider fallbacks, and SSRF/network boundaries relevant to the feature.
- [ ] Check environment/configuration parity, resource ownership and cleanup, tenant/security boundaries, and product capability reuse.
- [ ] Verify mobile, keyboard, focus, modal, offline, and error states.
- [ ] Update the skill catalog and incident record when the lesson is reusable.
