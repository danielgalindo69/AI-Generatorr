import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import git from "isomorphic-git";
import { getDiff, getRecentCommits } from "./git/index.js";
import { generateCommit, applyCommit } from "./commit/index.js";
import { MockAIProvider } from "./ai/providers/mock.js";
import { getDefaultConfig } from "./config/index.js";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "aigit-int-"));
  await git.init({ fs, dir: tmpDir });
  // First commit: establish baseline
  fs.writeFileSync(path.join(tmpDir, "test.txt"), "initial content");
  await git.add({ fs, dir: tmpDir, filepath: "test.txt" });
  await git.commit({
    fs, dir: tmpDir, message: "initial",
    author: { name: "test", email: "test@test.com" },
  });
  // Re-create to simulate a fresh working tree state
  fs.writeFileSync(path.join(tmpDir, "test.txt"), "initial content");
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("commit integration", () => {
  it("should detect modified files after edit", async () => {
    fs.writeFileSync(path.join(tmpDir, "test.txt"), "modified content");
    const diff = await getDiff(tmpDir);
    expect(diff.files).toContain("test.txt");
    expect(diff.summary.modified).toBe(1);
  });

  it("should detect new files as added", async () => {
    fs.writeFileSync(path.join(tmpDir, "new.ts"), "export const x = 1;");
    const diff = await getDiff(tmpDir);
    expect(diff.files).toContain("new.ts");
    expect(diff.summary.added).toBe(1);
  });

  it("should return empty diff when no changes", async () => {
    const diff = await getDiff(tmpDir);
    expect(diff.files).toHaveLength(0);
    expect(diff.diff).toBe("");
  });

  it("should detect only staged files with stagedOnly", async () => {
    fs.writeFileSync(path.join(tmpDir, "staged.txt"), "staged content");
    fs.writeFileSync(path.join(tmpDir, "unstaged.txt"), "unstaged");
    await git.add({ fs, dir: tmpDir, filepath: "staged.txt" });
    const diff = await getDiff(tmpDir, true);
    expect(diff.files).toContain("staged.txt");
  });

  it("should generate commit with mock provider", async () => {
    fs.writeFileSync(path.join(tmpDir, "test.txt"), "updated content");
    const config = getDefaultConfig();
    const provider = new MockAIProvider("feat: update test file");
    const diff = await getDiff(tmpDir);
    const message = await provider.generateCommit(diff.diff, {
      projectType: "test",
      framework: "",
      recentCommits: [],
      language: "en",
      style: "conventional",
    });
    expect(message).toBe("feat: update test file");
  });

  it("should apply commit to git history", async () => {
    fs.writeFileSync(path.join(tmpDir, "test.txt"), "commit content");
    await git.add({ fs, dir: tmpDir, filepath: "test.txt" });
    const result = await applyCommit(tmpDir, "feat: test commit");
    expect(result.applied).toBe(true);
    expect(result.message).toBe("feat: test commit");
    const commits = await getRecentCommits(tmpDir, 1);
    expect(commits[0]).toContain("feat: test commit");
  });

  it("should get recent commits after multiple commits", async () => {
    for (let i = 0; i < 3; i++) {
      fs.writeFileSync(path.join(tmpDir, "test.txt"), `content ${i}`);
      await git.add({ fs, dir: tmpDir, filepath: "test.txt" });
      await applyCommit(tmpDir, `commit ${i}`);
    }
    const commits = await getRecentCommits(tmpDir, 2);
    expect(commits).toHaveLength(2);
    expect(commits[0]).toContain("commit 2");
  });
});
