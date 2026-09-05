# Refactor guardrails

Apply these constraints to every review or refactor performed with this skill.

## Preserve behavior and functionality

Treat the existing observable behavior as the contract. Preserve user-visible
output, interactions, accessibility behavior, public APIs, routes, authorization,
data freshness, required side-effect ordering, error behavior, and integration
contracts. Internal structure and scheduling may change only when those observable
contracts remain equivalent. Optimizations must preserve loading, retry,
cancellation, and failure semantics as well as the successful result.

Do not add, remove, or reinterpret functionality. Do not silently fix a suspected
bug, change a product decision, or alter an edge case as part of cleanup. Report the
opportunity separately. If the requested result requires a behavior change, explain
the conflict and keep that work outside this refactor.

Do not weaken, delete, or rewrite a test merely to make changed behavior pass. Test
updates are appropriate only when they preserve the same contract while improving
coverage or adapting to a behavior-preserving structural change.

## Do not change packages without an explicit request

Do not install, add, remove, replace, or upgrade a package unless the user explicitly
requests that dependency action. Do not change the package manager, lockfile,
framework version, runtime version, or package-manager configuration as an incidental
part of a refactor.

Use the repository's existing dependencies and commands. If a package change seems
necessary, report why and stop that part of the work rather than performing the
installation or dependency edit.

## Keep the scope narrow

Avoid rewrites, framework migrations, visual redesigns, unrelated formatting, broad
renames, and speculative cleanup. Make the smallest coherent change that improves
the requested code while honoring the existing contract.

Inspect the final diff for incidental changes. If the task cannot be completed
within these guardrails, state the specific conflict and leave the restricted change
undone.
