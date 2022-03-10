import * as vscode from "vscode";
import * as path from "path";
import * as cp from "child_process";

export const languagePath = path.resolve(__dirname, "../resources");

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
 * Execute async shell command.
 *
 * @param cmd the command the execute.
 * @param timeout optional timeout in ms for the promise to resolve: defaults to 200ms.
 * @returns A promise<boolean> after 200ms of timeout if resolves.
 */
export async function execAsync(cmd: string, timeout = 200): Promise<boolean> {
    let result = false;

    cp.exec(cmd, (err, stdout, stderr) => {
        if (stderr) {
            result = false;
            vscode.window.showErrorMessage(stderr);
            return null;
        }
        if (err) {
            result = false;
            vscode.window.showErrorMessage(err.message);
            return null;
        }
        result = true;
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
        vscode.window.showErrorMessage(error.message);
        return null;
    }
    return result;
}
