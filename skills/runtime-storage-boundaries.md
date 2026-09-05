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

## Common traps

- `as SomeStore` is not validation.
- Nullish coalescing does not reject strings, arrays, or negatives.
- `typeof value === 'object'` accepts arrays and `null`.
- Testing only “does not throw” misses poisoned state.
- Migrating a legacy field without pinning precedence and type policy.
