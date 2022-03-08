import * as vscode from "vscode";

import * as hs from "../hammerspoon";
import * as lua from "../lua_parser";
import * as utils from "./utils";

import { Logger } from "../logger";

const logger = new Logger("hsHover", "hsHover");

/**
 * Hammerspoon hover provider.
 */
export class HsHoverProvider implements vscode.HoverProvider {
    position = new vscode.Position(0, 0);
    isVariableInitialization = false;
    hsConstructor = "";

    /**
     * Initialize the provider.
     *
     * @param document vscode TextDocument
     * @param position cursor position
     * @returns the provider result or null
     */
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Hover> {
        logger.cleanFile();
        logger.debug("-*- Init HoverProvider -*-");

        this.hsConstructor = "";
        this.isVariableInitialization = false;
        this.position = position;

        const hoverWord = document.getWordRangeAtPosition(position);
        if (!hoverWord) {
            return null;
        }

        let word = document.getText(hoverWord);
        if (lua.luaKeywords["keywords"].includes(word)) {
            return;
        }

        let linePrefix = document.lineAt(position).text.substring(0, hoverWord.end.character);

        // clean parenthesis
        linePrefix = linePrefix.replace(/\(.*?\)/g, "");
        logger.debug("LinePrefix:", linePrefix);

        /**
         * When hovering over a variable that on the initialization side,
         * change linePrefix and word:
         *
         * Example:
         * local foo = hs.application()
         *
         * Hovering over foo will grab hs.application and set it to the new linePrefix
         * so the logic will continue till another match happens.
         *
         */
        const initialization = /^(?:local )?(\w+)$/.exec(linePrefix.trim());
        if (initialization) {
            logger.debug("Word isVariableInitialization", initialization);
            const lineText = document.lineAt(position.line).text;

            // get everything after the = symbol
            const declaration = lineText.match(/(?<== ).+/);

            if (declaration) {
                this.isVariableInitialization = true;

                // clean parenthesis
                linePrefix = declaration[0].replace(/\(.*?\)/g, "");
                logger.debug("New linePrefix", linePrefix);

                // if it fails to match any of the above regex, then will try
                // to match if is a variable declaration.
                word = linePrefix;
            }
        }

        /**
         * Show doc hover when line has an inline hs statement:
         * `local app = hs.application()`
         * `local window = hs.application():mainWindow()`
         */
        const hsModule = /(hs(?:.+)?(?::|\.))(\w+)$/.exec(linePrefix);
        if (hsModule) {
            return this.extractHsModule(hsModule[1], hsModule[2]);
        }

        /**
         * Show doc hover when line is a method with a call expression:
         * `caller:method():method`
         */
        const methodCallExpression = /(?<!\.)\b(\w+):(\w+):(\w+)/.exec(linePrefix);
        if (methodCallExpression) {
            return this.extractMethodCallExpression(methodCallExpression);
        }

        /**
         * Show doc hover when line has caller:method
         */
        const methodExpression = /(?<!\.)\b(\w+):(\w+)$/.exec(linePrefix);
        if (methodExpression) {
            return this.extractMethodExpression(methodExpression[1], methodExpression[2]);
        }

        /**
         * Show doc hover when method call is from indexable table:
         * local window = app[1]:getWindow()
         */
        const indexTable = /(\w+)((?:\[(\d+)\])+):(\w+)/.exec(linePrefix);
        if (indexTable) {
            return this.extractIndexTable(indexTable);
        }

        /**
         * Show doc hover when line has table.key:method
         */
        const tableMethodExpression = /(\w+)\.(.+?\b)?(\w+):(\w+)/.exec(linePrefix);
        if (tableMethodExpression) {
            return this.extractTableMethodExpression(tableMethodExpression);
        }

        /**
         * Show doc hover when line is table expression: foo.bar.foo
         */
        const tableExpression = /(\w+)\.([^\(]+\b)?(\w+)$/.exec(linePrefix);
        if (tableExpression) {
            return this.extractTableExpression(tableExpression);
        }

        return this.variableDeclaration(word);
    }

    /**
     * Show the documentation for an hs statement.
     *
     * If variable is a method will return the documentation, if is a initialization
     * will return the constructor.
     *
     * Examples when hovering on words:
     * * `hs.application`
     * * `hs.application():window`
     *
     * @param base hs base module containing the method
     * @param identifier method to search in the base module
     * @returns a vscode hover information or null
     */
    private extractHsModule(base: string, identifier: string): vscode.Hover | null {
        logger.debug("Extract HS Module:", base, identifier);

        // clean parenthesis and arguments if any
        base = base.replace(":", "");

        if (this.isVariableInitialization) {
            return this.getConstructor(base, identifier);
        }

        return this.getHoverDocs(base, identifier);
    }

    /**
     * Show the documentation for a method expression.
     *
     * Examples: when hovering on `setSize`:
     * * `app:getWindow():setSize()`
     *
     * @param methodCallExpression regex match array with the expression
     * @returns a vscode hover information or null
     */
    private extractMethodCallExpression(
        methodCallExpression: RegExpMatchArray
    ): vscode.Hover | null {
        // TODO: args should be: base, identifier, method

        logger.debug("Extract Method Call Expression:", methodCallExpression);

        const declaration = lua.findDeclaration({
            name: methodCallExpression[1],
            line: this.position.line,
        });

        if (declaration) {
            const constructor = hs.getConstructor(declaration, methodCallExpression[2]);
            if (constructor) {
                if (this.isVariableInitialization) {
                    return this.getConstructor(constructor, methodCallExpression[3]);
                }

                return this.getHoverDocs(constructor, methodCallExpression[3]);
            }
        }
        return null;
    }

    /**
     * Show the documentation for a method expression.
     *
     * If variable is a method will return the documentation, if is a initialization
     * will return the constructor.
     *
     * Example: when hovering on `getWindow`:
     * * `app:getWindow`
     *
     * @param base hs base module containing the method
     * @param identifier method to search in the base module
     * @returns a vscode hover information or null
     */
    private extractMethodExpression(base: string, identifier: string): vscode.Hover | null {
        logger.debug("Extract Method Expression:", base, identifier);

        const declaration = lua.findDeclaration({ name: base, line: this.position.line });

        if (declaration) {
            if (this.isVariableInitialization) {
                return this.getConstructor(declaration, identifier);
            }
            return this.getHoverDocs(declaration, identifier);
        }

        return null;
    }

    /**
     * Show documentation of method inside indexable table.
     *
     * Examples:
     * * `table[1]:` will try to resolve table at index 1 and check if is a valid
     * hs statement
     *
     * @param statement text to parse for the expression
     * @returns the documentation hover or null.
     */
    private extractIndexTable(tableMatch: RegExpMatchArray): vscode.Hover | null {
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
            const identifier = tableMatch[4];
            return this.getHoverDocs(declaration, identifier);
        }

        return null;
    }

