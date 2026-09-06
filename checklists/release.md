# Release Checklist

- [ ] Worktree and staged paths reviewed.
- [ ] Focused tests pass.
- [ ] Full test suite result recorded with exact pass/skip/failure counts; any reruns and unresolved intermittency disclosed.
- [ ] All relevant builds pass.
- [ ] Generated assets promoted from a fresh build.
- [ ] Cache-busted assets have updated version and digest pins.
- [ ] JSON-LD, canonical routes, sitemap and robots are valid.
- [ ] Browser smoke test passes at desktop and narrow mobile widths.
- [ ] Relevant screenshots inspected; viewport fit, image framing, and canvas pixels checked where DOM presence is insufficient.
- [ ] Deep-link reloads and actual entry/return journeys verified after intro/lazy loading when relevant.
- [ ] Keyboard/focus and icon-only accessible names verified.
- [ ] Database invariants and read-only integrity audit pass when relevant.
- [ ] Docs/catalog updated.
- [ ] Remote branch and local tree are clean after push.
- [ ] Actual deployment SHA identified, including concurrent descendants; workflow conclusion and live invariant verified.
