# Repository guidance

This repository contains reusable agent skills. Keep each skill focused on one
job and place its canonical source at `skills/<skill-name>/SKILL.md`.

Every `SKILL.md` must have YAML frontmatter with `name` and `description`.
Names use lowercase letters, digits, and hyphens, stay under 64 characters, and
match their directory. Descriptions should state both capability and activation
boundary because they drive automatic discovery.

Keep the entrypoint concise. Put branch-specific procedures or substantial
reference material in `references/`, repeatable deterministic logic in
`scripts/`, and output resources in `assets/`. Create only directories the skill
actually needs. Do not add a README inside an individual skill.

Use `agents/openai.yaml` only for UI metadata, dependencies, or an explicit
invocation policy. Automatic invocation remains enabled unless the skill is
intentionally explicit-only.

After changing a skill or repository tooling, run:

```bash
pnpm check
```

Treat pre-existing edits as user-owned. Do not stage, commit, publish, install,
or link skills outside this repository unless the user asks.
