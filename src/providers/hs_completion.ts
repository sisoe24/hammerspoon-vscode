import * as vscode from "vscode";

import * as lua from "../lua_parser";
import * as hs from "../hammerspoon";
import * as utils from "./utils";

import { Logger } from "../logger";

const logger = new Logger("hsCompletion", "hsCompletion");
const hsModules = hs.hsModules();

/**
 * Hammerspoon completion provider class.
 */
export class HSCompletionProvider implements vscode.CompletionItemProvider {
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
        logger.debug(" -*- Init HSCompletionProvider -*-");

        this.position = position;

        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        logger.debug(`Line Prefix :: ${linePrefix}`);

        /**
         * Suggest module completion when line is a hammerspoon statement:
         * `local app = hs.`
         */
        const hsModule = /hs\.(?:\w+\.?)*$/.exec(linePrefix);
        if (hsModule) {
            return this.getModuleSuggestion(hsModule[0]);
        }

        /**
         * Suggest module completion when line is a hammerspoon statement:
         * `local app = hs.application('Code'):`
         */
        const hsModuleMethod = /(hs.+?)(\w+)(?=\()/.exec(linePrefix);
        if (hsModuleMethod) {
            return this.getMethodSuggestion(hsModuleMethod[1], hsModuleMethod[2]);
        }

        /**
         * Suggest module completion when line calls an indexable table:
         * local app = { hs.application() }
         * local window = app[1]:
         */
        const indexTable = /(\w+)((?:\[(\d+)\])+):$/.exec(linePrefix);
        if (indexTable) {
            return this.extractIndexTable(indexTable);
        }

        /**
         * Suggest module completion when line is a key-value table:
         * local app = { foo = hs.application() }
         * local window = app.foo:
         */
        const tableExpression = /(\w+)\.(.+?\b)?(\w+):$/.exec(linePrefix);
        if (tableExpression) {
            return this.extractTableMethodExpression(tableExpression);
        }

        /**
         * Suggest module completion when method calls expression is:
         * local window = app:mainWindow():
         */
        const methodExpression = /(\w+):(\w+)[^:]+:$/.exec(linePrefix);
        if (methodExpression) {
            return this.extractMethodExpression(methodExpression[1], methodExpression[2]);
        }

        /**
         * Suggest module completion when variable is an hs definition:
         * local app = hs.application()
         * local window = app:
         */
        const baseMethod = /(\w+):(\w+)*$/.exec(linePrefix);
        if (baseMethod) {
            return this.extractBaseMethod(baseMethod[1]);
        }

        return null;
    }

    /**
     * Get Modules suggestions.
     *
     * Examples:
     * * `hs.` will return all the suggestions for the entire hs module.
     * * `hs.alert` will return all the suggestions for the hs.alert module.
     * * `hs.appl` will try to find a valid module that starts with with the statement:
     * in this case will match `hs.application` and return the suggestions for it.
     *
     * @param statement string to parse for the completion
     * @returns a list of module suggestions or null
     */
    private getModuleSuggestion(statement: string): vscode.CompletionItem[] | null {
        logger.debug("Get Module Suggestion:", statement);

        if (hsModules.includes(statement)) {
            return hs.getModuleCompletion(statement);
        }

        // partial match is when a word is still not completed
        // so pressing ctrl space on a half word will still try to search for result
        for (const module of hsModules) {
            if (statement.startsWith(module)) {
                const partialMatch = /hs(?:.+?\.|\.)(?=\w+$)/.exec(statement);

                if (partialMatch) {
                    return hs.getModuleCompletion(partialMatch[0]);
                }
                return null;
            }
        }
        return null;
    }

    /**
     * Get the suggestions for a table index base expression.
     *
     * Examples:
     * * `table[1]:` will try to resolve table at index 1 and check if is a valid
     * hs statement. if yes will return its method suggestions.
     *
     * @param statement text to parse for the expression
     * @returns a list of module suggestions or null
     */
    private extractIndexTable(tableMatch: RegExpMatchArray): vscode.CompletionItem[] | null {
        logger.debug("Extract Table Index Expression:", tableMatch);

        const multiDimensional = tableMatch[2].match(/\d+/g) ?? [1];
        const depthLevel = multiDimensional.length;
        const index = multiDimensional[depthLevel - 1];

        const declaration = lua.findDeclaration({
            name: tableMatch[1],
            tableIndex: Number(index),
            tableDepthLevel: depthLevel,
            line: this.position.line,
        });

        if (declaration) {
            return hs.getMethodCompletion(declaration);
        }

        return null;
    }

    /**
     * Get the suggestions for a table method base expression.
     *
     * Examples:
     * * `table.foo:` will try to resolve table `foo` key and check if is a valid
     * hs statement. if yes will return its method suggestions.
     *
     * @param statement RegExpMatchArray of the match expression
     * @returns a list of module suggestions or null
     */
    private extractTableMethodExpression(
        tableMatch: RegExpMatchArray
    ): vscode.CompletionItem[] | null {
        logger.debug("Extract Table Method Expression:", tableMatch);

        const declaration = lua.findDeclaration({
            name: tableMatch[1],
            tableDepthLevel: utils.tableDepthLevel(tableMatch[2]),
            tableKey: tableMatch[3],
            line: this.position.line,
        });

        if (declaration) {
            return hs.getMethodCompletion(declaration);
        }

        return null;
    }

    /**
     * Get the method completions items.
     *
     * Examples:
     * * `base: hs, identifier: application` will return all methods for the application module.
     * * `base: hs.application, identifier: watcher` will return all methods for the hs.application.watcher module.
     *
     * @param base base module to search for the identifier.
     * @param identifier identifier to search inside the base module.
     * @returns a list of module suggestions or null
     */
    private getMethodSuggestion(base: string, identifier: string): vscode.CompletionItem[] | null {
        logger.debug("Get Method Suggestion:", base, identifier);

        const constructor = hs.getConstructor(base, identifier);
        if (constructor) {
            return hs.getMethodCompletion(constructor);
        }
        return null;
    }

    /**
     * Get Method Suggestion for a method expression.
     *
     * Examples:
     * * `focused:mainWindow():` will get try to get suggestions by resolving:
     * `base: focused, identifier: mainWindow`.
     *
     * @param base base hs module
     * @param identifier method to search inside the base module
     * @returns a list of module suggestions or null
     */
    private extractMethodExpression(
        base: string,
        identifier: string
    ): vscode.CompletionItem[] | null {
        logger.debug("Extract Method Expression:", base, identifier);

        const declaration = lua.findDeclaration({ name: base, line: this.position.line });
        if (declaration) {
            return this.getMethodSuggestion(declaration, identifier);
        }
        return null;
    }

    /**
     * Extract base method for suggestions.
     *
     * Examples:
     * * `chooser:` will try to get suggestions by resolving `chooser`
     *
     * @param caller text to parse for the expression.
     * @returns
     */
    private extractBaseMethod(caller: string): vscode.CompletionItem[] | null {
        logger.debug("Extract Base Method:", caller);

        const declaration = lua.findDeclaration({ name: caller, line: this.position.line });
        if (declaration) {
            return hs.getMethodCompletion(declaration);
        }
        return null;
    }
}
