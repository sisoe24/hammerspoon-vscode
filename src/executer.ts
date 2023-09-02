import * as vscode from "vscode";
import * as util from "./utilities";
import { runSync } from "./run_cmd";
import { outputWindow } from "./console";

/**
 * Get the selected text
 * @returns The selected text
 */
function getCurrentFileText(): string | null {
    const editor = util.getActiveTextEditor();
    return editor.document.getText();
}

/**
 * Get the selected text
 * @returns The selected text
 */
function getSelectedText(): string | null {
    const editor = util.getActiveTextEditor();
    return editor.document.getText(editor.selection);
}

/**
 * Get the selected text
 * @returns The selected text
 */
function getCurrentLineText(): string | null {
    const editor = util.getActiveTextEditor();
    return editor.document.lineAt(editor.selection.active.line).text;
}

/**
 * Escape string before execute as command
 * @param s String for escaping
 * @returns Escaped string
 */
export function escapeString(s: string) {
    return s.replace(/["[\]\\]/g, "\\$&");
}

/**
 * Execute the selected text
 * @param command The command to execute
 * @returns The output of the command
 */
function executeCode(command: string): string | null {
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
 * Send current file text to Hammerspoon Console
 */
export function executeCurrentFile(): void {
    const textToExecute = getCurrentFileText();
    if (textToExecute) {
        executeCode(textToExecute);
    }
}

/**
 * Send selected text to Hammerspoon Console
 */
export function executeSelectedText(): void {
    const textToExecute = getSelectedText();
    if (textToExecute) {
        executeCode(textToExecute);
    }
}

/**
 * Send current line text to Hammerspoon Console
 */
export function executeCurrentLine(): void {
    const textToExecute = getCurrentLineText();
    if (textToExecute) {
        executeCode(textToExecute);
    }
}
