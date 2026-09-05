# Incident: Portfolio Anchor and Motion Drift

## Scope

This incident captures the recurring UI and layout issues identified while hardening the Vanshul portfolio: fixed-header anchor jumps, blank space above linked sections, and oversized magnetic motion.

## Confirmed failures

- Direct navigation to a hash target left the section partly hidden beneath the fixed navigation.
- The same condition appeared when the nav triggered an in-page scroll programmatically.
- A decorative magnetic effect displaced elements too aggressively and ignored the configured range.
- The visual polish layer was implemented without a shared contract for reduced-motion or bounded motion.

## Root cause

The issues were not isolated to one section or component. The common root cause was an absent shared layout contract:

- the header height was not centralized for scroll calculations;
- scroll offsets were applied inconsistently between native hash behavior and JS-triggered navigation;
- motion was driven by a fixed ratio instead of a bounded range-based model;
- accessibility and reduced-motion preferences were not treated as first-class constraints.

## Durable fixes

- Centralized scroll offset logic so all anchor jumps respect the real nav height.
- Added root-level scroll padding and section scroll margins to preserve the scroll contract.
- Reduced the magnetic follow ratio and clamped movement to the configured range.
- Disabled the decorative layer when reduced motion is active.
- Added regression checks for direct-hash navigation and the magnetic interaction model.

## Reusable skills

- [header-offset-scroll-guards](../skills/header-offset-scroll-guards.md)
- [visual-motion-constraints](../skills/visual-motion-constraints.md)
- [verification-gates](../skills/verification-gates.md)
- [evidence-first-development-plans](../skills/evidence-first-development-plans.md)
