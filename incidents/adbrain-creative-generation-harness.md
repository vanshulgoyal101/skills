# AdBrain Creative Generation Harness

## Trigger

AdBrain needed stronger paid text/image models to produce better ads, but the
existing pipeline generated copy and image prompts independently and used static
layouts, silent fallbacks and best-effort persistence.

## Impact

A stronger model could still produce a generic-looking ad. Unsupported claims
could enter output, a failed composite could appear as a raw photo, and the
operator could not reliably tell which provider/model or image dimensions were
used. A live sample also revealed an uncited "free assessment" claim.

## Evidence

- The old pipeline returned only headline/body/CTA from the text model.
- The image prompt was deterministic and independent of the copy decision.
- Real raster tests exposed a Satori crash on explicitly undefined positioning
  values that mocks did not catch.
- OpenRouter endpoint discovery showed model capability differences and paid
  image latency around 93 seconds in one sample.
- The production receipt recorded OpenRouter text and `openai/gpt-image-2` image
  usage after configuration was corrected.

## Root cause

The orchestration boundary treated providers as interchangeable string sources
rather than a validated creative workflow with capability, grounding, persistence
and provenance contracts.

## Fix

- Structured concept containing copy, visual medium, direction, placement and
  source quotations.
- Zod validation plus one concrete repair attempt before image spend.
- Capability-aware image requests and bounded raster decoding.
- Explicit provider/fallback receipts, partial batch preservation and strict
  persistence failures.
- Deterministic final typography with model-selected composition direction.
- Separate budget routing for low-risk LLM tasks.
- Production database receipt migration and Vercel Linux Sharp tracing.

## Regression tests

Concept contract, malformed output, unsupported claim, provider capability,
invalid raster, fallback, persistence, partial batch, receipt UI, real PNG matrix,
route contracts and paid evaluation harness.

## Residual risk

A source quotation check is not semantic entailment. One live sample is not proof
of CTR, product fidelity or superiority. Long image calls can outlive a client
request even when the server persists the result; durable job/polling UX remains
future work. Provider billing and external capability changes require monitoring.
