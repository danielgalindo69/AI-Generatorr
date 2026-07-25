import { z } from "zod";
import type { AigitConfig } from "../types.js";
import fs from "node:fs";
import path from "node:path";

const CONFIG_FILENAME = ".aigit.json";
const GLOBAL_CONFIG_DIR = ".aigit";

const ConfigSchema = z.object({
  aiProvider: z.enum(["gemini", "groq", "ollama"]),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  language: z.string().default("es"),
  commitStyle: z.enum(["conventional", "simple", "emoji"]).default("conventional"),
  ollamaHost: z.string().optional(),
});

export function getDefaultConfig(): AigitConfig {
  return {
    aiProvider: "gemini",
    language: "es",
    commitStyle: "conventional",
  };
}

export function getProjectConfig(projectDir: string): AigitConfig {
  const configPath = path.join(projectDir, CONFIG_FILENAME);
  if (!fs.existsSync(configPath)) {
    return getDefaultConfig();
  }
  const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  return ConfigSchema.parse(raw);
}

export function saveProjectConfig(projectDir: string, config: AigitConfig): void {
  const configPath = path.join(projectDir, CONFIG_FILENAME);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function getGlobalConfigDir(): string {
  const home = process.env["HOME"] || process.env["USERPROFILE"] || "";
  const dir = path.join(home, GLOBAL_CONFIG_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getGlobalConfig(): AigitConfig {
  const configPath = path.join(getGlobalConfigDir(), "config.json");
  if (!fs.existsSync(configPath)) {
    return getDefaultConfig();
  }
  const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  return ConfigSchema.parse(raw);
}

export function saveGlobalConfig(config: AigitConfig): void {
  const configPath = path.join(getGlobalConfigDir(), "config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}
