import * as vscode from "vscode";
import * as lua from "./lua_parser";
import * as cp from "child_process";
import * as fs from "fs";

import { HSCompletionProvider } from "./providers/hs_completion";
import { HsHoverProvider } from "./providers/hs_hover";
import { HsSignatureHelpProvider } from "./providers/hs_helper";

import { logPath } from "./logger";
import { createNewDocs } from "./generate_hs_docs";

export function activate(context: vscode.ExtensionContext): void {
    !fs.existsSync(logPath) && fs.mkdirSync(logPath);

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider("lua", new HSCompletionProvider(), ".", ":")
    );

    context.subscriptions.push(
        vscode.languages.registerHoverProvider("lua", new HsHoverProvider())
    );

    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider(
            "lua",
            new HsSignatureHelpProvider(),
            "(",
            ","
        )
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(() => {
            lua.updateAst();
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(() => {
            lua.updateAst();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("hammerspoon.updateDatabase", () => {
            createNewDocs();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("hammerspoon.reloadConfiguration", () => {
            cp.exec("hs -c 'hs.reload()'", (err, stdout, stderr) => {
                if (err) {
                    vscode.window.showErrorMessage(err.message);
                }
            });
        })
    );
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
