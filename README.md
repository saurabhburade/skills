# Skills

A collection of reusable agent skills for Codex and Claude Code. Install the
skills you need, then invoke them in your project.

## Installation (30-second setup)

### 1. Install the skills

With Node.js and Git installed, run this from your project directory:

```bash
npx skills@latest add saurabhburade/skills
```

Choose the skills you want and the agents you use, including Codex or Claude
Code. The [skills CLI](https://github.com/vercel-labs/skills#install-a-skill)
handles installation.

To install just one skill:

```bash
npx skills@latest add saurabhburade/skills --skill react-code-quality-check
```

Add `--global` to install for use across all your projects.

### 2. Use a skill

Send a prompt with the installed skill's name in your coding agent.

In Codex:

```text
$react-code-quality-check Review and simplify this React project while preserving behavior.
```

In Claude Code:

```text
/react-code-quality-check Review and simplify this React project while preserving behavior.
```

Replace the name with `orchestrate-parallel-work` to coordinate independent
workstreams. The React code quality skill requires explicit invocation.

## Update installed skills

```bash
npx skills@latest update
```

## Available skills

- [orchestrate-parallel-work](skills/orchestrate-parallel-work/SKILL.md):
  Coordinate independent agent work in Fast mode and dynamically route each slice
  to an efficient model profile across supported hosts, recovering safely from
  unavailable profiles.
- [react-code-quality-check](skills/react-code-quality-check/SKILL.md): Review and
  refactor React and Next.js code for clarity, sound state and Effect usage,
  intentional server/client boundaries, and evidence-based performance.
  Explicit invocation: `$react-code-quality-check` in Codex, or
  `/react-code-quality-check` when installed in Claude Code.
