import { intro, outro, spinner, log } from "@clack/prompts";
import pc from "picocolors";
import { getProjectConfig, generateReadme, createAIProvider } from "@aigit/core";
import fs from "node:fs";
import path from "node:path";

export async function docCommand(): Promise<void> {
  intro(pc.bold("AI Documentator"));

  const projectDir = process.cwd();
  const config = getProjectConfig(projectDir);

  log.info(pc.cyan("Analyzing repository structure..."));
  const s = spinner();
  s.start("Generating documentation...");

  try {
    const provider = createAIProvider(config);
    const readme = await generateReadme(projectDir, provider, config.model);
    s.stop("Documentation generated");

    const readmePath = path.join(projectDir, "README.md");
    const exists = fs.existsSync(readmePath);
    fs.writeFileSync(readmePath, readme);

    if (exists) {
      outro(pc.green("✓ README.md updated successfully"));
    } else {
      outro(pc.green("✓ README.md created successfully"));
    }
  } catch (error) {
    s.stop("Error");
    log.error(`Failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}