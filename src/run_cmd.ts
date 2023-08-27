import * as vscode from "vscode";
import * as cp from "child_process";

/**
 * Execute async shell command.
 *
 * @param cmd the command the execute.
 * @param timeout optional timeout in ms for the promise to resolve: defaults to 200ms.
 * @returns A promise<boolean> after 200ms of timeout if resolves.
 */
export async function runAsync(cmd: string, timeout = 200): Promise<string> {
    return new Promise((resolve, reject) => {
        let result = "";

        cp.exec(cmd, (err, stdout, stderr) => {
            if (stdout) {
                result = stdout;
                resolve(stdout);
            }
            if (stderr) {
                vscode.window.showErrorMessage(stderr);
                reject(stderr);
            }
            if (err) {
                vscode.window.showErrorMessage(err.message);
                reject(stderr);
            }
        });

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
export function runSync(cmd: string): string | null {
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
