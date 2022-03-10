import * as vscode from "vscode";
import * as lua from "./lua_parser";
import * as fs from "fs";

import { HSModulesCompletionProvider } from "./providers/hs_module_completion";
import { HSStringCompletionProvider } from "./providers/hs_string_completion";
import { HsHoverProvider } from "./providers/hs_hover";
import { HsSignatureHelpProvider } from "./providers/hs_helper";

import * as utils from "./utils";
import * as cp from "child_process";

import { logPath } from "./logger";
import { createNewDocs } from "./generate_hs_docs";
import { createSpoon, generateSpoonDoc } from "./spoons";

const outputWindow = vscode.window.createOutputChannel("Hammerspoon");

export function activate(context: vscode.ExtensionContext): void {
    !fs.existsSync(logPath) && fs.mkdirSync(logPath);

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
        vscode.commands.registerCommand("hammerspoon.reloadConfiguration", async () => {
            outputWindow.clear();
            const focusOutput = utils.hammerspoonConfig("console.focusOutputWindow");

            if (focusOutput) {
                outputWindow.show();
            }

            await utils.execCommand("hs -c 'hs.reload()'");
            const output = cp.execSync("hs -c 'hs.console.getConsole()'", { encoding: "utf-8" });

            if (output) {
                outputWindow.append(output);
            }
        })
    );
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
