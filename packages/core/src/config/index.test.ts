import { describe, it, expect } from "vitest";
import { getDefaultConfig } from "./index.js";

describe("getDefaultConfig", () => {
  it("should return default config", () => {
    const config = getDefaultConfig();
    expect(config.aiProvider).toBe("gemini");
    expect(config.language).toBe("es");
    expect(config.commitStyle).toBe("conventional");
  });
});
