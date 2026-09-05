# React state and Effects

Use this reference when reviewing component state, Effects, refs, rendering,
Context, or memoization.

## State represents change

Store information that changes because of interaction or an external event. Derive
values that can be calculated from existing props or state during rendering.

Prefer:

```tsx
const fullName = `${firstName} ${lastName}`;
const filteredItems = items.filter(matchesQuery);
const hasItems = items.length > 0;
```

Avoid storing those values and synchronizing them from an Effect. Duplicate sources
of truth add renders and allow values to drift apart.

Keep unrelated state separate. Combine values when they change together, form one
state machine, or must remain internally consistent. Keep transient state local and
lift it only when components genuinely coordinate through it.

Use a functional update such as `setCount(previous => previous + 1)` when the next
value must be based on pending state. Keep the updater pure. This can remove an
unnecessary state capture from a callback; retain dependencies on other captured
values. Preserve intentional snapshot semantics: changing queued updates can change
the result, so do not silently fix a batching or stale-state bug during cleanup.

For expensive initial state, use a pure lazy initializer such as
`useState(() => buildInitialRows())`. It initializes state for a mount; it does not
recompute state when props change. Preserve reset behavior and account for
development Strict Mode invoking initializers and updaters more than once. Trivial
initial values need no wrapper.

## Effects synchronize external systems

Use an Effect for synchronization with something outside React, such as a
subscription, WebSocket, timer, browser API, DOM API, third-party widget, or
imperative library.

Prefer calculation during render for data transformation:

```tsx
const total = items.reduce((sum, item) => sum + item.amount, 0);
```

Prefer an event handler when an interaction causes the work:

```tsx
function handleSubmit() {
  submit();
}
```

Avoid state-to-Effect chains that calculate state B from state A and state C from
state B. Derive the values or perform the interaction atomically when possible.

When an Effect is necessary, verify dependencies, cleanup, race behavior, and
whether development Strict Mode exposes a missing cleanup or non-idempotent setup.

Separate Effects when they synchronize independent systems with different
dependencies. Keep each setup paired with its cleanup; preserve any required
ordering between systems. Read only the reactive values that synchronization needs:
for example, depend on `roomId` when only the ID is used, and construct connection
options inside the Effect if appropriate. Include every reactive value actually
read. Never omit a dependency or suppress the linter merely to reduce reruns.

## Refs are imperative or non-rendering storage

Use a ref for DOM access, an imperative API, a mutable value that must persist
without rendering, or integration with an imperative library. A ref should not hide
state that the UI depends on or compensate for unclear state ownership.

## Memoization is an optimization

Use `useMemo`, `useCallback`, or `memo` only for a concrete reason:

- a measured expensive calculation;
- stable identity required by a memoized child or Hook dependency;
- an expensive component that demonstrably re-renders unnecessarily; or
- a downstream API that requires stable identity.

Fix state flow and component ownership before adding memoization. Cheap rendering
and ordinary derived values generally need no cache. Ensure correctness never
depends on a memoized value remaining cached.

## Rendering and Context

Keep Client Component render functions and shared render calculations pure: do not
start ad hoc network requests, subscriptions, or external mutations there. Server
Components may perform supported server-side data reads as described in
[nextjs-boundaries-and-data.md](nextjs-boundaries-and-data.md); this does not permit
mutations or shared request state during rendering. Define components at module
scope unless a dynamic component type is intentional.

Use Context for genuinely shared concerns such as theme, locale, session, or broad
configuration. Prefer props or local state when only a narrow subtree needs a value,
especially when it changes frequently.

## Browser subscriptions

For global listeners, check whether duplicate subscriptions or unstable dependencies
cause repeated registration. Preserve handler freshness and pair setup with cleanup.
Share a subscription only when consumers share its ownership and lifecycle; do not
introduce a provider or dependency solely to reduce listener count.

Use passive wheel or touch listeners only when they never need to cancel the default
action, including through helpers they call. The basic `scroll` event is not
cancelable, so adding `passive: true` to it does not remove a scroll-blocking delay.
Measure expensive handler work separately and preserve interaction behavior.

## Review questions

- Can any state be derived?
- Can an Effect become render-time calculation or event logic?
- Does every Effect have an external synchronization target and cleanup plan?
- Does every ref serve an imperative or non-rendering purpose?
- Is state owned by the smallest useful subtree?
- Does memoization solve an observed cost rather than a hypothetical one?

## Optional API documentation

Use these only to verify a specific API detail when needed. The applicable guidance
is included above.

- [React: useState](https://react.dev/reference/react/useState)
- [React: removing Effect dependencies](https://react.dev/learn/removing-effect-dependencies)
- [MDN: event listeners and passive behavior](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
