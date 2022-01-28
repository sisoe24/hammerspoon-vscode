import * as vscode from "vscode";
import * as lua from "./lua_parser";
import * as cp from "child_process";

import { HSCompletionProvider } from "./providers/hs_completion";
import { HsHoverProvider } from "./providers/hs_hover";
import { HsSignatureHelpProvider } from "./providers/hs_helper";

import { createNewDocs } from "./generate_hs_docs";

export function activate(context: vscode.ExtensionContext): void {
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
        vscode.commands.registerCommand("hammerspoon.updateDocs", () => {
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
