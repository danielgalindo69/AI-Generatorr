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

function loadDotenv(dir: string): void {
  const envPath = path.join(dir, ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

export function getProjectConfig(projectDir: string): AigitConfig {
  loadDotenv(projectDir);

  const configPath = path.join(projectDir, CONFIG_FILENAME);
  let config: AigitConfig;
  if (fs.existsSync(configPath)) {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    config = ConfigSchema.parse(raw);
  } else {
    config = getDefaultConfig();
  }

  return resolveEnvApiKey(config);
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
  let config: AigitConfig;
  if (fs.existsSync(configPath)) {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    config = ConfigSchema.parse(raw);
  } else {
    config = getDefaultConfig();
  }

  return resolveEnvApiKey(config);
}

export function saveGlobalConfig(config: AigitConfig): void {
  const configPath = path.join(getGlobalConfigDir(), "config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function resolveEnvApiKey(config: AigitConfig): AigitConfig {
  const envVarName =
    config.aiProvider === "gemini"
      ? "GEMINI_API_KEY"
      : config.aiProvider === "groq"
        ? "GROQ_API_KEY"
        : null;

  if (envVarName && process.env[envVarName]) {
    return { ...config, apiKey: process.env[envVarName] };
  }

  return config;
}
