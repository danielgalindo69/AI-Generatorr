import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { analyzeProject } from "./project.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "aigit-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("analyzeProject", () => {
  it("should detect Node.js project from package.json", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test-app", version: "2.0.0", description: "A test" }),
    );
    const result = analyzeProject(tmpDir);
    expect(result.name).toBe("test-app");
    expect(result.version).toBe("2.0.0");
    expect(result.description).toBe("A test");
    expect(result.type).toBe("Node.js");
  });

  it("should detect Next.js framework", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({}));
    fs.writeFileSync(path.join(tmpDir, "next.config.js"), "");
    const result = analyzeProject(tmpDir);
    expect(result.framework).toBe("Next.js");
  });

  it("should detect Vite framework", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({}));
    fs.writeFileSync(path.join(tmpDir, "vite.config.ts"), "");
    const result = analyzeProject(tmpDir);
    expect(result.framework).toBe("Vite");
  });

  it("should return folder name for unknown project", () => {
    const result = analyzeProject(tmpDir);
    expect(result.type).toBe("Unknown");
    expect(result.name).toBe(path.basename(tmpDir));
  });
});
