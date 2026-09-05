# Structure and performance

Use this reference for duplication, abstraction, components, functions, TypeScript,
collections, magic numbers, constant placement, comments, and performance work.

## Duplication and abstraction

Classify repetition before removing it. Repeated JSX with the same structure and
different data is often clearer as data-driven rendering. Similar-looking code with
different behavior may be better left explicit.

Do not share a collection solely because unrelated UI structures currently have
the same count or shape. Give independently evolving concepts their own meaningful
names and keep their definitions local unless they share a real contract.

Consider an abstraction when the behavior is genuinely shared, its name expresses
a useful concept, its interface is simpler than the implementation, and future
changes should happen together. Occurrence count is a signal, not a rule.

A useful nonbinding heuristic is: write the first occurrence directly, observe the
second, and consider abstraction at the third. Override it when conceptual
similarity or likely divergence makes the answer clear earlier.

Prefer deep modules with a small interface and meaningful behavior. Avoid wrappers,
hooks, render helpers, and configuration objects that merely rename a few obvious
lines or expose internal implementation choices.

## Components and functions

Create a component for a meaningful UI concept, reusable behavior, an independently
understandable section, a useful server/client boundary, or complex UI that benefits
from isolation. Line count alone is not a component boundary.

Keep functions focused on one responsibility, but avoid fragmenting a readable
sequence into tiny helpers. Prefer explicit parameters for a few simple values and
an object when several values form one conceptual input.

Keep side effects out of render logic, getters, calculation helpers, and ambiguous
utilities. Place utilities near their domain instead of accumulating unrelated code
in a generic file.

## Names, cohesion, and dependency direction

Use the repository's domain terms consistently across names, types, and tests.
Prefer names that identify the operation or value, including units when relevant.
Avoid misleading collection names and distinctions such as `data` versus `info`
that express no domain difference. Keep renames scoped to the requested work and
preserve public names and serialized field names that callers depend on.

Group code that changes for the same reason. Where domain logic is already separated
from UI, transport, or persistence, preserve that dependency direction; avoid making
a reusable calculation import framework or database details. Inspect for dependency
cycles when moving code. Introduce a small dependency interface only when actual
variation, coupling, or testing needs justify it. Do not impose new architecture
layers, class hierarchies, or interfaces on simple working code.

An interface includes accepted inputs, outputs, invariants, ordering, and failure
modes, not just a TypeScript signature. Keep the knowledge required of callers
small and place implementation detail behind that interface. Judge an extraction
by whether it concentrates complexity and supports testing through the interface.

## Preserve error contracts

Keep existing distinctions between absence, invalid input, failure, and success.
Preserve thrown versus returned errors, status codes, error shapes, and messages
that callers or users observe. Do not replace nullable results with exceptions,
swallow failures into empty defaults, or change retries merely to simplify code.

When extracting async code, preserve where rejection is handled, how errors reach
the caller, and which cleanup runs on failure or cancellation. Broad catches must
not intercept framework control flow unintentionally. Report a discovered defect
separately when correcting it would change the established contract.

## TypeScript and collections

Use types that communicate domain intent. Correct types at the source before adding
assertions, non-null operators, or elaborate generics. Narrow uncertain values with
control flow and model valid states so inconsistent combinations are hard to create.

Choose the collection operation that states the intent:

- `some` for existence;
- `every` for a universal condition;
- `find` for one match;
- `filter` for multiple matches;
- `map` for transformation; and
- `reduce` for genuine aggregation.

Use `Map` for repeated keyed lookup, `Set` for membership, arrays for ordered
collections, and objects for structured records. Improve an access pattern when the
data size or hot path justifies it; retain the clearer implementation for trivial
inputs.

Preserve lookup semantics when introducing an index. For example, `find` selects
the first match while a Map constructed from duplicate keys retains the last
value. Verify key uniqueness or retain the original duplicate handling, equality,
and ordering behavior.

For large data on a hot path, avoid multiple collection passes when one readable
pass materially improves cost. Do not combine passes as a micro-optimization when
it obscures intent.

## Magic numbers and repeated literals

### Numeric input contracts

