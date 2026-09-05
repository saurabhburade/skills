# Runtime model routing

Use this reference to choose worker profiles without binding the skill to a
provider's current catalog.

## Build a runtime inventory

Use only information exposed by the host, its tools, repository policy, or the
user. For each available profile, record what is actually known:

- exact runtime identifier;
- supported reasoning or thinking levels;
- speed tier and concurrency constraints;
- context and output limits;
- price or relative cost, when disclosed;
- stated specialization, such as coding, search, vision, or long context.

Do not rank profiles solely by names such as `mini`, `pro`, `sonnet`, `opus`,
`fast`, or a version number. Names and product lineups change. If the host provides
descriptions but no reliable ordering, use those descriptions for task fit and
treat the rest as unknown.

## Estimate slice difficulty

Classify each slice using observable properties:

| Signal | Lower expected difficulty | Higher expected difficulty |
| --- | --- | --- |
| Specification | Exact inputs and acceptance checks | Ambiguous goal or trade-offs |
| Change surface | One isolated file or read-only query | Cross-module shared seam |
| Reasoning | Search, transform, or known pattern | Architecture, diagnosis, proof |
| Risk | Easily reversible and well tested | Security, data, concurrency, migration |
| Context | Small and local | Large, scattered, or long-horizon |
| Validation | Deterministic cheap check | Judgment-heavy or weak oracle |

A long task is not automatically hard. A short security-sensitive decision may
deserve a higher-capability profile; a large mechanical migration may suit a faster
profile with deterministic validation.

## Minimize expected total work

After enforcing the skill's Fast execution requirement, choose the model profile
that minimizes the qualitative equivalent of:

```text
initial tokens and latency
+ probability of retry * retry cost
+ reviewer correction cost
+ coordination and context-transfer cost
```

Exact arithmetic is unnecessary unless the host exposes reliable measurements.
Use the formula to avoid false savings, especially when a cheaper first pass is
likely to require a full stronger-model redo.

Routing defaults:

| Slice shape | Preferred relative profile | Reasoning effort |
| --- | --- | --- |
| File discovery, fact extraction, test execution | Lowest reliable fast profile | Low |
| Mechanical change with precise examples and checks | Lower/faster coding-capable profile | Low to medium |
| Bounded implementation with ordinary ambiguity | Peer or relevant specialist | Medium |
| Architecture or shared interface | Higher-capability profile or current parent | High only when needed |
| Security, concurrency, migration, elusive failure | Higher-capability profile | High |
| Final integration review | Parent or a strong independent reviewer | Proportional to risk |

Use a specialist sibling before a general higher tier when the host explicitly
describes it as better suited to the slice. Prefer the current/default profile when
switching would require resending substantial context or when relative capability
is unknown.

## Escalate and downgrade from evidence

When the host publishes a reliable ordering, escalate one tier or increase
reasoning for the affected slice when a worker:

- cannot form a coherent plan from the provided context;
- misses the same acceptance criterion after one focused correction;
- discovers hidden coupling, risk, or ambiguity;
- produces plausible output that lacks a reliable validation path; or
- exhausts its context or output capacity.

When model ordering is unknown, use a host-described stronger or better-suited
profile if one exists. Otherwise retain the current/default profile, increase only
the controls the host exposes, and report that a stronger tier could not be
identified reliably.

Do not repeat the identical prompt on several weak profiles. Preserve useful
findings, reduce irrelevant context, and give the stronger profile the unresolved
decision and evidence.

Downgrade follow-up work when the design is settled, the remaining change is
mechanical, and deterministic checks exist. A higher tier can decide the interface
while a lower or specialist tier implements isolated pieces.

## Handle host limitations

- If model selection is unavailable, omit overrides and use the host default.
- If only one model exists, optimize prompt scope, context, and reasoning effort.
- If reasoning controls are unavailable, do not emulate them with invented model
  names.
- If price is unknown, optimize for fewer retries and smaller context rather than
  claiming monetary savings.
- Always request the host's native Fast-equivalent execution tier when one exists,
  even when it carries a premium; this skill's explicit speed policy takes
  precedence over cost optimization.
- If a native Fast tier exists but cannot be enabled or verified for new workers,
  stop dispatch instead of silently using Standard mode.
- If the host has no execution-tier concept, use the fastest compatible model or
  profile and disclose that native Fast mode was unavailable.
- If user-visible tasks are the only delegation mechanism, follow the host's rules
  for creating and monitoring them. If only ephemeral subagents exist, use them
  without implying that durable tasks were created.

Always report the exact profiles and execution tiers actually used when the host
exposes them. If a model selection or tier was inherited or unknown, say that
plainly.
