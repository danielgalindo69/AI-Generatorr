import type { AigitConfig, CommitContext, CommitResult, DiffResult } from "../types.js";
import { createAIProvider } from "../ai/factory.js";
import { getRecentCommits } from "../git/index.js";
import git from "isomorphic-git";
import fs from "node:fs";

export async function generateCommit(
  projectDir: string,
  config: AigitConfig,
  diff: DiffResult,
  userHint?: string,
): Promise<string> {
  const provider = createAIProvider(config);

  const recentCommits = await getRecentCommits(projectDir, 5);
  const projectType = detectProjectType(projectDir);
  const framework = detectFramework(projectDir);

  const context: CommitContext = {
    projectType,
    framework,
    recentCommits,
    language: config.language,
    style: config.commitStyle,
    userHint,
  };

  return provider.generateCommit(diff.diff, context);
}

export async function applyCommit(
  projectDir: string,
  message: string,
): Promise<CommitResult> {
  try {
    await git.commit({
      fs,
      dir: projectDir,
      message,
      author: {
        name: "AI Git",
        email: "aigit@local",
      },
    });
    return { message, applied: true };
  } catch (error) {
    return {
      message,
      applied: false,
    };
  }
}

function detectProjectType(dir: string): string {
  const files = [
    "package.json", "Cargo.toml", "pyproject.toml",
    "go.mod", "Gemfile", "build.gradle", "pom.xml",
  ];
  for (const f of files) {
    if (fs.existsSync(dir + "/" + f)) {
      const map: Record<string, string> = {
        "package.json": "Node.js",
        "Cargo.toml": "Rust",
        "pyproject.toml": "Python",
        "go.mod": "Go",
        "Gemfile": "Ruby",
        "build.gradle": "Java",
        "pom.xml": "Java",
      };
      return map[f] || "Unknown";
    }
  }
  return "Unknown";
}

function detectFramework(dir: string): string {
  if (fs.existsSync(dir + "/next.config.js") || fs.existsSync(dir + "/next.config.ts")) return "Next.js";
  if (fs.existsSync(dir + "/vite.config.ts") || fs.existsSync(dir + "/vite.config.js")) return "Vite";
  if (fs.existsSync(dir + "/astro.config.mjs")) return "Astro";
  if (fs.existsSync(dir + "/angular.json")) return "Angular";
  if (fs.existsSync(dir + "/.expo")) return "Expo/React Native";
  return "Unknown";
}
