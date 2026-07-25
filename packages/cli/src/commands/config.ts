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
