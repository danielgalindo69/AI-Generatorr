$root = "C:\Users\jonns\OneDrive\Escritorio\AIGenerator"

# ─── @aigit/core: config/index.ts ───
Set-Content -Path "$root\packages\core\src\config\index.ts" -Value @'
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
'@

Write-Host "✓ config/index.ts"

# ─── @aigit/core: commit/index.ts ───
Set-Content -Path "$root\packages\core\src\commit\index.ts" -Value @'
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
'@

Write-Host "✓ commit/index.ts"

# ─── @aigit/core: index.ts ───
Set-Content -Path "$root\packages\core\src\index.ts" -Value @'
export { getDiff, getRecentCommits } from "./git/index.js";
export { createAIProvider } from "./ai/factory.js";
export { buildCommitPrompt } from "./ai/prompt.js";
export { GeminiProvider } from "./ai/providers/gemini.js";
export { GroqProvider } from "./ai/providers/groq.js";
export { OllamaProvider } from "./ai/providers/ollama.js";
export { generateCommit, applyCommit } from "./commit/index.js";
export {
  getDefaultConfig,
  getProjectConfig,
  saveProjectConfig,
  getGlobalConfig,
  saveGlobalConfig,
} from "./config/index.js";
export type {
  AigitConfig,
  AIProvider,
  CommitContext,
  CommitResult,
  DiffResult,
  ProjectInfo,
} from "./types.js";
'@

Write-Host "✓ core/index.ts"

# ─── @aigit/cli: src/index.ts ───
Set-Content -Path "$root\packages\cli\src\index.ts" -Value @'
#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { commitCommand } from "./commands/commit.js";
import { hookCommand } from "./commands/hook.js";
import { configCommand } from "./commands/config.js";

const program = new Command();

program
  .name("aigit")
  .description("AI-powered git commit generator")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize aigit configuration in the current repository")
  .action(initCommand);

program
  .command("commit")
  .description("Generate and apply a commit using AI")
  .option("-s, --stage", "Use only staged changes")
  .option("-m, --message <hint>", "Provide additional context for the AI")
  .option("--hook", "Run in hook mode (non-interactive)")
  .action(commitCommand);

program
  .command("hook")
  .description("Install or uninstall git hooks")
  .option("--install", "Install pre-commit hook")
  .option("--uninstall", "Remove pre-commit hook")
  .action(hookCommand);

program
  .command("config")
  .description("View or set configuration")
  .argument("[key]", "Config key to view/set")
  .argument("[value]", "Value to set")
  .action(configCommand);

program.parse();
'@

Write-Host "✓ cli/index.ts"

# ─── @aigit/cli: commands/init.ts ───
Set-Content -Path "$root\packages\cli\src\commands\init.ts" -Value @'
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
'@

Write-Host "✓ cli/commands/init.ts"

# ─── @aigit/cli: commands/commit.ts ───
Set-Content -Path "$root\packages\cli\src\commands\commit.ts" -Value @'
import { intro, outro, select, log, isCancel, cancel, spinner } from "@clack/prompts";
import pc from "picocolors";
import { getDiff, getProjectConfig, generateCommit, applyCommit } from "@aigit/core";

