---
name: react-code-quality-check
disable-model-invocation: true
description: Review and refactor React and Next.js code for simpler state, effects, component boundaries, server/client partitioning, and measured performance while preserving behavior. Use when cleaning up components, hooks, TypeScript, duplicated JSX, client boundaries, fetching, waterfalls, or premature memoization. Do not use for feature redesigns or intentional behavior changes.
---

# React Code Quality Check

Improve code through focused, behavior-preserving changes. Optimize for
correctness, clear intent, readability, maintainability, simplicity, and then
measured performance. A smaller diff is preferable when it achieves the same
result with less risk.

This file and its bundled references define the complete skill workflow. No other
skill or external guide is required to supply missing instructions.

## Establish the contract

Before changing code:

1. Read repository instructions and inspect the installed React and Next.js
   versions, router style, compiler settings, and available verification commands.
   Use existing domain vocabulary and relevant documented architecture decisions.
2. Identify the requested mode:
   - For a review, report concrete findings without editing.
   - For a refactor, make the smallest coherent changes and verify them.
3. Determine observable behavior, public interfaces, data flow, state, effects,
   server/client boundaries, and external dependencies in the affected area.
4. Preserve behavior and functionality. Surface any ambiguity that could change
   product behavior instead of resolving it through an implementation change.

Do not turn a cleanup into a rewrite, dependency migration, visual redesign, or
framework upgrade.

Do not refactor solely because code differs from personal style, is slightly
verbose, repeats two similar lines, could use newer syntax, or a fashionable
abstraction exists. Fewer lines alone are not an acceptance criterion.

## Simplify in priority order

Evaluate opportunities in this order:

1. Delete unreachable, unused, or redundant work.
2. Derive values from props and state instead of synchronizing duplicate state.
3. Move interaction logic into the event that causes it.
4. Reserve Effects for synchronization with external systems.
5. Remove refs and memoization that lack a concrete purpose.
6. Localize state and shrink broad context subscriptions.
7. Consolidate genuine conceptual duplication.
8. Clarify component, function, and module boundaries.
9. In Next.js App Router code, move appropriate work to the server and keep client
   entry points narrow.
10. Eliminate independent request waterfalls and unnecessary client JavaScript.
11. Optimize expensive work only when evidence or the access pattern supports it.

Before reviewing or changing code, read
[references/guardrails.md](references/guardrails.md). Then read the reference that
matches the affected code:

- For state, Effects, refs, rendering, Context, and memoization, read
  [references/react-state-and-effects.md](references/react-state-and-effects.md).
- For App Router boundaries, data fetching, streaming, and bundles, read
  [references/nextjs-boundaries-and-data.md](references/nextjs-boundaries-and-data.md).
- For async scheduling, request isolation, caching scope, or client payload size,
  also read
  [references/performance-and-concurrency.md](references/performance-and-concurrency.md).
- For duplication, abstractions, components, TypeScript, data structures, magic
  numbers, constant placement, comments, and performance, read
  [references/structure-and-performance.md](references/structure-and-performance.md).
- For responsive layout, skeletons, loading-state parity, or accessibility concerns
  in the affected components, read
  [references/ui-layout-and-loading.md](references/ui-layout-and-loading.md).

Read multiple references only when the requested work crosses those concerns.
When an API's behavior is uncertain or version-sensitive, verify it against the
installed implementation or targeted official documentation. Use those sources to
check technical facts; they do not extend this skill's workflow or task scope.

## Apply judgment

Prefer direct code when an abstraction would hide a small operation. Extract a
component, hook, function, or module when it represents a meaningful concept,
creates a useful boundary, or centralizes behavior that should change together.
Conceptual similarity matters more than line count or occurrence count.

Do not add state, Effects, refs, memoization, Context, dynamic imports, Suspense,
or `"use client"` by habit. Each should solve a specific requirement visible in
the code or task.

Keep render logic pure. Keep side effects explicit. Make names carry intent and
use comments for non-obvious reasons, constraints, or platform behavior.

## Work incrementally

For refactors:

1. Establish a focused feedback loop before editing when practical.
2. Change one coherent concern at a time.
3. Re-read the diff after each concern and remove incidental churn.
4. Run the cheapest relevant static check or focused test.
5. Broaden verification only after the focused loop passes.

Avoid unrelated formatting and import churn. Preserve public APIs and integration
contracts.

## Verify

Test observable behavior through public interfaces using the existing test tools.
Choose expected results from requirements, worked examples, or established behavior,
not by repeating the implementation in the assertion. Prefer checks that survive
internal restructuring; avoid exposing private helpers solely for tests. Mock
external boundaries when needed rather than encoding every internal call. When
coverage is missing and the change is risky, capture relevant existing behavior
before refactoring, including errors and edge cases. Keep this effort proportional
to the change.

Use the repository's own commands. In proportion to the change, run:

1. Type checking.
2. Linting.
3. Focused tests for affected behavior.
4. A production build when server/client boundaries, routing, bundling, or build
   transforms changed.
5. Profiling or bundle analysis when performance is the reason for the work.

Do not claim a performance improvement from fewer lines, memoization, or a moved
boundary without evidence that supports the claim.

## Final gate

Within the affected scope, confirm:

- Every remaining state value is independently necessary.
- Every Effect synchronizes with an external system or has a documented reason.
- Every ref has a DOM, imperative, or persistent mutable purpose.
- Every memoization boundary has a concrete benefit.
- Component and module boundaries express meaningful responsibilities.
- Non-obvious literals and comments were reviewed; extracted constants have clear
  meaning and live at the narrowest useful scope.
- Client boundaries exist only where client capabilities are required.
- Independent operations start together while real dependencies remain ordered.
- The result is easier to understand and preserves the intended behavior.
- Relevant verification passed, with any gaps or risks stated explicitly.

For a review, assess both requirements (missing behavior, regressions, scope creep)
and code quality (repository conventions, clarity, maintainability). Use the user's
request or an existing spec as the requirements baseline; state when one is absent.
Lead with prioritized findings, cite the affected file and line, and explain the
consequence. Distinguish demonstrated contract violations from design suggestions;
do not invent findings to fill either category. For a refactor, summarize the
accepted changes, verification results, and remaining risks.
