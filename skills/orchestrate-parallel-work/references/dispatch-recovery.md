# Dispatch and worker recovery

Use this reference only after a dispatch or worker failure. The goal is to recover
from a stale or insufficient profile without hiding the real error, violating a
user constraint, dropping Fast mode, or creating an unbounded retry loop.

## Identify the failed profile precisely

Record the attempted provider, exact model identifier, reasoning level, execution
tier, product surface, authentication method, slice, and machine-readable error.
The same model can be available through one API or identity and retired, disabled,
or restricted through another.

Prefer structured error codes and task status over interpreting prose. When the
cause is ambiguous, inspect current host metadata once. Do not label an error as a
retirement merely because a model is old or absent from a different catalog.

## Classify before retrying

| Failure class | Examples | Recovery |
| --- | --- | --- |
| Model unavailable | Retired, unknown model, disabled for this surface, region, workspace, or identity | Refresh the current inventory, exclude the failed profile for this run, and choose an eligible replacement |
| Profile incompatible | Model lacks required tool, modality, context, reasoning level, or Fast support | Choose a profile that satisfies the missing capability and all existing constraints |
| Transient execution | Capacity, rate limit, timeout, transport interruption, worker startup failure | Follow a short host-provided retry delay when practical, then retry the same profile once; this consumes the slice's one redispatch |
| Result insufficient | Worker starts but cannot meet an acceptance criterion | Give one focused correction; if the same issue remains, redispatch once to a host-described stronger or better-suited profile |
| Context exhaustion | Input or output limit prevents completion | Reduce irrelevant context or split the owned slice; choose a larger-context profile only when the host verifies one |
| Non-model blocker | Authentication, authorization, billing, policy, safety, invalid input, missing user authority, or unrelated tool failure | Fix the actual blocker when in scope or stop and report it; do not switch models |

Never retry from a generic `failed` status alone. Obtain the most specific available
cause or report that recovery could not be chosen safely.

## Refresh availability

Refresh once, as close to redispatch as possible, using this priority:

1. The host's current task-creation schema, model picker, or callable model list for
   the exact product surface and signed-in identity.
2. Enforced workspace, project, repository, or managed configuration.
3. Current official provider guidance for that same boundary, when browsing is
   available and the host inventory is stale or ambiguous.

Do not carry a static provider catalog in this skill. Cache the refreshed inventory
only for the current orchestration run, and invalidate it after another
availability or compatibility error.

## Select the replacement

Preserve explicit user constraints and apply this order:

1. Use an official or host-provided successor for the failed model only when it is
   present in the refreshed current inventory and supports the required Fast tier.
2. Otherwise choose an available sibling or specialist that serves the same slice
   role and meets its minimum capabilities.
3. Use a stronger profile when the error or prior result demonstrates that the
   original capability was insufficient.
4. Use the current/default profile only when the host verifies it is eligible,
   satisfies the slice, and inherits or supports the required Fast tier.
5. If no candidate satisfies every hard constraint, stop that slice and report the
   blocker. Do not weaken Fast mode, safety controls, ownership, or acceptance
   criteria to manufacture a fallback.

Do not infer succession from a larger version number or a similar product name.
Prefer a documented successor; otherwise use disclosed capabilities and relative
roles from [model-routing.md](model-routing.md).

If the user pinned an exact model, report that it is unavailable and show eligible
alternatives, but do not select one automatically. A user preference such as
"cheapest suitable," "fastest suitable," or "use a successor if needed" permits
selection within that stated policy.

## Preserve useful work

When redispatching after a worker or quality failure, send only:

- the original slice contract;
- confirmed findings and accepted partial work;
- the exact failed acceptance criterion or structured dispatch error;
- the refreshed constraints and selected replacement rationale; and
- the remaining verification needed.

Do not replay the whole conversation, repeat completed investigation, or ask the
replacement to overwrite another worker's accepted changes.

## Stop and report

Each slice receives at most one automatic redispatch, whether that redispatch uses
the same profile for a transient error or a replacement profile. If it fails again,
leave successful sibling slices running, mark only this slice blocked, and return
control to the parent or user.

Report an attempt ledger containing:

- failed profile and effective execution tier;
- structured failure class and evidence;
- whether inventory was refreshed and from which boundary;
- replacement profile and why it was eligible;
- whether the retry succeeded; and
- any user decision now required.

Never claim that a fallback ran in native Fast mode unless the host exposed or
verified the effective tier.
