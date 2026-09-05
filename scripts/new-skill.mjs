#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESOURCE_NAMES = new Set(["scripts", "references", "assets"]);

export const displayName = (name) =>
  name
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

export function validateName(name) {
  if (name.length >= 64 || !NAME_PATTERN.test(name)) {
    throw new Error(
      "name must be under 64 characters and contain only lowercase letters, " +
        "digits, and single hyphens",
    );
  }
}

export function createSkill({
  skillsRoot,
  name,
  description,
  resources = [],
  explicitOnly = false,
}) {
  validateName(name);
  const cleanDescription = description.trim();
  if (!cleanDescription || cleanDescription.includes("\n")) {
    throw new Error("description must be a non-empty single line");
  }

  const unknown = [...new Set(resources)].filter(
    (resource) => !RESOURCE_NAMES.has(resource),
  );
  if (unknown.length > 0) {
    throw new Error(`unsupported resources: ${unknown.sort().join(", ")}`);
  }

  const target = join(skillsRoot, name);
  mkdirSync(target, { recursive: false });

  const skill = `---
name: ${name}
description: ${JSON.stringify(cleanDescription)}
${explicitOnly ? "disable-model-invocation: true\n" : ""}---

# ${displayName(name)}

TODO: Replace this line with the concise workflow, constraints, and completion
criteria another agent needs to perform this skill reliably.
`;
  writeFileSync(join(target, "SKILL.md"), skill, "utf8");

  const agentLines = [
    "interface:",
    `  display_name: ${JSON.stringify(displayName(name))}`,
    `  short_description: ${JSON.stringify(cleanDescription.slice(0, 100))}`,
  ];
  if (explicitOnly) {
    agentLines.push("policy:", "  allow_implicit_invocation: false");
  }
  mkdirSync(join(target, "agents"));
  writeFileSync(
    join(target, "agents", "openai.yaml"),
    `${agentLines.join("\n")}\n`,
    "utf8",
  );

  for (const resource of resources) {
    mkdirSync(join(target, resource));
  }

  return target;
}

function usage(message) {
  if (message) console.error(`error: ${message}`);
  console.error(
    "usage: pnpm new:skill -- <name> --description <text> " +
      "[--resources scripts references assets] [--explicit-only]",
  );
  return 2;
}

export function parseArgs(args) {
  const options = {
    name: undefined,
    description: undefined,
    resources: [],
    explicitOnly: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!options.name && !argument.startsWith("--")) {
      options.name = argument;
    } else if (argument === "--description") {
      options.description = args[++index];
    } else if (argument === "--explicit-only") {
      options.explicitOnly = true;
    } else if (argument === "--resources") {
      while (args[index + 1] && !args[index + 1].startsWith("--")) {
        options.resources.push(args[++index]);
      }
    } else {
      throw new Error(`unknown argument: ${argument}`);
    }
  }

  if (!options.name) throw new Error("name is required");
  if (!options.description) throw new Error("--description is required");
  return options;
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    return usage(error.message);
  }

  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  try {
    const target = createSkill({
      skillsRoot: join(repoRoot, "skills"),
      ...options,
    });
    console.log(`created ${target.slice(repoRoot.length + 1)}`);
    console.log("next: replace TODO in SKILL.md, then run pnpm validate");
    return 0;
  } catch (error) {
    return usage(error.message);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
