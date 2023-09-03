import * as vscode from "vscode";

import { runSync } from "./run_cmd";
import { getConfig } from "./config";

export const outputWindow = vscode.window.createOutputChannel("Hammerspoon");

const sleep = (milliseconds: number): Promise<unknown> => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/**
 * Get Hammerspoon console output.
 *
 * Before grabbing the output, hammerspoon configuration will be reloaded.
 *
 * @returns Hammerspoon console output text.
 */
export async function getHsConsoleOutput(): Promise<string | null> {
    // For some reason, this command, although it works, it does throw an error.
    runSync("hs -c 'hs.reload()'", true);

    // wait for hammerspoon to reload
    await sleep(1000);

    const output = runSync("hs -c 'hs.console.getConsole()'");
    if (!output) {
        return null;
    }

    return output;
}

/**
 * Filter output console based on extension setting: `hammerspoon.console.filterOutput`.
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

    return output;
}

/**
 * Output Hammerspoon console to vscode output window.
 *
 * The function will attempt to filter the output based on the settings value.
 *
 */
export async function hammerspoonToVscode(): Promise<void> {
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

    const output = filterOutput(consoleOutput, regexFilters);
    if (!output) {
        return;
    }

    outputWindow.append(output);
}
