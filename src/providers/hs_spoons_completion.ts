import * as fs from "fs";
import * as os from "os";
import * as vscode from "vscode";

import { getSpoonRootDir } from "../spoons";
import { Logger } from "../logger";

const logger = new Logger("hsStringCompletion", "hsStringCompletion");

/**
 * Show the Spoons directories suggestion.
 *
 * @returns a list of completion suggestions
 */
export function getSpoonsDirectory() {
    const items: vscode.CompletionItem[] = [];

    // getSpoonRootDir might be the same as the default, so use a Set to avoid duplicate
    const spoonsDir = new Set([
        getSpoonRootDir(),
        `${os.homedir()}/.hammerspoon/Spoons`,
    ]);

    for (const dir of spoonsDir) {
        const spoonDir = fs.readdirSync(dir);

        spoonDir.forEach((spoon) => {
            if (spoon.endsWith(".spoon")) {
                const file = fs.readFileSync(
                    `${dir}/${spoon}/init.lua`,
                    "utf-8"
                );
                spoon = spoon.replace(".spoon", "");

                const spoonItem = new vscode.CompletionItem(
                    spoon,
                    vscode.CompletionItemKind.Value
                );
                spoonItem.detail = dir;

                const matchDoc = /^---.+?(?=local)/s.exec(file);
                if (matchDoc) {
                    spoonItem.documentation = matchDoc[0];
                }

                items.push(spoonItem);
            }
        });
    }
    return items;
}

/**
 * Hammerspoon string completion provider class.
 */
export class HSStringCompletionProvider
    implements vscode.CompletionItemProvider
{
    position: vscode.Position = new vscode.Position(0, 0);

    /**
     * Initialize the provider.
     *
     * @param document vscode TextDocument
     * @param position cursor position
     * @returns the provider result or null
     */
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[]> {
        logger.cleanFile();
        logger.debug(" -*- Init HSStringCompletionProvider -*-");
        const linePrefix = document
            .lineAt(position)
            .text.substring(0, position.character);

        /**
         * Suggest string completion if line is `hs.loadSpoon(`
         */
        const loadSpoon = /(?<=hs\.loadSpoon\()/.exec(linePrefix);
        if (loadSpoon) {
            return getSpoonsDirectory();
        }
        return null;
    }
}
