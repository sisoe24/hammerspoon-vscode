import * as vscode from "vscode";
import { runSync } from "./run_cmd";
import { outputWindow } from "./console";
import { getConfig } from "./config";

/**
 * Prepare command before send to Hammerspoon
 * @param command Original command
 * @returns Prepared command
 */
export function prepareCommand(command: string) {
    return command.replace(/["\\]/g, "\\$&");
}

/**
 * Evaluate command in Hammerspoon
 * @param command Command to evaluate
 * @returns Output of the command
 */
function evaluateCode(command: string): string | null {
    const luaScript = prepareCommand(command);
    const shellCommand = `hs -c "${luaScript}"`;
    return runSync(shellCommand);
}

type GetTextFn = (editor: vscode.TextEditor) => string | null;

/**
 * Wrapper for evaluate text from editor process
 * @param getTextFn Function which returns text from editor window
 */
function tryEvaluateText(getTextFn: GetTextFn): void {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const textToEvaluate = getTextFn(editor);
        if (textToEvaluate) {
            const output = evaluateCode(textToEvaluate);
            if (output) {
                if (getConfig("console.focusOutputWindow")) {
                    outputWindow.show();
                }

                outputWindow.appendLine(`${textToEvaluate}`);
                outputWindow.appendLine(`=> ${output}`);
            }
        }
    }
}

/**
 * Send current file text to Hammerspoon Console
 */
export function evaluateCurrentFileText(): void {
    tryEvaluateText((editor) => {
        return editor.document.getText();
    });
}

/**
 * Send current selection text to Hammerspoon Console
 */
export function evaluateSelectedText(): void {
    tryEvaluateText((editor) => {
        return editor.document.getText(editor.selection);
    });
}

/**
 * Send current line text to Hammerspoon Console
 */
export function evaluateCurrentLineText(): void {
    tryEvaluateText((editor) => {
        return editor.document.lineAt(editor.selection.active.line).text;
    });
}
