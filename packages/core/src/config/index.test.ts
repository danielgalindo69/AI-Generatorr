import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getDefaultConfig, getProjectConfig } from "./index.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "aigit-config-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env["GEMINI_API_KEY"];
  delete process.env["GROQ_API_KEY"];
});

describe("getDefaultConfig", () => {
  it("should return default config", () => {
    const config = getDefaultConfig();
    expect(config.aiProvider).toBe("gemini");
    expect(config.language).toBe("es");
    expect(config.commitStyle).toBe("conventional");
  });
});

describe("env var resolution", () => {
  it("should read GEMINI_API_KEY from .env file", () => {
    fs.writeFileSync(path.join(tmpDir, ".env"), 'GEMINI_API_KEY=test-key-from-env\n');
    const config = getProjectConfig(tmpDir);
    expect(config.apiKey).toBe("test-key-from-env");
  });

  it("should not override existing process.env values", () => {
    process.env["GEMINI_API_KEY"] = "existing-key";
    fs.writeFileSync(path.join(tmpDir, ".env"), 'GEMINI_API_KEY=env-file-key\n');
    const config = getProjectConfig(tmpDir);
    expect(config.apiKey).toBe("existing-key");
  });

  it("should fall back to config file apiKey when no env var", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".aigit.json"),
      JSON.stringify({
        aiProvider: "groq",
        apiKey: "config-file-key",
        language: "en",
        commitStyle: "simple",
      }),
    );
    const config = getProjectConfig(tmpDir);
    expect(config.apiKey).toBe("config-file-key");
  });

  it("should return undefined apiKey when nothing is set", () => {
    const config = getProjectConfig(tmpDir);
    expect(config.apiKey).toBeUndefined();
  });
});