    /**
     * Get documentation hover for a table method expression.
     *
     * If variable is a method will return the documentation, if is a initialization
     * will return the constructor.
     *
     *
     * Example: when hovering on `activate`:
     * `foo.bar:activate`
     *
     * @param tableMatch regex match array with the expression
     * @returns
     */
    private extractTableMethodExpression(tableMatch: RegExpMatchArray): vscode.Hover | null {
        logger.debug("Extract Table Method Expression", tableMatch);

        const declaration = lua.findDeclaration({
            name: tableMatch[1],
            tableDepthLevel: utils.tableDepthLevel(tableMatch[2]),
            tableKey: tableMatch[3],
            line: this.position.line,
        });

        if (declaration) {
            const identifier = tableMatch[4];

            if (this.isVariableInitialization) {
                return this.getConstructor(declaration, identifier);
            }

            return this.getHoverDocs(declaration, identifier);
        }

        return null;
    }

    /**
     * Get documentation hover for a table key.
     *
     * If variable is a method will return the documentation, if is a initialization
     * will return the constructor.
     *
     *
     * Example: when hovering on `bar`:
     * `foo.bar`
     *
     * @param tableMatch regex match array with the expression
     * @returns
     */
    private extractTableExpression(tableMatch: RegExpMatchArray): vscode.Hover | null {
        logger.debug("Extract Table Expression", tableMatch);

        const declaration = lua.findDeclaration({
            name: tableMatch[1],
            tableKey: tableMatch[3],
            tableDepthLevel: utils.tableDepthLevel(tableMatch[2]),
            line: this.position.line,
        });

        if (declaration) {
            return this.convertToCodeBlock(declaration);
        }
        return null;
    }

    /**
     * Search for a base variable.
     *
     * @param base variable name to search for declaration
     * @returns
     */
    private variableDeclaration(base: string): vscode.Hover | null {
        logger.debug("Search variable declaration:", base);
        const declaration = lua.findDeclaration({ name: base, line: this.position.line });

        if (declaration) {
            return this.convertToCodeBlock(declaration);
        }

        return null;
    }

    /**
     * Get the hover documentation for an hs module.
     *
     * @param base base module
     * @param identifier method inside the base module
     * @returns The hover documentation or null.
     */
    private getHoverDocs(base: string, identifier: string): vscode.Hover | null {
        const docs = hs.getDocumentation(base, identifier);
        if (docs) {
            return new vscode.Hover(docs);
        }
        return null;
    }

    /**
     * Convert some text into markdown code block.
     *
     * @param text text to convert into a markdown code block hover sign.
     * @returns
     */
    private convertToCodeBlock(text: string): vscode.Hover {
        /**
         * Because I dont know how to get the markdown string hover content, I need
         * a way to test that the hover returns the expected constructor, so I am
         * assigning the constructor to an internal attribute to be later verified
         * in the tests.
         */
        this.hsConstructor = text;

        const s = new vscode.MarkdownString();
        s.appendCodeblock(text);
        return new vscode.Hover(s);
    }

    /**
     * Get hs module constructor.
     *
     * @param base base name of the module
     * @param identifier method to search in the base module.
     * @returns
     */
    private getConstructor(base: string, identifier: string): vscode.Hover | null {
        const constructor = hs.getConstructor(base, identifier);
        if (constructor) {
            return this.convertToCodeBlock(constructor);
        }
        return null;
    }
}
