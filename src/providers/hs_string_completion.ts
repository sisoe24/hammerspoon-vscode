import * as vscode from "vscode";
import * as hs from "./hammerspoon";

import { Logger } from "../logger";

const logger = new Logger("hsStringCompletion", "hsStringCompletion");

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
            return hs.getSpoonsDirectory();
        }
        return null;
    }
}
