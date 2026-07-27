import * as vscode from "vscode";
import { commitCommand } from "./commands/commit.js";
import { docCommand } from "./commands/doc.js";
import { initCommand } from "./commands/init.js";

export function activate(context: vscode.ExtensionContext) {
  const commit = vscode.commands.registerCommand("aigit.commit", () =>
    commitCommand(),
  );
  const doc = vscode.commands.registerCommand("aigit.doc", () =>
    docCommand(),
  );
  const init = vscode.commands.registerCommand("aigit.init", () =>
    initCommand(),
  );

  context.subscriptions.push(commit, doc, init);
}

export function deactivate() {}
