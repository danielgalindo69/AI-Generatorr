import fs from "node:fs";
import path from "node:path";
import { analyzeRepository } from "../analyzer/index.js";
import { buildReadmePrompt } from "./prompts.js";
import type { AIProvider } from "../types.js";

export async function generateReadme(
  dir: string,
  provider: AIProvider,
  model?: string,
): Promise<string> {
  const analysis = analyzeRepository(dir);
  const existingReadme = readExistingReadme(dir);
  const prompt = buildReadmePrompt(analysis, existingReadme);
  return provider.generateCommit(prompt, {
    projectType: analysis.project.type,
    framework: analysis.project.framework,
    recentCommits: [],
    language: "es",
    style: "conventional",
  });
}

function readExistingReadme(dir: string): string | undefined {
  const candidates = ["README.md", "Readme.md", "readme.md"];
  for (const name of candidates) {
    const fullPath = path.join(dir, name);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, "utf-8");
    }
  }
  return undefined;
}
