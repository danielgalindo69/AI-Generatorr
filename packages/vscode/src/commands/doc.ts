import * as vscode from "vscode";
import { getProjectConfig, generateReadme, createAIProvider } from "@aigit/core";

export async function docCommand() {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage("No workspace folder open");
    return;
  }

  const config = getProjectConfig(workspaceRoot);

  vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: "Analyzing repository..." },
    async () => {
      try {
        const provider = createAIProvider(config);
        const readme = await generateReadme(workspaceRoot, provider);

        const readmeUri = vscode.Uri.joinPath(
          vscode.workspace.workspaceFolders![0].uri,
          "README.md",
        );

        await vscode.workspace.fs.writeFile(
          readmeUri,
          Buffer.from(readme, "utf-8"),
        );

        const doc = await vscode.workspace.openTextDocument(readmeUri);
        vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage("README.md generated");
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );
}
