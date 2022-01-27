import * as vscode from "vscode";

import * as hs from "../hammerspoon";
import * as lua from "../lua_parser";
import * as utils from "./utils";

import { Logger } from "../logger";
const logger = new Logger("hsHelper", "hsHelper");

/**
 * Hammerspoon function helper provider.
 */
export class HsSignatureHelpProvider implements vscode.SignatureHelpProvider {
    position: vscode.Position = new vscode.Position(0, 0);
    argsPosition = 0;

    /**
     * Initialize the provider.
     *
     * @param document vscode TextDocument
     * @param position cursor position
     * @returns the provider result or null
     */
    provideSignatureHelp(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.SignatureHelp> {
        logger.cleanFile();
        logger.debug("-*- Init HelpProvider -*-");

        this.position = position;

        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        logger.debug("linePrefix:", linePrefix);

        this.setArgsCursorPosition(linePrefix, document);

        /**
         * `local window = hs.application():mainWindow(`
         */
        const hsModule = /(hs(?:.+)?(?::|\.))(\w+)/.exec(linePrefix);
        if (hsModule) {
            return this.extractHsModule(hsModule[1], hsModule[2]);
        }

        /**
         * caller:method():method()
         */
        const methodCallExpression = /(?<!\.)\b(\w+):(?:(\w+)[^:]+:)(\w+)[^\)]+$/.exec(linePrefix);
        if (methodCallExpression) {
            return this.extractMethodCallExpression(methodCallExpression);
        }

        /**
         * Show doc hover when line has caller:method
         */
        const methodExpression = /(?<!\.)\b(\w+):(\w+)(?=\()/.exec(linePrefix);
        if (methodExpression) {
            return this.extractMethodExpression(methodExpression[1], methodExpression[2]);
        }

        /**
         * Show doc hover when line has table.key:method
         */
        const tableMethodExpression = /(\w+)\.(.+?\b)?(\w+):(\w+)/.exec(linePrefix);
        if (tableMethodExpression) {
            return this.extractTableMethodExpression(tableMethodExpression);
        }

        return null;
    }

    /**
     * Show the documentation for an hs method.
     *
     * Examples when opening parenthesis for activate:
     * * `hs.application():activate(`
     *
     * @param base hs base module containing the method
     * @param identifier method to search in the base module
     * @returns a vscode signature helper or null
     */
    private extractHsModule(base: string, identifier: string): vscode.SignatureHelp | null {
        logger.debug("Extract HS Module:", base, identifier);

        // clean parenthesis and arguments if any
        base = base.replace(/\(.*?\):/g, "");

        return this.getHoverDocs(base, identifier);
    }

    /**
     * Show the documentation for a method expression.
     *
     * Examples: when hovering on `setSize`:
     * * `app:getWindow():setSize()`
     *
     * @param methodCallExpression regex match array with the expression
     * @returns a vscode signature help information or null
     */
    private extractMethodCallExpression(
        methodCallExpression: RegExpMatchArray
    ): vscode.SignatureHelp | null {
        // TODO: args should be: base, identifier, method

        logger.debug("Extract Method Call Expression:", methodCallExpression);

        const declaration = lua.findDeclaration({
            name: methodCallExpression[1],
            line: this.position.line,
        });

        if (declaration) {
            const constructor = hs.getConstructor(declaration, methodCallExpression[2]);
            if (constructor) {
                return this.getHoverDocs(constructor, methodCallExpression[3]);
            }
        }
        return null;
    }

    /**
     * Show the documentation for a method expression.
     *
     * Example: when hovering on `getWindow`:
     * * `app:getWindow`
     *
     * @param base hs base module containing the method
     * @param identifier method to search in the base module
     * @returns a vscode signature help information or null
     */
    private extractMethodExpression(base: string, identifier: string): vscode.SignatureHelp | null {
        logger.debug("Extract Method Expression:", base, identifier);

        const declaration = lua.findDeclaration({ name: base, line: this.position.line });

        if (declaration) {
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
    private extractTableMethodExpression(
        tableMatch: RegExpMatchArray
    ): vscode.SignatureHelp | null {
        logger.debug("Extract Table Method Expression", tableMatch);

        const declaration = lua.findDeclaration({
            name: tableMatch[1],
            tableDepthLevel: utils.tableDepthLevel(tableMatch[2]),
            tableKey: tableMatch[3],
            line: this.position.line,
        });

        if (declaration) {
            const identifier = tableMatch[4];
            return this.getHoverDocs(declaration, identifier);
        }

        return null;
    }

    /**
     * Set the cursor position for signature helper arguments.
     *
     * When inside the signature helper, move the cursor position into the appropriate
     * argument selection based on at which argument position the cursor is under.
     *
     * @param linePrefix current text linde under the cursor position.
     * @param document vscode text editor document object.
     */
    private setArgsCursorPosition(linePrefix: string, document: vscode.TextDocument): void {
        const parenthesisIndex = /\((?!.+\()/.exec(linePrefix);

        if (parenthesisIndex && parenthesisIndex.index) {
            const start = new vscode.Position(this.position.line, parenthesisIndex.index + 1);
            const end = new vscode.Position(this.position.line, this.position.character);

            const argsRange = new vscode.Selection(start, end);
            const word = document.getText(argsRange).split(",");

            this.argsPosition = word.length;
        }
    }

    /**
     *
     * @param base base module name to search for the identifier.
     * @param identifier  method to search in the base module.
     * @returns the signature helper or null.
     */
    private getHoverDocs(base: string, identifier: string): vscode.SignatureHelp | null {
        const data = hs.getHelperData(base, identifier);

        if (data) {
            let argsDefinition = "";
            const argsMatch = /\((.*)\).*/.exec(data.def);
            if (argsMatch) {
                argsDefinition = argsMatch[0];
            }

            const argsParameters: vscode.ParameterInformation[] = [];
            for (const param of data.parameters) {
                const argName = /(?<=\*\s)`?(\w+)/.exec(param);
                const argDoc = /(?<=\*\s.+-\s)(.+)/.exec(param);

                if (argName && argDoc) {
                    argsParameters.push(new vscode.ParameterInformation(argName[1], argDoc[0]));
                }
            }

            const signInfo = new vscode.SignatureInformation(argsDefinition);
            signInfo.parameters = argsParameters;
            signInfo.activeParameter = this.argsPosition - 1;

            const signature = new vscode.SignatureHelp();
            signature.signatures = [signInfo];
            return signature;
        }

        return null;
    }
}
