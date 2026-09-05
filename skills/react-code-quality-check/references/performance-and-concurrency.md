# Performance and concurrency

Use for async scheduling, server request isolation, caching, and Server-to-Client
payload investigations. Apply [guardrails.md](guardrails.md) first. Inspect installed
framework versions and measure the relevant request or payload before claiming an
improvement. Use existing tools and dependencies.

## Schedule work with its dependencies and failures

Check cheap conditions before remote work when skipping that work preserves its
side effects and error contract. Start independent operations when they are needed;
await their results at the latest point that preserves observable ordering. In a
partial dependency graph, start each branch when its own prerequisites resolve,
without waiting for unrelated branches.

Authentication, authorization, transactions, and data dependencies are prerequisites,
even when operations look syntactically independent. Do not begin protected work
before its checks or turn sequential mutations into parallel writes. Preserve
existing concurrency limits and downstream capacity constraints for fan-out work.

Attach rejection handling as work starts. Starting multiple promises and awaiting
them one by one can leave an early rejection unhandled. Use a combined promise chain
or existing structured concurrency mechanism that observes every started operation.
`Promise.all` observes its inputs and rejects on a failure; it does not cancel other
operations. `Promise.allSettled` changes failure handling, so it is not a drop-in
replacement. Preserve cancellation, cleanup, retries, and which failures callers see.

## Isolate requests and choose cache scope explicitly

Keep user, tenant, token, and other request-specific state in request-local values
or pass it explicitly. Do not introduce mutable module variables to carry that
state between reads. Concurrent requests may share a server process. Report an
existing isolation defect separately if fixing it changes behavior.

Distinguish deduplication during one server render from reuse across requests.
Check what the framework already deduplicates before adding a cache. React `cache`
is for Server Components; it is not a general route-handler cache. Reuse the same
memoized function and understand argument identity, request lifetime, and cached
errors. Use it only where reusing a result preserves freshness and failure behavior.

Cross-request caches need an established design for keys, authorization isolation,
invalidation, lifetime, and memory bounds. Never assume authenticated data is safe
under a resource ID alone. Do not add a shared cache, caching package, or new
freshness policy as incidental cleanup; explain the separate change required.

Only hoist initialization that is independent of requests and safe for reuse. Check
initialization timing and failure behavior; a module may load at build or startup
time. Keep request-specific values and mutable request data out of that work.

## Minimize client payloads without changing the contract

Inspect what each Client Component reads and pass only the data it needs. Remove
unused fields from a private boundary only after checking consumers; retain public
prop contracts and keep privileged data on the server. Compare actual serialized
payloads rather than estimating from prop count alone.

RSC serialization can deduplicate shared object references. Passing one object to
multiple consumers is not automatically repeated serialization; cloning or creating
several derived arrays may increase the payload. Compare sending a minimal derived
shape with sharing an existing representation. Keep expensive or privileged
transformations server-side, and avoid moving work to the browser solely to reduce
one payload metric. Verify output, loading states, and hydration remain equivalent.

## Optional API documentation

Use these only to verify a specific API detail when needed. The applicable guidance
is included above.

- [React: cache](https://react.dev/reference/react/cache)
- [MDN: async functions and concurrency](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