export async function commitCommand(options: {
  stage?: boolean;
  message?: string;
  hook?: boolean;
}): Promise<void> {
  const projectDir = process.cwd();
  const config = getProjectConfig(projectDir);

  if (options.hook) {
    await runHookMode(projectDir, config);
    return;
  }

  intro(pc.bold("AI Commit Generator"));

  const diff = await getDiff(projectDir, options.stage);

  if (!diff.files.length) {
    log.warn("No changes detected. Make some changes first.");
    outro(pc.dim("Nothing to commit"));
    return;
  }

  log.info(`Files changed: ${pc.cyan(diff.files.length.toString())}`);

  const s = spinner();
  s.start("Generating commit message with AI...");

  try {
    const message = await generateCommit(projectDir, config, diff, options.message);
    s.stop("Commit generated");

    log.info(pc.bold("\nSuggested commit:\n"));
    log.message(message);

    const action = await select({
      message: "What do you want to do?",
      options: [
        { value: "accept", label: "Accept and commit" },
        { value: "edit", label: "Edit manually" },
        { value: "reject", label: "Reject and cancel" },
      ],
    });

    if (isCancel(action) || action === "reject") {
      cancel("Commit cancelled");
      return;
    }

    if (action === "accept") {
      const result = await applyCommit(projectDir, message);
      if (result.applied) {
        outro(pc.green("✓ Commit applied successfully"));
      } else {
        log.error("Failed to apply commit");
      }
    } else {
      outro("Edit mode - commit manually with: git commit -m \"...\"");
    }
  } catch (error) {
    s.stop("Error");
    log.error(`Failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function runHookMode(projectDir: string, config: any): Promise<void> {
  try {
    const diff = await getDiff(projectDir, true);
    if (!diff.files.length) process.exit(0);
    const message = await generateCommit(projectDir, config, diff);
    const result = await applyCommit(projectDir, message);
    if (result.applied) {
      console.log(`AI Commit: ${message.split("\n")[0]}`);
    }
  } catch {
    process.exit(1);
  }
}
'@

Write-Host "✓ cli/commands/commit.ts"

# ─── @aigit/cli: commands/hook.ts ───
Set-Content -Path "$root\packages\cli\src\commands\hook.ts" -Value @'
import { intro, outro, log } from "@clack/prompts";
import pc from "picocolors";
import fs from "node:fs";
import path from "node:path";

const HOOK_CONTENT = `#!/bin/sh
# AI Git hook - generates commit messages automatically
exec npx aigit commit --hook
`;

export async function hookCommand(options: {
  install?: boolean;
  uninstall?: boolean;
}): Promise<void> {
  const projectDir = process.cwd();
  const hooksDir = path.join(projectDir, ".git", "hooks");
  const hookPath = path.join(hooksDir, "prepare-commit-msg");

  if (options.uninstall) {
    if (fs.existsSync(hookPath)) {
      fs.unlinkSync(hookPath);
      outro(pc.green("✓ Hook removed"));
    } else {
      log.warn("No hook installed");
    }
    return;
  }

  if (!fs.existsSync(hooksDir)) {
    log.error("Not a git repository");
    return;
  }

  fs.writeFileSync(hookPath, HOOK_CONTENT, { mode: 0o755 });
  outro(pc.green("✓ Hook installed in .git/hooks/prepare-commit-msg"));
}
'@

Write-Host "✓ cli/commands/hook.ts"

# ─── @aigit/cli: commands/config.ts ───
Set-Content -Path "$root\packages\cli\src\commands\config.ts" -Value @'
import { intro, outro, log } from "@clack/prompts";
import pc from "picocolors";
import { getProjectConfig, getGlobalConfig, saveGlobalConfig } from "@aigit/core";

export function configCommand(key?: string, value?: string): void {
  const projectDir = process.cwd();

  if (!key) {
    intro(pc.bold("Configuration"));

    const projectConfig = getProjectConfig(projectDir);
    log.info(pc.bold("Project config (.aigit.json):"));
    console.log(JSON.stringify(projectConfig, null, 2));

    const globalConfig = getGlobalConfig();
    log.info(pc.bold("\nGlobal config (~/.aigit/config.json):"));
    console.log(JSON.stringify(globalConfig, null, 2));

    return;
  }

  if (key && value) {
    const config = getGlobalConfig();
    const validKeys = ["aiProvider", "apiKey", "model", "language", "commitStyle", "ollamaHost"];

    if (!validKeys.includes(key)) {
      log.error(`Invalid key: ${key}. Valid keys: ${validKeys.join(", ")}`);
      return;
    }

    (config as any)[key] = value;
    saveGlobalConfig(config);
    outro(pc.green(`✓ ${key} set to ${value}`));
  }
}
'@

Write-Host "✓ cli/commands/config.ts"

Write-Host "`nAll files generated successfully!"