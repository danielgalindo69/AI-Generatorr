import * as vscode from "vscode";
import { getProjectConfig, saveProjectConfig } from "@aigit/core";
import type { AigitConfig } from "@aigit/core";

export async function initCommand() {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage("No workspace folder open");
    return;
  }

  const provider = await vscode.window.showQuickPick(
    [
      { label: "Gemini (Google)", description: "Free 60 req/min" },
      { label: "Groq", description: "Free 30 req/min, fast" },
      { label: "Ollama", description: "100% local, free" },
    ],
    { placeHolder: "Select AI provider" },
  );
  if (!provider) return;

  let apiKey: string | undefined;
  if (provider.label !== "Ollama") {
    apiKey = await vscode.window.showInputBox({
      prompt: `Enter your ${provider.label} API key`,
      password: true,
      placeHolder: provider.label === "Gemini (Google)" ? "AIza..." : "gsk_...",
    });
    if (!apiKey) return;
  }

  const language = await vscode.window.showQuickPick(
    ["es", "en"],
    { placeHolder: "Preferred language for commits" },
  );
  if (!language) return;

  const config: AigitConfig = {
    aiProvider: provider.label === "Gemini (Google)" ? "gemini" : provider.label === "Groq" ? "groq" : "ollama",
    apiKey,
    language,
    commitStyle: "conventional",
  };

  saveProjectConfig(workspaceRoot, config);
  vscode.window.showInformationMessage(".aigit.json created");
}
