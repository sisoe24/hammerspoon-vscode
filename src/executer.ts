import * as vscode from "vscode";
import { runSync } from "./run_cmd";
import { outputWindow } from "./console";

/**
 * Get the selected text
 * @returns The selected text
 */
function getSelectedText(): string | null {
    // Get the current editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return null;
    }

    const selectedText = editor?.document.getText(editor.selection);

    return selectedText;
}

/**
 * Escape string before execute as command
 * @param s String for escaping
 * @returns Escaped string
 */
function escapeString(s: string) {
    return s.replace(/["[\]\\]/g, "\\$&");
}

/**
 * Execute the selected text
 * @param command The command to execute
 * @returns The output of the command
 */
function executeCode(command: string): string | null {
    // run the command in the shell and get the output
    const luaScript = escapeString(command);
    const shellCommand = `hs -c "${luaScript}"`;
    let output = runSync(shellCommand);

    if (output !== null) {
        outputWindow.show();
        outputWindow.append(`${command}\n`);
        outputWindow.append(`=> ${output}\n`);
    }

    return output;
}

/**
 * Send selected text to Hammerspoon Console
 */
export function executeSelectedText(): void {
    const selectedText = getSelectedText();
    if (selectedText) {
        executeCode(selectedText);
    }
}
