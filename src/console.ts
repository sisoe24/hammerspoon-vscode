import * as vscode from "vscode";
import { getConfig } from "./config";
import { runAsync, runSync } from "./run_cmd";

export const outputWindow = vscode.window.createOutputChannel("Hammerspoon");

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
 * Get Hammerspoon console output.
 *
 * Before grabbing the output, hammerspoon configuration will be reloaded.
 *
 * @returns Hammerspoon console output text.
 */
export async function getHsConsoleOutput(): Promise<string | null> {
    await runAsync("hs -c 'hs.reload()'", 500);
    const output = runSync("hs -c 'hs.console.getConsole()'");
    if (output) {
        return output;
    }
    return null;
}

/**
 * Filter output console based on extension setting: `console.filterOutput`.
 *
 * @param consoleOutput hammerspoon console text.
 * @param regexFilters an array of string regex to perform the matches.
 */
export function filterOutput(
    consoleOutput: string,
    regexFilters: string[]
): string | null {
    const lines = consoleOutput.match(/^\d.+?(?=^\d)/gms);
    if (!lines) {
        return null;
    }

    let output = "";
    for (const line of lines) {
        for (const regex of regexFilters) {
            const matches = RegExp(regex, "s").exec(line);
            if (matches) {
                for (const match of matches) {
                    output += match;
                }
            }
        }
    }

    outputWindow.append(output);
    return output;
}

/**
 * Output Hammerspoon console to vscode output window.
 *
 * The function might attempt to filter the output based on the settings value.
 *
 */
export async function outputConsole(): Promise<void> {
    outputWindow.clear();

    const consoleOutput = await getHsConsoleOutput();
    if (!consoleOutput) {
        return;
    }

    if (getConfig("console.focusOutputWindow")) {
        outputWindow.show();
    }

    const regexFilters = getConfig("console.filterOutput") as string[];
    if (!regexFilters.length) {
        outputWindow.append(consoleOutput);
        return;
    }

    filterOutput(consoleOutput, regexFilters);
}
