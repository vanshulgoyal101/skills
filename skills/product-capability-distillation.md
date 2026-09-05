# Product Capability Distillation

## Trigger

Use this skill when extracting reusable product knowledge, planning a new feature from prior work, or maintaining a cross-product capability catalog.

## Invariant

A capability description names the user outcome, owning product surface, verified implementation boundary, strongest invariant, and reusable lesson without copying secrets, customer data, or proprietary source.

## Failure pattern

A product catalog becomes either marketing prose with no engineering value or a raw dump of implementation details. Future plans then miss existing capabilities, repeat old bugs, or import assumptions from the wrong product.

## Recommended method

1. Start from a stable README, feature document, shipped route, or verified live behavior.
2. State the user outcome and the product's actual boundary.
3. List only capabilities that are shipped and verified.
4. Attach the strongest reusable engineering lesson and route future work to the owning repository.
5. Separate product facts from portable skills, incidents, and speculative roadmap items.
6. Update the source product documentation first, then distill the cross-product catalog.

## Discriminating checks

- Does each capability point to a real source document or verified live route?
- Can a reader identify the owning repository and stack without reading copied source?
- Is the listed feature shipped rather than planned or inferred?
- Does the lesson describe an invariant that applies beyond the product name?
- Would a new development plan know which existing capability to reuse and which assumptions not to import?

## Common traps

- Calling roadmap items shipped.
- Copying implementation or private customer context into a shared catalog.
- Describing a product without its security, data, or deployment boundary.
- Treating a one-off fix as a reusable skill without evidence.
- Letting capability names drift from the source product's terminology.

## Evidence

The skills repository's `PRODUCT_CATALOG.md` and `SOURCES.md` establish a capability-level map across AdBrain, Arcade, ctx, MCP, Tools, portfolio, vbrain, Reader, and personal sites.
