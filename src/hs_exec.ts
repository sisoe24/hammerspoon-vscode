import * as vscode from "vscode";

import { runSync } from "./run_cmd";

function execute(text: string) {
    const result = runSync(`hs -c  '\''${text}'\''`);
    if (result) {
        vscode.window.showInformationMessage(result);
    }
}

function getSelectedText(): string {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return "";
    }

    return editor.document.getText(editor.selection);
}

function getCurrentLine(): string {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return "";
    }

    const currentLine = editor.document.lineAt(editor.selection.active.line);
    return currentLine.text;
}

function getCurrentFile(): string {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return "";
    }

    const currentFile = editor.document.getText();
    return currentFile;
}

export function executeSelectedText() {
    execute(getSelectedText());
}

export function executeCurrentLine() {
    execute(getCurrentLine());
}

export function executeCurrentFile() {
    execute(getCurrentFile());
}
