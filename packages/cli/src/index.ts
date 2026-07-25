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
