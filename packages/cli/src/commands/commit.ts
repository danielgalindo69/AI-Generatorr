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
