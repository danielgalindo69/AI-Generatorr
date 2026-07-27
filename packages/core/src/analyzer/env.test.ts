import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { analyzeEnv } from "./env.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "aigit-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("analyzeEnv", () => {
  it("should parse variables from .env.example", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".env.example"),
      "# Database\nDB_HOST=localhost\nDB_PORT=5432\n# API\nAPI_KEY=your_key_here\n",
    );
    const vars = analyzeEnv(tmpDir);
    expect(vars).toHaveLength(3);
    expect(vars[0].key).toBe("DB_HOST");
    expect(vars[0].description).toBe("Database");
    expect(vars[2].key).toBe("API_KEY");
    expect(vars[2].required).toBe(true);
  });

  it("should return empty array if no env files", () => {
    const vars = analyzeEnv(tmpDir);
    expect(vars).toHaveLength(0);
  });

  it("should detect optional vars (with values)", () => {
    fs.writeFileSync(path.join(tmpDir, ".env"), "PORT=3000\nDEBUG=false\n");
    const vars = analyzeEnv(tmpDir);
    expect(vars[0].required).toBe(false);
  });
});
