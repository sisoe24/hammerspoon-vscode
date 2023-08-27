import * as vscode from "vscode";
import * as path from "path";
import { readFileSync, createWriteStream, mkdirSync, rmdirSync } from "fs";

export const root = path.resolve(__dirname, "../../../");
export const packageFile = readFileSync(
    path.join(root, "package.json"),
    "utf-8"
);

export const testsPath = path.join(root, ".tests");
export const hsDocsPath = path.join(
    path.resolve(__dirname, "../../.."),
    "resources",
    "hs_docs"
);

/**
 * Some tests will need to wait for vscode to register the actions. An example will
 * be creating/killing terminals and configuration update.
 *
 * @param milliseconds - time to sleep
 * @returns
 */
export const sleep = (milliseconds: number): Promise<unknown> => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/**
 * Configuration changes require async/await operation to let vscode register
 * the action.
 *
 * @param name - name of the configuration property to update.
 * @param value - the new value for the property.
 */
export async function updateConfig(
    name: string,
    value: unknown
): Promise<void> {
    const config = vscode.workspace.getConfiguration("hammerspoon");
    await config.update(name, value, vscode.ConfigurationTarget.Workspace);
}

/**
 * Open and focus a demo file.
 *
 * @param filename the name of a file to open.
 * @param line optional line number for the cursor to start at. Defaults to `0` which would be line `1`.
 * @param startChar optional position for the cursor to start at. Defaults to `0`
 * @param endChar optional position for the cursor to end at. If bigger than startChar,
 * will create a selection. Defaults to `0`
 */
export async function focusDemoFile(
    filename: string,
    line = 0,
    startChar = 0,
    endChar = 0
): Promise<vscode.TextEditor> {
    const filepath = path.join(testsPath, filename);
    const document = await vscode.workspace.openTextDocument(filepath);

    const startSelection = new vscode.Position(line, startChar);

    let endSelection = null;
    if (endChar) {
        endSelection = new vscode.Position(line, endChar);
    }
    const editor = await vscode.window.showTextDocument(document, {
        selection: new vscode.Selection(
            startSelection,
            endSelection || startSelection
        ),
    });

    return editor;
}

export function createDemoFolder(): void {
    mkdirSync(testsPath, { recursive: true });
    mkdirSync(path.join(testsPath, ".vscode"), { recursive: true });
    mkdirSync(path.join(testsPath, ".hammerspoon", "Spoons"), { recursive: true });
    mkdirSync(path.join(testsPath, "tests"), { recursive: true });
}

export function cleanDemoFolder(): void {
    rmdirSync(testsPath, { recursive: true });
}


/**
 * Create a demo file and write the content to it.
 *
 * If file doesn't exist, will get created, otherwise just updated with the new content.
 * Function will sleep 100ms before returning.
 *
 * @param filename name of the file demo to write the content to.
 * @param content  the content to write.
 */
export async function createDemoContent(
    filename: string,
    content: string
): Promise<void> {
    const filepath = path.join(testsPath, filename);

    const file = createWriteStream(filepath);
    file.write(content);
    file.close();

    await sleep(200);
}

/**
 * Clean the settings.json file inside the demo folder.
 */
export function cleanSettings(): void {
    const file = path.join(".vscode", "settings.json");
    void createDemoContent(file, "{}");
}

/**
 * Format file content.
 *
 * This is a utility function that allows to write multi line string with indentation.
 *
 * @param content file content to format
 * @returns un indented file content
 */
export function formatContent(content: string): string {
    return content.trim().replace(/ {2,}/gm, "");
}

/**
 * Open a hammerspoon module file.
 *
 * @param module name of the hammerspoon module to open
 * @returns the JSON representation of the hammerspoon module
 */
export function openModule(module: string): {
    [key: string]: { [key: string]: string };
} {
    const file = path.join(hsDocsPath, module + ".json");
    return JSON.parse(readFileSync(file, "utf-8"));
}

/**
 * Get the documentation for a hammerspoon module.
 *
 * @param module name of the hammerspoon module to open
 * @param identifier name of the method to search in the module.
 * @returns
 */
export function getDoc(module: string, identifier: string): string {
    return openModule(module)[identifier]["doc"];
}
