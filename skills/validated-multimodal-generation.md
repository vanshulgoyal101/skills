# Validated Multimodal Generation

## Trigger

Use this skill when an LLM plans copy and an image, video, audio, layout, or
other generated artifact must remain coherent, grounded and attributable.

## Invariant

A validated structured concept is the single source of truth for message,
visual direction, placement and claims. No expensive artifact generation starts
until the concept passes schema, grounding and policy checks; the finished asset
retains its model and execution receipt.

## Failure pattern

Copy generation and image prompting run independently. Better models produce
more polished but still generic visuals, unsupported claims enter the rationale,
static templates erase the model's visual decisions, or a failed render silently
becomes a raw source image presented as a finished ad.

## Recommended method

1. Ask the model for one bounded concept containing message, CTA, rationale,
   medium, detailed visual direction, text placement and source quotations.
2. Validate structured output with a schema. Give one repair attempt the actual
   validation findings and previous output; reject after that.
3. Check source quotations against supplied facts and scan all customer-visible
   fields plus rationale/direction for unsupported commercial terms. Treat this as
   a guardrail, not proof of semantic entailment.
4. Send the validated visual direction and placement to the image provider. Do
   not universally force photography, stock people, text-free layouts or a fixed
   composition that contradicts the concept.
5. Discover provider capabilities before sending model-specific image options;
   validate returned bytes, format, size and actual dimensions.
6. Persist concept, prompt, references, provider/model, latency, cost and
   fallback provenance with the asset. Distinguish unknown cost from zero.
7. Save successful variants independently and expose sibling failures. A render,
   download or storage failure must not return a raw image as a completed ad.
8. Test actual raster output across formats and text positions; mocks do not catch
   renderer crashes or clipping.

## Discriminating checks

### Comparing model changes

- Identify the model actually used from its saved receipt, then verify replacement
   availability and token rates in current official model and provider docs.
   Equal token rates do not imply equal per-image cost or token consumption.
- Replay exact saved image prompts and references against original source images,
   not finished ads whose overlays hide defects. Match quality and aspect ratio,
   verify decoded dimensions, and disclose any unknown historical settings.
- Separate image-call cost, concept/interview cost, credit-purchase fees, and
   total workflow latency. A key-wide usage delta can include concurrent requests.
- Bound paid evaluation by request count and explicit authorization; persist a
   one-use submission guard before sending. Do not retry ambiguous paid outcomes.
   Check receipt totals as well as potentially delayed account usage before the
   next request. A local stop threshold is not a provider-side per-request cap.
- Inspect prompt adherence, anatomy, equipment, forbidden details, and space for
   copy separately from aesthetics. Repeated scene instructions can explain a
   stock-like result even after a model upgrade. Note contradictory prompts.
- A few unblinded samples in one domain support a sample-level preference, not
   statistical significance, general superiority, or improved ad performance.

### Pipeline checks

- Invalid JSON, unsafe claims and invalid citations trigger no image call.
- The image request contains the exact validated visual direction and placement.
- A provider capability fixture rejects unsupported parameters and records actual
  decoded dimensions.
- A failed composite or storage upload produces no finished creative row.
- A partial batch retains completed siblings and reports failed siblings.
- Inspect at least one paid output and its receipt; do not infer quality from test
  counts or a successful deployment.

## Common traps

- Adding more adjectives to a static image prompt and calling it model improvement.
- Using a rationale as if it were a sourced business fact.
- Treating a data URL, Pollinations URL or raw photo as durable finished output.
- Assuming requested dimensions equal returned dimensions.
- Silently falling back from a paid image provider to a free provider.
- Calling a single sample proof of persuasive quality or product fidelity.

## Evidence

AdBrain's structured concept pipeline caught an uncited "free assessment" during
live evaluation, rejected it before image execution, and caught a Satori crash
that had previously been hidden by a raw-photo fallback. Twelve real PNG renders
across four formats and three text positions passed after the renderer fix.
