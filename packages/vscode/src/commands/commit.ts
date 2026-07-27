import * as vscode from "vscode";
import { getProjectConfig, getDiff, generateCommit, applyCommit, createAIProvider } from "@aigit/core";

export async function commitCommand() {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage("No workspace folder open");
    return;
  }

  const config = getProjectConfig(workspaceRoot);
  const diff = await getDiff(workspaceRoot);

  if (!diff.files.length) {
    vscode.window.showInformationMessage("No changes detected");
    return;
  }

  vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: "Generating commit..." },
    async () => {
      try {
        const provider = createAIProvider(config);
        const message = await generateCommit(workspaceRoot, config, diff);

        const action = await vscode.window.showInformationMessage(
          `Commit: ${message.split("\n")[0]}`,
          "Accept",
          "Edit",
          "Cancel",
        );

        if (action === "Accept") {
          const result = await applyCommit(workspaceRoot, message);
          if (result.applied) {
            vscode.window.showInformationMessage("Commit applied");
          }
        } else if (action === "Edit") {
          const edited = await vscode.window.showInputBox({
            value: message,
            prompt: "Edit commit message",
          });
          if (edited) {
            await applyCommit(workspaceRoot, edited);
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );
}
