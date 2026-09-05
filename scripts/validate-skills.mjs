#!/usr/bin/env node

import {
  lstatSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PLACEHOLDER_PATTERN = /\b(?:TODO|TBD)\b|\[(?:describe|replace|add)[^\]]*\]/i;
const ALLOWED_FRONTMATTER = new Set([
  "name",
  "description",
  "license",
  "allowed-tools",
  "metadata",
  "disable-model-invocation",
]);

const inside = (candidate, parent) => {
  const pathFromParent = relative(parent, candidate);
  return (
    pathFromParent === "" ||
    (!pathFromParent.startsWith(`..${sep}`) && pathFromParent !== "..")
  );
};

function walk(root, visitor, current = root) {
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    if (current === root && entry.name === ".git") continue;
    const path = join(current, entry.name);
    visitor(path, entry);
    if (entry.isDirectory() && !entry.isSymbolicLink()) {
      walk(root, visitor, path);
    }
  }
}

function parseScalar(value) {
  const clean = value.trim();
  if (clean.startsWith('"')) {
    try {
      const decoded = JSON.parse(clean);
      return typeof decoded === "string" ? decoded : "";
    } catch {
      return "";
    }
  }
  if (clean.startsWith("'") && clean.endsWith("'")) {
    return clean.slice(1, -1).replaceAll("''", "'");
  }
  return clean;
}

export function parseFrontmatter(displayPath, text) {
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") {
    return {
      fields: {},
      body: "",
      issues: [`${displayPath}: missing opening YAML frontmatter delimiter`],
    };
  }

  const closing = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (closing === -1) {
    return {
      fields: {},
      body: "",
      issues: [`${displayPath}: missing closing YAML frontmatter delimiter`],
    };
  }

  const fields = {};
  const issues = [];
  for (let index = 1; index < closing; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith("#") || /^\s/.test(line)) {
      continue;
    }
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      issues.push(`${displayPath}:${index + 1}: unsupported frontmatter syntax`);
      continue;
    }
    if (
      match[1] === "disable-model-invocation" &&
      !/^(true|false)$/.test(match[2].trim())
    ) {
      issues.push(
        `${displayPath}:${index + 1}: disable-model-invocation must be an unquoted true or false`,
      );
    }
    fields[match[1]] = parseScalar(match[2]);
  }

  return {
    fields,
    body: lines.slice(closing + 1).join("\n").trim(),
    issues,
  };
}

export function validateRepo(repoRootInput) {
  const repoRoot = realpathSync(resolve(repoRootInput));
  const skillsRoot = join(repoRoot, "skills");
  const issues = [];

  try {
    if (!lstatSync(skillsRoot).isDirectory()) {
      return ["skills/: directory is missing"];
    }
  } catch {
    return ["skills/: directory is missing"];
  }

  const discovery = join(repoRoot, ".agents", "skills");
  try {
    if (!lstatSync(discovery).isSymbolicLink()) {
      issues.push(".agents/skills: expected a symlink to ../skills");
    } else if (realpathSync(discovery) !== realpathSync(skillsRoot)) {
      issues.push(".agents/skills: symlink does not resolve to skills/");
    }
  } catch {
    issues.push(".agents/skills: expected a symlink to ../skills");
  }

  const skillFiles = [];
  walk(repoRoot, (path, entry) => {
    if (entry.isSymbolicLink()) {
      try {
        if (!inside(realpathSync(path), repoRoot)) {
          issues.push(`${relative(repoRoot, path)}: symlink escapes repository`);
        }
      } catch {
        issues.push(`${relative(repoRoot, path)}: broken symlink to ${readlinkSync(path)}`);
      }
    }
    if (
      entry.isFile() &&
      entry.name === "SKILL.md" &&
      inside(path, skillsRoot)
    ) {
      skillFiles.push(path);
    }
  });

  const seenNames = new Map();
  for (const skillFile of skillFiles.sort()) {
    const displayPath = relative(repoRoot, skillFile);
    const { fields, body, issues: frontmatterIssues } = parseFrontmatter(
      displayPath,
      readFileSync(skillFile, "utf8"),
    );
    issues.push(...frontmatterIssues);

    const name = fields.name?.trim() ?? "";
    const description = fields.description?.trim() ?? "";
    const directory = skillFile.split(sep).at(-2);

    const unexpected = Object.keys(fields).filter(
      (key) => !ALLOWED_FRONTMATTER.has(key),
    );
    if (unexpected.length > 0) {
      issues.push(
        `${displayPath}: unsupported frontmatter fields: ${unexpected.sort().join(", ")}`,
      );
    }

    if (!name) {
      issues.push(`${displayPath}: frontmatter requires name`);
    } else if (name.length >= 64 || !NAME_PATTERN.test(name)) {
      issues.push(`${displayPath}: invalid skill name ${JSON.stringify(name)}`);
    } else if (name !== directory) {
      issues.push(
        `${displayPath}: name ${JSON.stringify(name)} must match directory ${JSON.stringify(directory)}`,
      );
    }

    if (!description) {
      issues.push(`${displayPath}: frontmatter requires a non-empty description`);
    } else if (description.length > 1024) {
      issues.push(`${displayPath}: description exceeds 1024 characters`);
    } else if (/[<>]/.test(description)) {
      issues.push(`${displayPath}: description cannot contain angle brackets`);
    }
    if (!body) {
      issues.push(`${displayPath}: instruction body is empty`);
    } else if (PLACEHOLDER_PATTERN.test(body)) {
      issues.push(`${displayPath}: unfinished placeholder in instruction body`);
    }

    if (name) {
      if (seenNames.has(name)) {
        issues.push(
          `${displayPath}: duplicate skill name also used by ${seenNames.get(name)}`,
        );
      } else {
        seenNames.set(name, displayPath);
      }
    }
  }

  return [...new Set(issues)].sort();
}

function main() {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const issues = validateRepo(repoRoot);
  if (issues.length > 0) {
    for (const issue of issues) console.error(`ERROR ${issue}`);
    console.error(`validation failed with ${issues.length} issue(s)`);
    return 1;
  }

  let count = 0;
  walk(join(repoRoot, "skills"), (_path, entry) => {
    if (entry.isFile() && entry.name === "SKILL.md") count += 1;
  });
  console.log(`validated ${count} skill(s)`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
