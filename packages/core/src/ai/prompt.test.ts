import { describe, it, expect } from "vitest";
import { buildCommitPrompt } from "./prompt.js";
import type { CommitContext } from "../types.js";

const baseContext: CommitContext = {
  projectType: "Node.js",
  framework: "Express",
  recentCommits: ["feat: add login", "fix: handle error"],
  language: "es",
  style: "conventional",
};

describe("buildCommitPrompt", () => {
  it("should include the diff in the prompt", () => {
    const result = buildCommitPrompt("diff --git a/file.ts b/file.ts", baseContext);
    expect(result).toContain("diff --git a/file.ts b/file.ts");
  });

  it("should include project context", () => {
    const result = buildCommitPrompt("some diff", baseContext);
    expect(result).toContain("Node.js");
    expect(result).toContain("Express");
  });

  it("should include recent commits", () => {
    const result = buildCommitPrompt("diff", baseContext);
    expect(result).toContain("feat: add login");
    expect(result).toContain("fix: handle error");
  });

  it("should include user hint when provided", () => {
    const ctx = { ...baseContext, userHint: "this is urgent" };
    const result = buildCommitPrompt("diff", ctx);
    expect(result).toContain("this is urgent");
  });

  it("should NOT include user hint when not provided", () => {
    const result = buildCommitPrompt("diff", baseContext);
    expect(result).not.toContain("Contexto adicional");
  });

  it("should enforce 72 char title rule", () => {
    const result = buildCommitPrompt("diff", baseContext);
    expect(result).toContain("72");
  });

  it("should adapt to emoji style", () => {
    const ctx = { ...baseContext, style: "emoji" as const };
    const result = buildCommitPrompt("diff", ctx);
    expect(result).toContain("emojis");
  });

  it("should adapt to simple style", () => {
    const ctx = { ...baseContext, style: "simple" as const };
    const result = buildCommitPrompt("diff", ctx);
    expect(result).toContain("Genera un mensaje claro");
  });
});
