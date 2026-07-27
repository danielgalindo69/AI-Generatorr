import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { analyzeDependencies } from "./dependencies.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "aigit-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("analyzeDependencies", () => {
  it("should extract dependencies from package.json", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        dependencies: { express: "^4.0.0", zod: "^3.0.0" },
        devDependencies: { vitest: "^1.0.0" },
      }),
    );
    const result = analyzeDependencies(tmpDir);
    expect(result.dependencies).toEqual(["express", "zod"]);
    expect(result.devDependencies).toEqual(["vitest"]);
  });

  it("should return empty if no package.json", () => {
    const result = analyzeDependencies(tmpDir);
    expect(result.dependencies).toEqual([]);
    expect(result.devDependencies).toEqual([]);
  });
});
