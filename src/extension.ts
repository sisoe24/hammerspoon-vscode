import * as fs from "fs";
import * as vscode from "vscode";

import * as lua from "./providers/lua_parser";
import { createNewDocs } from "./providers/generate_hs_docs";
import { HsHoverProvider } from "./providers/hs_hover";
import { HsSignatureHelpProvider } from "./providers/hs_helper";
import { HSStringCompletionProvider } from "./providers/hs_string_completion";
import { HSModulesCompletionProvider } from "./providers/hs_module_completion";

import { logPath } from "./logger";
import { runSync } from "./run_cmd";
import { getConfig } from "./config";
import { hammerspoonToVscode } from "./console";
import { createSpoon, generateSpoonDoc } from "./spoons";
import { connectHammerspoon, createStatusBar } from "./socket";

/**
 * Register the legacy provider for the extension.
 *
 * The legacy providers are the original providers that were created for the extension.
 * However, it they been replaced by the new stubs EmmyLua.spoon. This method is
 * only called if the user has the setting `suggestions.enableLegacyProvider` set
 * to true. One reason might be that the user does not want to install the Lua
 * Language Server and EmmyLua.spoon (highly unlikely, but possible).
 *
 * @param context vscode extension context.
 */
function legacyProvider(context: vscode.ExtensionContext): void {
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
        vscode.commands.registerCommand("hammerspoon.updateDatabase", () => {
            createNewDocs();
        })
    );
}

export function activate(context: vscode.ExtensionContext): void {
    !fs.existsSync(logPath) && fs.mkdirSync(logPath);

    createStatusBar();

    if (getConfig("suggestions.enableLegacyProvider") as boolean) {
        legacyProvider(context);
    }

    context.subscriptions.push(
        vscode.commands.registerCommand("hammerspoon.addStubs", () => {
            console.log("addStubs");
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
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
