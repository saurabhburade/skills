---
name: orchestrate-parallel-work
description: "Orchestrate independent workstreams across multiple agent tasks, require the fastest available execution mode, route each slice to the least costly capable model, and recover safely from unavailable or insufficient profiles. Use when a substantial request can be split into concurrent, non-overlapping work or the user asks for parallel agent execution; do not use for tightly coupled or small sequential work."
---

# Orchestrate Parallel Work

Coordinate parallel execution while keeping the current agent responsible for the
plan, shared interfaces, review, integration, and final verification. Adapt to the
host's native task, subagent, worktree, model, and speed controls; do not assume a
particular provider or hard-code model names.

## Decide whether to parallelize

Parallelize only when at least two bounded slices can make useful progress at the
same time with disjoint writable ownership or as independent read-only
investigations. Prefer local sequential work when slices share a changing seam,
depend on one another, are too small to repay coordination cost, or would duplicate
large context.

Treat an explicit request to parallelize or invoke this skill as authorization to
use the host's available agent mechanism, subject to higher-priority host rules.
When this skill is selected automatically, explain the proposed split and follow
the host's confirmation policy before creating user-visible tasks or other durable
resources.

Use two to four workers by default. Never exceed the host's concurrency limit, and
do not create more workers than there are substantial independent slices.

## Discover the runtime before routing

Inspect the current environment rather than assuming Codex, Claude, Cursor, or any
specific version:

1. Read repository instructions and inspect current changes.
2. Identify the native delegation mechanism and whether workers share a directory,
   use isolated worktrees, or return patches only.
3. Discover models, reasoning levels, speed tiers, prices, context limits, and
   concurrency controls from the tool schema or host-provided metadata when they
   are exposed.
4. Preserve an explicit user choice of provider, model, reasoning level, speed,
   budget, visibility, or execution environment.
5. If capabilities cannot be discovered reliably, inherit the current/default
   model and settings. Never invent a model identifier, relative capability, price,
   or unsupported control.

Before selecting worker profiles, read
[references/model-routing.md](references/model-routing.md).

## Require Fast execution

Every worker must use the host's fastest available execution mode. A native Fast,
priority, accelerated, or equivalent service tier is distinct from choosing a
smaller model or lowering reasoning effort.

Before dispatching any worker:

1. Enable the native Fast-equivalent tier explicitly on the task or request when
   the host exposes that control.
2. If Fast can be configured only at the project, session, or global level, verify
   that new workers inherit it.
3. Choose only models compatible with the required Fast tier.
4. Verify the effective tier from returned task or response metadata when the host
   exposes it.

If the host supports a distinct Fast tier but it cannot be enabled or its
inheritance cannot be verified, stop parallel dispatch and explain the limitation.
If the host has no concept of execution tiers, use the fastest compatible model or
profile available and report it as "fastest available," not as verified native
Fast mode. Never silently fall back from an available Fast tier to Standard mode.

## Establish the integration contract

Record before dispatch:

- target outcome and acceptance criteria;
- repository, working state, and user-owned edits;
- file or module ownership for every slice;
- shared interfaces that the parent must settle first;
- focused verification for each slice and final integrated verification;
- commit policy, defaulting to no commits unless the user requests them;
- parent-owned operations such as dependency changes, schema generation,
  destructive commands, deployment, final integration, and the expensive test
  suite.

Do not give two workers overlapping writable ownership. A worker may inspect shared
context read-only, but it must stop and report before expanding its write scope.

## Route each slice independently

Within the required Fast execution mode, select the least expensive available
profile with a high probability of completing that slice correctly on the first
pass. Optimize expected total work, not nominal per-token price: include context
size, likely retries, review burden, latency, and coordination overhead.

Use relative capability roles rather than provider names:

- **Lower/faster** for inventory, search, extraction, mechanical edits, focused
  tests, and tightly specified low-risk implementation.
- **Sibling/specialist** for ordinary implementation where coding or domain fit
  matters more than extra general reasoning.
- **Current/default** when model ordering is unknown or changing profiles would not
  clearly save time or tokens.
- **Higher/deeper** for ambiguous architecture, shared-interface design, security
  or concurrency reasoning, difficult diagnosis, and final review of risky work.

Keep reasoning effort at the minimum sufficient level. Do not use a stronger model
for every worker merely because it is available, and do not use a weak model when a
predictable retry plus re-review would cost more. Escalate only the affected slice
when evidence shows the initial profile is insufficient.

## Recover without looping

Preflight every exact provider, model, reasoning, and execution-tier combination
against a fresh inventory immediately before dispatch. Availability belongs to the
current product surface and authentication boundary; do not treat availability in
another surface or API as proof that the current worker can use it.

When a dispatch fails, a worker cannot start, or a completed result repeatedly
misses acceptance criteria, read
[references/dispatch-recovery.md](references/dispatch-recovery.md). Classify the
failure before changing models. Recover only the affected slice and preserve its
ownership, acceptance criteria, user constraints, and Fast requirement.

Allow at most one automatic redispatch per slice. Never automatically replace an
exact model explicitly pinned by the user unless the user also authorized a
successor or fallback. Do not switch models for authentication, authorization,
billing, policy, safety, invalid-input, or unrelated tool failures.

## Partition and dispatch

Prefer vertical or deep-module slices that produce independently reviewable
results, such as one module plus focused tests, a read-only diagnosis, a UI region,
or an independent correctness review. Keep planning of shared seams in the parent.

Each worker prompt must include:

```text
Objective:
Owned files/modules:
Read-only context:
Do not touch:
Acceptance criteria:
Focused verification:
Commit policy:
Handoff: changed files, decisions, test output, unresolved risks.
```

Add only the context needed for the slice. Point to repository files instead of
copying the entire conversation or large source blocks. Tell every worker to
preserve user-owned edits and not revert, stage, commit, or overwrite unrelated
work.

Use isolated worktrees when the host supports them and isolation materially reduces
collision risk. A shared directory is acceptable only with disjoint ownership and
an explicit rule that the parent owns shared files. If the host has no delegation
mechanism, say so; do not simulate workers or claim parallel execution occurred.

## Review while work runs

The parent remains active as reviewer and integrator:

1. Inspect shared seams and existing behavior while workers run.
2. Prefer event-based waits or compact status checks over repeated polling.
3. Review a result as soon as it completes; inspect its diff and evidence rather
   than trusting the summary.
4. Send focused corrections immediately when a worker diverges.
5. Give one focused correction when a completed worker misses an acceptance
   criterion. If the same problem persists, make at most one evidence-based
   redispatch under the recovery policy.

Do not make the parent another overlapping implementation worker.

## Integrate and verify

Apply only accepted changes to the target worktree. Resolve conflicts semantically;
never reset or overwrite user work. Keep changes unstaged unless requested.

Require cheap focused checks during each slice. After integration, run cross-module
checks and the expensive suite once from the target tree. The parent must inspect
the final diff and obtain fresh verification evidence before claiming completion.

Report the integrated outcome, the slices, exact profiles, and effective execution
tier used, important decisions, verification commands and results, remaining
risks, and commit/stage status. Do not commit, push, deploy, or open a pull request
without separate authorization.