For count, limit, index, or size inputs, compare the declared type with actual
callers and runtime behavior. Check relevant boundaries: omitted and zero values,
negative or fractional numbers, non-finite values, and inputs beyond a fixed
collection's capacity. A `number` type alone does not define the supported range.
Distinguish a demonstrated caller failure from a latent API ambiguity. Document an
established contract, but do not silently clamp, reject, round, expand rendering,
or narrow public types during cleanup; those decisions need explicit scope.

### Literal scan

Scan the affected code for unexplained numeric values and repeated strings,
especially durations, retry counts, limits, thresholds, conversion factors, storage
keys, and protocol values. Use read-only searches to find candidates, then inspect
their meaning and callers; a literal match alone is not a finding.

Name a value when its domain meaning, unit, or reason would otherwise be unclear,
even if it appears only once. For example, an existing search delay of `300` can
become `SEARCH_DEBOUNCE_MS = 300`. Preserve the exact value, type, and units. Follow
the repository's naming convention and use names that explain purpose rather than
restating the value, such as `THREE_HUNDRED`.

Leave self-explanatory literals inline when a name adds no meaning, such as an empty
string, an initial count of zero, or a simple increment. Context decides: a zero
that encodes a domain status may still deserve a name. Repeated equal values are
not necessarily the same concept; keep unrelated policies separate even when both
happen to use `300` today.

## Where constants belong

Search for an existing domain constant, configuration value, or design token before
introducing another source of truth. Reuse it only when its meaning, units, type,
and change ownership match.

- Keep a single-use constant near its use, inside the function when appropriate.
- Use a file-level constant when several functions in that file share one meaning.
- Use a domain-local `constants.ts`, or the repository's existing equivalent, when
  several files share a stable value that should change together. Export only what
  those callers need.
- Use a repository-wide constants file only for values with repository-wide
  ownership. Avoid collecting unrelated feature settings in a root `constants.ts`.

Extraction must preserve import boundaries and evaluation semantics. Do not move
server-only values into a module imported by clients or hoist request-, prop-, or
environment-dependent calculations into shared initialization. Moving arrays or
objects can change identity and mutation sharing; verify those semantics before
hoisting. A `const` declaration does not make an object immutable.

## Comment scan

Review nearby comments, JSDoc, and commented-out code against the current behavior.
Correct stale or misleading explanations when the intended meaning is established.
Remove redundant narration or obsolete commented-out code only when it adds no
useful context; preserve examples, rationale, and unresolved follow-up notes that
still matter. Report uncertainty instead of inventing intent or marking work done.

Keep explanations of constraints, units, compatibility workarounds, non-obvious
algorithms, and public contracts. Naming a constant can explain what a value means;
a short comment can still explain why that value was chosen. Do not invent a
business justification or source.

Treat license notices, generated-file markers, lint/type-check directives, coverage
pragmas, and bundler annotations separately from prose. They may carry legal or
tooling meaning; do not remove or rewrite them as routine comment cleanup. Preserve
the repository's formatting and documentation conventions.

For review findings, identify the location, why the literal or comment is unclear,
and the proposed name and scope (or comment correction). Leave clear code unchanged
and do not create a constants file solely to satisfy the scan.

## Performance order

Optimize in this order:

1. Remove unnecessary work and updates.
2. Move work to the appropriate environment or earlier stage.
3. Start independent operations together.
4. Reduce unnecessary client JavaScript.
5. Improve expensive algorithms or access patterns.
6. Add memoization when measurement supports it.

For large lists, use stable domain keys, avoid repeated expensive lookup, keep rows
simple, and consider virtualization only when the rendered size warrants it.

Fewer lines do not prove faster execution. Component extraction, a chained array
operation, or memoization can improve one property while worsening another. Profile
the relevant interaction and compare representative inputs.

## Clarity checks

Look for rigidity, fragility, immobility, viscosity—the easy path encourages the
wrong change—needless complexity, conceptual repetition, and opacity. Address the
concrete smell rather than applying a pattern catalog mechanically.

Prefer straightforward control flow over nested ternaries, type tricks, and dense
functional composition.

Before extracting or optimizing, ask:

- Is the concept stable enough to name?
- Is the new interface smaller than what it hides?
- Will likely changes happen together?
- Is the operation expensive at representative scale?
- Does the change reduce cognitive load without hiding behavior?
