# Next.js boundaries and data

Use this reference for Next.js App Router code, server/client boundaries, data
fetching, streaming, lazy loading, and bundle concerns. Inspect the installed
Next.js version and project configuration before relying on version-sensitive
behavior.

## Server and client module graphs

In App Router code, begin with a Server Component and add a client entry point only
when the subtree needs state, event handlers, Effects, browser APIs, client-only
Context, or other client hooks.

Treat `"use client"` as a module-graph boundary. Imports below that entry point can
enter the client bundle, so place the boundary around the smallest coherent
interactive region. Descendants already below a client entry point do not each need
the directive.

Client Components may still participate in server prerendering and hydrate in the
browser. Use an explicit no-SSR configuration only for a real browser-only
dependency or another verified incompatibility.

Values crossing from Server Components into Client Components must follow the
framework's serialization rules. Keep server-only objects and privileged resources
on the server, and use the framework's supported server-action mechanism rather
than passing arbitrary server functions as props.

## Fetch at the earliest suitable layer

Fetch in a Server Component when the data can be resolved on the server and does
not depend on browser-only state. This can reduce client code and avoid a
render-then-fetch round trip.

Client fetching remains appropriate for live updates, interaction-dependent data,
browser state, or intentional post-hydration requests.

Start independent work together:

```tsx
const userPromise = getUser();
const transactionsPromise = getTransactions();

const [user, transactions] = await Promise.all([
  userPromise,
  transactionsPromise,
]);
```

Keep real dependencies sequential. Do not force dependent work into `Promise.all`
or duplicate a request merely to appear parallel.

## Streaming and Suspense

Use a Suspense boundary when an independent slow section can stream after useful
surrounding UI. Choose a fallback that preserves layout and communicates the right
loading state. A boundary that does not improve loading behavior adds noise.

## Client JavaScript and lazy loading

Watch for large charting, editor, syntax-highlighting, markdown, visualization, or
SDK dependencies inside the client graph. Keep transformation-only dependencies on
the server when possible.

Lazy-load a large or rarely used Client Component when it is deferred behind an
interaction or not required for the initial experience. Dynamic imports have a
coordination cost, so apply them to meaningful chunks rather than every component.

Use supported package entry points and measure bundle output before claiming an
import change reduced bundle size. Account for framework-provided tree shaking and
package import optimizations.

When only one symbol is needed, prefer a supported narrow import such as
`import { formatUnits } from "viem"` over a namespace import such as
`import * as viem from "viem"`. Treat this as a candidate improvement, not a
universal rewrite: the framework, bundler, or library may already optimize both
forms, so verify the actual bundle effect.

## Review questions

- Does this subtree actually require client capabilities?
- Can the client boundary move downward without complicating the interface?
- Are values crossing the boundary serializable and intentionally exposed?
- Can data start on the server or earlier in the render path?
- Are independent requests concurrent and dependent requests ordered?
- Would streaming reveal useful UI earlier?
- Is a heavy client dependency necessary for the initial experience?
- Does the production build confirm the boundary and bundle assumptions?
