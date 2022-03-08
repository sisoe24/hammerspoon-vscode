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
 * Execute a shell command.
 *
 * @param cmd the command the execute.
 * @returns A promise<boolean> after 200ms of timeout if resolves.
 */
export async function execCommand(cmd: string): Promise<boolean> {
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
        }, 200);
    });
}
