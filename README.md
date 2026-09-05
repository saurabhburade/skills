# Skills

A repository for building, reviewing, and maintaining our own agent skills.

Each skill is focused and self-contained, with its instructions and supporting
resources bundled together. Skills live in `skills/`; `.agents/skills` points to
that directory so Codex can discover them while working in this repo.

## Create a skill

```bash
pnpm new:skill -- my-skill \
  --description "Explain what the skill does and when it should activate."
```

The generator refuses to overwrite an existing directory. It creates a
deliberately unfinished `SKILL.md`; replace its `TODO` before validation will
pass. Add only the resource directories the skill needs:

```bash
pnpm new:skill -- my-skill \
  --description "Use when ..." \
  --resources scripts references assets
```

Use `--explicit-only` for a skill that should run only when a person invokes it.
This sets Claude Code's `disable-model-invocation: true` frontmatter and Codex's
`policy.allow_implicit_invocation: false` in `agents/openai.yaml`. It does not
install the skill into either agent.

## Verify the repository

```bash
pnpm validate
pnpm test
```

Validation checks naming, required frontmatter, duplicate names, unfinished
scaffolds, and symlinks that escape the repository. The tooling uses Node's
built-in APIs and has no third-party runtime dependencies.

## Layout

```text
.
|-- .agents/skills -> ../skills
|-- skills/<skill-name>/
|   |-- SKILL.md
|   |-- agents/openai.yaml   optional UI metadata and invocation policy
|   |-- scripts/             optional deterministic helpers
|   |-- references/          optional on-demand guidance
|   `-- assets/              optional output resources
|-- scripts/
`-- tests/
```

See the official [Codex skill authoring documentation](https://learn.chatgpt.com/docs/build-skills)
for discovery behavior and supported metadata.

## Available skills

- [react-code-quality-check](skills/react-code-quality-check/SKILL.md): Review and
  refactor React and Next.js code for clarity, sound state and Effect usage,
  intentional server/client boundaries, and evidence-based performance.
  Explicit invocation: `$react-code-quality-check` in Codex, or
  `/react-code-quality-check` when installed in Claude Code.
