import * as vscode from "vscode";
import * as util from "./utilities";
import { runSync } from "./run_cmd";
import { outputWindow } from "./console";

/**
 * Get text of whole current file
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
 * Get the text of current line
 * @returns The selected text
 */
function getCurrentLineText(): string | null {
    const editor = util.getActiveTextEditor();
    return editor.document.lineAt(editor.selection.active.line).text;
}

/**
 * Escape string before evaluate as command
 * @param s String for escaping
 * @returns Escaped string
 */
export function escapeString(s: string) {
    return s.replace(/["\\]/g, "\\$&");
}

/**
 * Evaluate the selected text
 * @param command The command to evaluate
 * @returns The output of the command
 */
function evaluateCode(command: string): string | null {
    const luaScript = escapeString(command);
    const shellCommand = `hs -c "${luaScript}"`;
    let output = runSync(shellCommand);

    if (output !== null) {
        outputWindow.appendLine(`${command}`);
        outputWindow.appendLine(`=> ${output}`);
    }

    return output;
}

/**
 * Send current file text to Hammerspoon Console
 */
export function evaluateCurrentFileText(): void {
    const evaluatedText = getCurrentFileText();
    if (evaluatedText) {
        evaluateCode(evaluatedText);
    }
}

/**
 * Send selected text to Hammerspoon Console
 */
export function evaluateSelectedText(): void {
    const evaluatedText = getSelectedText();
    if (evaluatedText) {
        evaluateCode(evaluatedText);
    }
}

/**
 * Send current line text to Hammerspoon Console
 */
export function evaluateCurrentLineText(): void {
    const evaluatedText = getCurrentLineText();
    if (evaluatedText) {
        evaluateCode(evaluatedText);
    }
}
