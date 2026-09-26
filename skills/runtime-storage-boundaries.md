# Runtime Storage Boundaries

## Trigger

Use this skill whenever JSON from `localStorage`, IndexedDB, a cache, URL state, or a cloud blob enters typed application code.

## Invariant

Runtime data is untrusted. Every loader returns a valid schema, never merely a non-throwing cast.

## Failure pattern

TypeScript interfaces disappear at runtime. A valid JSON value can still be an array, string, `null`, negative number, `NaN`-like input, wrong boolean, duplicate list, or object with dangerous prototype keys. Shallow spreads such as `{ ...DEFAULT, ...parsed }` preserve the wrong values and fail later in scoring/rendering.

## Recommended method

Create one small sanitizer boundary per domain or shared module:

- validate the root is a plain object;
- coerce only values with an explicit policy;
- clamp or reject negative/non-finite counters;
- require booleans to be booleans;
- bound strings and normalize dates/ids;
- accept only allow-listed map keys when the domain has fixed modes;
- reject `__proto__`, `constructor`, and `prototype` keys;
- deduplicate arrays when they represent sets;
- return fresh defaults on malformed roots;
- keep save functions defensive as well.

Do not silently turn corrupt cloud data into a valid-looking partial store unless the reconciliation policy explicitly says it is safe.

### Recovery identities and client caches

- A paid-operation recovery record is not a display preference. Corrupt or unavailable
	storage must not silently become a fresh idempotency key and another paid request.
	Persist identity before the request; use status/reconciliation for uncertain writes.
- Scope server-state caches by owner, business and filter. Clear stale scope on
	transitions/unmount and abort reads; do not use a global SSR singleton for tenants.
- Define retry, polling, focus/reconnect refetch and stale behavior deliberately.
	Library defaults are not automatically the product's data-fetching contract.
- Seeded cache data can be evicted before a view subscribes when garbage collection
	is immediate. Use a bounded handoff window and explicit cleanup; stale time and
	retention time answer different questions.
- Exercise initial data, search/status changes, account transitions, unmount and
	strict lifecycle behavior in a real browser when timing differs from DOM tests.
	Check exact requests/cancellation and rendered data, not only hook state.

See [async lifecycle guards](async-lifecycle-guards.md) for ownership-safe cleanup
and [payment reconciliation](payment-state-reconciliation.md) for financial recovery.

### Display preference precedence

- Distinguish an absent preference from explicit saved on/off choices. Document the default, allowed values, unsupported-device behavior, and accessibility overrides.
- Define effective behavior from that policy rather than scattered browser/core/memory heuristics. An unexplained heuristic can make an enabled preference appear broken.
- Keep stored user intent separate from effective capability. Reduced motion or an unsupported pointer may disable an effect without overwriting the saved choice.
- Handle unavailable storage without crashing the UI; use the documented default and keep in-session interaction working.
- Do not imply one setting controls every animation if some effects have independent policies.

## Discriminating checks

For every loader, test:

- missing key and corrupt JSON;
- primitive root and array root;
- wrong types for every field;
- negative, fractional, infinite, and oversized numbers;
- unknown map keys and prototype-looking keys;
- duplicate list values;
- a recovered object is writable by the game logic;
- rendered UI contains no `NaN`, `null`, or `undefined`.
- For preferences: absent key, explicit on/off, invalid value, unavailable storage, reload persistence, reduced motion, and pointer capability.
- Test default behavior in a fresh browser context. Other tests may explicitly opt out of effects, but default-preference tests must not inherit that opt-out.

## Common traps

- `as SomeStore` is not validation.
- Nullish coalescing does not reject strings, arrays, or negatives.
- `typeof value === 'object'` accepts arrays and `null`.
- Testing only “does not throw” misses poisoned state.
- Migrating a legacy field without pinning precedence and type policy.

## Preference evidence

The portfolio restored enabled ambient and supported-pointer cursor defaults, removed unexpected hardware/browser exclusions, retained explicit stored choices, and kept reduced-motion overrides. Browser checks exercised persistence and fresh-context defaults. This supplements schema validation rather than replacing it.
