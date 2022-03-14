import * as vscode from "vscode";
import * as path from "path";
import * as cp from "child_process";

export const languagePath = path.resolve(__dirname, "../resources");
export const outputWindow = vscode.window.createOutputChannel("Hammerspoon");

/**
 * Get configuration property value.
 *
 * If property name is not found, throws an error.
 *
 * @param property - name of the configuration property to get.
 * @returns - the value of the property.
 */
export function hammerspoonConfig(property: string): unknown {
    const config = vscode.workspace.getConfiguration("hammerspoon");
    const subConfig = config.get(property);

    if (typeof subConfig === "undefined") {
        throw new Error(`Configuration: ${property} doesn't exist`);
    }

    return subConfig;
}

/**
 * Append text to vscode console
 *
 * @param text text to append in console
 */
function writeToConsole(text: string): void {
    outputWindow.clear();
    outputWindow.show();
    outputWindow.appendLine(text);
}

/**
 * Execute async shell command.
 *
 * @param cmd the command the execute.
 * @param timeout optional timeout in ms for the promise to resolve: defaults to 200ms.
 * @returns A promise<boolean> after 200ms of timeout if resolves.
 */
export async function execAsync(cmd: string, timeout = 200): Promise<string> {
    let result = "";

    cp.exec(cmd, (err, stdout, stderr) => {
        if (stdout) {
            result = stdout;
            writeToConsole(stdout);
        }
        if (stderr) {
            vscode.window.showErrorMessage(stderr);
            return null;
        }
        if (err) {
            vscode.window.showErrorMessage(err.message);
            return null;
        }
    });

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(result);
        }, timeout);
    });
}

/**
 * Execute sync shell command.
 *
 * If command fails, will show a popup error message.
 *
 * @param cmd the command the execute.
 * @returns A string with stdout if any, or null if error.
 */
export function execSync(cmd: string): string | null {
    let result = "";
    try {
        result = cp.execSync(cmd, { encoding: "utf-8" });
    } catch (error) {
        let msg = "";

        if (error instanceof Error) {
            msg = error.message;
        } else {
            msg = `Some unknown error has occurred when running: ${cmd}`;
        }

        vscode.window.showErrorMessage(msg);
        return null;
    }
    return result;
}
