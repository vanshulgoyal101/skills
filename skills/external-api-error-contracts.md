# External API Error Contracts

## Trigger

Use this skill when a product integrates with a provider API whose errors are
localized, unstable, overly technical, or capable of changing business behavior
such as destination, campaign type, billing or permissions.

## Invariant

Provider failures are translated into stable customer-facing guidance while
preserving safe status and diagnostic context for operators. The application
never silently changes a requested business outcome to make the provider call
succeed.

## Failure pattern

Raw Graph API text reaches the UI, often in another language or with internal
field names. A human CTA is sent as a provider enum that is invalid for the
selected objective. A missing capability causes the code to silently switch from
WhatsApp/call to an instant form, creating a campaign different from the user's
request.

## Recommended method

1. Keep provider-specific errors in a typed error class with safe status and
   internal category fields.
2. Map known categories such as permissions, CTA validation, audience, budget,
   image and expired connection to stable guidance. Use a generic fallback for
   unknown errors; never expose raw tokens, URLs or full provider responses.
3. Normalize human-facing labels separately from provider enums. Treat creative
   presentation copy as untrusted input to the provider contract.
4. Validate stale selections, such as lead forms, against the provider immediately
   before mutation.
5. Preserve the requested destination. If a capability is unavailable, stop and
   explain how to fix it instead of silently substituting another destination.
6. Validate external image URLs and schemes before fetching or uploading them.
7. Test localized/opaque errors, malformed inputs, stale resources and unsupported
   capabilities at the adapter and route boundaries.

## Discriminating checks

- A localized CTA error produces stable CTA guidance, not the original text.
- An expired token produces reconnect guidance.
- A stale lead form is rejected before campaign creation.
- A WhatsApp/call capability failure returns an actionable error and does not
  create an instant-form campaign.
- A malformed or non-HTTP image URL is rejected before `fetch`.
- Unknown provider errors use the safe fallback message.

## Common traps

- Returning `(err as Error).message` directly from every route.
- Reusing a creative CTA string as a Graph API enum without an objective check.
- Catching a capability error and mutating the user's requested destination.
- Validating a selected provider resource only when it was initially loaded.
- Logging or returning access tokens and complete provider payloads.

## Evidence

AdBrain's Meta hardening added `friendlyMetaError`, safe lead-form freshness
validation, strict destination preservation, CTA normalization and image URL
validation after provider errors reached users as localized/internal failures.
