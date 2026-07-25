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
