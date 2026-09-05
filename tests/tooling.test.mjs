import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";

import { createSkill } from "../scripts/new-skill.mjs";
import { parseFrontmatter, validateRepo } from "../scripts/validate-skills.mjs";

const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function makeRepo() {
  const root = mkdtempSync(join(tmpdir(), "skills-tooling-"));
  temporaryDirectories.push(root);
  mkdirSync(join(root, "skills"));
  mkdirSync(join(root, ".agents"));
  symlinkSync("../skills", join(root, ".agents", "skills"));
  return root;
}

test("a completed generated skill validates", () => {
  const root = makeRepo();
  const skill = createSkill({
    skillsRoot: join(root, "skills"),
    name: "release-notes",
    description: "Draft release notes when a user provides a completed change set.",
    resources: ["references"],
  });
  const skillPath = join(skill, "SKILL.md");
  const contents = readFileSync(skillPath, "utf8").replace(
    "TODO: Replace this line with the concise workflow, constraints, and completion\n" +
      "criteria another agent needs to perform this skill reliably.",
    "Verify every claim against the supplied diff and return concise Markdown.",
  );
  writeFileSync(skillPath, contents, "utf8");

  assert.deepEqual(validateRepo(root), []);
});

test("a generated placeholder fails validation", () => {
  const root = makeRepo();
  createSkill({
    skillsRoot: join(root, "skills"),
    name: "release-notes",
    description: "Use when drafting releases.",
  });

  assert.ok(validateRepo(root).some((issue) => issue.includes("unfinished placeholder")));
});

test("explicit-only generation configures both hosts without changing defaults", () => {
  const root = makeRepo();
  for (const explicitOnly of [false, true]) {
    const skill = createSkill({
      skillsRoot: join(root, "skills"),
      name: explicitOnly ? "manual-review" : "automatic-review",
      description: "Review a supplied change set.",
      explicitOnly,
    });
    const parsed = parseFrontmatter(
      "SKILL.md",
      readFileSync(join(skill, "SKILL.md"), "utf8"),
    );
    assert.deepEqual(parsed.issues, []);
    assert.equal(parsed.fields["disable-model-invocation"], explicitOnly ? "true" : undefined);
    const config = readFileSync(join(skill, "agents", "openai.yaml"), "utf8");
    if (explicitOnly) {
      assert.match(config, /^policy:\n  allow_implicit_invocation: false$/m);
    } else {
      assert.doesNotMatch(config, /allow_implicit_invocation/);
    }
  }
  const issues = validateRepo(root);
  assert.equal(issues.length, 2);
  assert.ok(issues.every((issue) => issue.includes("unfinished placeholder")));
});

test("invocation frontmatter requires a literal boolean", () => {
  for (const value of ["true", "false", '"true"', "sometimes", "", "1"]) {
    const parsed = parseFrontmatter(
      "SKILL.md",
      `---\nname: review\ndescription: Review code.\ndisable-model-invocation: ${value}\n---\nReview the supplied code.`,
    );
    assert.equal(parsed.issues.length, ["true", "false"].includes(value) ? 0 : 1);
  }
});

test("the generator refuses an existing path", () => {
  const root = makeRepo();
  const options = {
    skillsRoot: join(root, "skills"),
    name: "release-notes",
    description: "Use when drafting releases.",
  };
  createSkill(options);

  assert.throws(() => createSkill(options), /EEXIST/);
});

test("an invalid name is rejected", () => {
  const root = makeRepo();
  assert.throws(
    () =>
      createSkill({
        skillsRoot: join(root, "skills"),
        name: "../escape",
        description: "Invalid traversal attempt.",
      }),
    /name must be under 64 characters/,
  );
});

test("an escaping symlink is reported", () => {
  const root = makeRepo();
  const outside = mkdtempSync(join(tmpdir(), "skills-outside-"));
  temporaryDirectories.push(outside);
  symlinkSync(outside, join(root, "unsafe-link"));

  assert.deepEqual(validateRepo(root), ["unsafe-link: symlink escapes repository"]);
});

test("optional nested frontmatter is accepted", () => {
  const root = makeRepo();
  const skill = join(root, "skills", "release-notes");
  mkdirSync(skill);
  writeFileSync(
    join(skill, "SKILL.md"),
    `---
name: release-notes
description: Use when drafting release notes from a completed change set.
metadata:
  short-description: Draft release notes
---

Verify each claim against the supplied diff and return concise Markdown.
`,
    "utf8",
  );

  assert.deepEqual(validateRepo(root), []);
});

test("unsupported top-level frontmatter is rejected", () => {
  const root = makeRepo();
  const skill = join(root, "skills", "release-notes");
  mkdirSync(skill);
  writeFileSync(
    join(skill, "SKILL.md"),
    `---
name: release-notes
description: Use when drafting release notes.
unsupported: true
---

Verify each claim and return concise Markdown.
`,
    "utf8",
  );

  assert.deepEqual(validateRepo(root), [
    "skills/release-notes/SKILL.md: unsupported frontmatter fields: unsupported",
  ]);
});

test("angle brackets in a description are rejected", () => {
  const root = makeRepo();
  const skill = join(root, "skills", "release-notes");
  mkdirSync(skill);
  writeFileSync(
    join(skill, "SKILL.md"),
    `---
name: release-notes
description: Use when processing <change-set> input.
---

Verify each claim and return concise Markdown.
`,
    "utf8",
  );

  assert.deepEqual(validateRepo(root), [
    "skills/release-notes/SKILL.md: description cannot contain angle brackets",
  ]);
});
