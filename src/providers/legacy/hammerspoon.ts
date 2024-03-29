import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import * as vscode from "vscode";

const hsDocsPath = path.join(
    path.resolve(__dirname, "../../.."),
    "resources",
    "hs_docs"
);

const dataTypes: { [key: string]: vscode.CompletionItemKind } = {
    variable: vscode.CompletionItemKind.Variable,
    function: vscode.CompletionItemKind.Function,
    method: vscode.CompletionItemKind.Method,
    module: vscode.CompletionItemKind.Module,
    field: vscode.CompletionItemKind.Field,
    constant: vscode.CompletionItemKind.Constant,
    constructor: vscode.CompletionItemKind.Constructor,
};

/**
 * Get the list of all hs modules.
 *
 * @returns list of all hs modules
 */
export function hsModules(): string[] {
    const modules: string[] = [];

    fs.readdirSync(hsDocsPath, { withFileTypes: true })
        .filter((dirent) => dirent.isFile())
        .map((dirent) => dirent.name)
        .forEach((file) => {
            if (file.endsWith("json")) {
                modules.push(file.replace("json", ""));
            }
        });

    return modules;
}

/**
 * Get the hs module and return the corresponding data.
 *
 * @param name name of the module to parse
 * @returns object data for the hs module
 */
function parseModule(name: string): {
    [key: string]: { [key: string]: string };
} | null {
    name = name.endsWith(".") ? name : name + ".";
    const file = path.join(hsDocsPath, name + "json");

    if (!fs.existsSync(file)) {
        return null;
    }

    return JSON.parse(fs.readFileSync(file, "utf-8"));
}

/**
 * Get all of item of a module to suggest as autocompletion.
 *
 * @param name name of the hs module to parse
 * @param isMethod true if completion should return only methods, false if completion
 * should return every but methods.
 * @returns a list of completion suggestions or null
 */
function getCompletion(
    name: string,
    isMethod: boolean
): vscode.CompletionItem[] | null {
    const moduleData = parseModule(name);
    if (!moduleData) {
        return null;
    }

    const items: vscode.CompletionItem[] = [];
    for (const [module, data] of Object.entries(moduleData)) {
        if (!isMethod && data.type === "Method") {
            continue;
        }

        if (isMethod && data.type !== "Method") {
            continue;
        }

        const submodule = new vscode.CompletionItem(
            module,
            dataTypes[data.type.toLowerCase()]
        );

        submodule.documentation = data.doc;
        items.push(submodule);
    }

    return items;
}

/**
 * Get completion suggestions for a module
 *
 * @param name name of the module
 * @returns a list of completion suggestions or null
 */
export function getModuleCompletion(
    name: string
): vscode.CompletionItem[] | null {
    return getCompletion(name, false);
}

/**
 * Get completion suggestions for a module
 *
 * @param name name of the module
 * @returns a list of completion suggestions or null
 */
export function getMethodCompletion(
    name: string
): vscode.CompletionItem[] | null {
    return getCompletion(name, true);
}

/**
 * Parse the return to extract its value.
 *
 * If text contains an hs.declaration will return that, otherwise the entire match.
 *
 * @param text the text to parse for the return
 * @returns the parsed return string.
 */
function parseReturn(text: string): string | null {
    if (/->/.test(text)) {
        const hsReturn = text.replace(/(.+?)?->/, "");

        const searchHsModule = /(hs(?:\.(?:\w+))+)(?=.+\bobject\b)/.exec(
            hsReturn
        );
        if (searchHsModule) {
            return searchHsModule[0];
        }
        return hsReturn.trim();
    }

    return null;
}

/**
 * Get the constructor for a given module.
 *
 * Example: `hs` will be a module and `application` will be the property. This
 * will return the constructor for the `hs.application` object.
 *
 * Example 2: `hs.application` will be a module and `new` will be the property. This
 * will return the return of the method
 *
 * @param base name of the module
 * @param identifier name of the module method/attribute/function/property
 * @returns the hs constructor or null.
 */
export function getConstructor(
    base: string,
    identifier: string
): string | null {
    const moduleData = parseModule(base);
    if (!moduleData) {
        return null;
    }

    if (Object.prototype.hasOwnProperty.call(moduleData, identifier)) {
        const key = moduleData[identifier];

        if (key["type"] === "Constructor") {
            return base.replace(/\.$/, "");
        }

        if (Object.prototype.hasOwnProperty.call(key, "def")) {
            return parseReturn(key["def"]);
        }
    }
    return null;
}

/**
 * Get the documentation for a hs module.
 *
 * @param base base module name to parse for the identifier
 * @param identifier method to search in the base module
 * @returns the documentation or null
 */
export function getDocumentation(
    base: string,
    identifier: string
): string | null {
    const moduleData = parseModule(base);
    if (!moduleData) {
        return null;
    }

    if (Object.prototype.hasOwnProperty.call(moduleData, identifier)) {
        const key = moduleData[identifier];

        if (Object.prototype.hasOwnProperty.call(key, "doc")) {
            return key["doc"];
        }
    }
    return null;
}

/**
 * Get the helper data for a hs module.
 *
 * Create an object with data needed for the helper provider like: function documentation,
 * function definition and function parameters.
 *
 * Keys:
 * * `doc`: string;
 * * `def`: string;
 * * `parameters`: string;
 *
 * @param base base module name to parse for the identifier
 * @param identifier method to search in the base module
 * @returns an object with the helper data or null
 */
export function getHelperData(
    base: string,
    identifier: string
): {
    doc: string;
    def: string;
    parameters: string;
} | null {
    const moduleData = parseModule(base);
    if (!moduleData) {
        return null;
    }

    const helper = {
        doc: "",
        def: "",
        parameters: "",
    };

    if (Object.prototype.hasOwnProperty.call(moduleData, identifier)) {
        const key = moduleData[identifier];

        if (Object.prototype.hasOwnProperty.call(key, "doc")) {
            helper["doc"] = key["doc"];
        }

        if (Object.prototype.hasOwnProperty.call(key, "def")) {
            helper["def"] = key["def"];
        }

        if (Object.prototype.hasOwnProperty.call(key, "parameters")) {
            helper["parameters"] = key["parameters"];
        }
    }

    return helper;
}
