 import { intro, outro, select, text, isCancel, cancel } from "@clack/prompts";
import pc from "picocolors";
import { getProjectConfig, saveProjectConfig } from "@aigit/core";
import type { AigitConfig } from "@aigit/core";
import fs from "node:fs";
import path from "node:path";

export async function initCommand(): Promise<void> {
  intro(pc.bold("AI Git Initialization"));

  const projectDir = process.cwd();

  // Check if already initialized
  const existing = getProjectConfig(projectDir);
  const configPath = path.join(projectDir, ".aigit.json");
  if (fs.existsSync(configPath)) {
    const overwrite = await select({
      message: ".aigit.json already exists. Overwrite?",
      options: [
        { value: "no", label: "No, keep existing" },
        { value: "yes", label: "Yes, overwrite" },
      ],
    });
    if (isCancel(overwrite) || overwrite === "no") {
      cancel("Initialization cancelled");
      return;
    }
  }

  const provider = await select({
    message: "Select AI provider:",
    options: [
      { value: "gemini", label: "Gemini (Google) - Free 60 req/min" },
      { value: "groq", label: "Groq - Free 30 req/min, fast" },
      { value: "ollama", label: "Ollama - 100% local, free" },
    ],
  });
  if (isCancel(provider)) {
    cancel("Initialization cancelled");
    return;
  }

  let apiKey: string | undefined;
  if (provider === "gemini" || provider === "groq") {
    apiKey = await text({
      message: `Enter your ${provider} API key:`,
      placeholder: provider === "gemini" ? "AIza..." : "gsk_...",
      validate: (val) => {
        if (!val) return "API key is required";
      },
    });
    if (isCancel(apiKey)) {
      cancel("Initialization cancelled");
      return;
    }
  }

  const language = await select({
    message: "Preferred language for commits:",
    options: [
      { value: "es", label: "Spanish" },
      { value: "en", label: "English" },
    ],
  });
  if (isCancel(language)) {
    cancel("Initialization cancelled");
    return;
  }

  const config: AigitConfig = {
    aiProvider: provider as AigitConfig["aiProvider"],
    apiKey,
    language: language as string,
    commitStyle: "conventional",
  };

  saveProjectConfig(projectDir, config);
  outro(pc.green("✓ .aigit.json created successfully"));
}
