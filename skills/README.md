# Skill collection

Each direct child directory is one independently usable skill. Start a new one
with `pnpm new:skill -- <name> --description "..."` from the repository root,
then replace the generated `TODO` with the skill's actual instructions.

Keep stable skills here. Introduce buckets such as `in-progress/` or
`deprecated/` only when the collection is large enough to need lifecycle
management.

## Available skills

- [orchestrate-parallel-work](orchestrate-parallel-work/SKILL.md): Split complex
  work into independent agent tasks, require Fast execution, and choose efficient
  runtime model profiles without hard-coded provider names, with bounded recovery
  from retired or unavailable models.
- [react-code-quality-check](react-code-quality-check/SKILL.md): Simplify and review
  React and Next.js code while preserving behavior.
