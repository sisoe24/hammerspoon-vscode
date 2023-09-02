import * as vscode from "vscode";
import * as lua from "./lua_parser";
import * as fs from "fs";

import { HSModulesCompletionProvider } from "./providers/hs_module_completion";
import { HSStringCompletionProvider } from "./providers/hs_string_completion";
import { HsHoverProvider } from "./providers/hs_hover";
import { HsSignatureHelpProvider } from "./providers/hs_helper";

import { logPath } from "./logger";
import { createNewDocs } from "./generate_hs_docs";
import { createSpoon, generateSpoonDoc } from "./spoons";
import { connectHammerspoon, createStatusBar } from "./socket";
import { runSync } from "./run_cmd";
import { hammerspoonToVscode } from "./console";
import { executeSelectedText } from "./executer";

export function activate(context: vscode.ExtensionContext): void {
    !fs.existsSync(logPath) && fs.mkdirSync(logPath);

    createStatusBar();

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            "lua",
            new HSModulesCompletionProvider(),
            ".",
            ":"
        )
    );

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            "lua",
            new HSStringCompletionProvider(),
            '"',
            "'"
        )
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
        vscode.commands.registerCommand("hammerspoon.connect", () => {
            connectHammerspoon();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("hammerspoon.createSpoon", () => {
            void createSpoon();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("hammerspoon.generateSpoonDoc", () => {
            generateSpoonDoc();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("hammerspoon.updateDatabase", () => {
            createNewDocs();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "hammerspoon.reloadConfiguration",
            () => {
                hammerspoonToVscode();
            }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("hammerspoon.showConsole", () => {
            runSync("hs -c 'hs.openConsole()'");
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "hammerspoon.executeSelectedText",
            () => {
                executeSelectedText();
            }
        )
    );
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
