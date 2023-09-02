import * as vscode from "vscode";

function tryToGetActiveTextEditor(): vscode.TextEditor | undefined {
    return vscode.window.activeTextEditor;
}

function getActiveTextEditor(): vscode.TextEditor {
    const editor = tryToGetActiveTextEditor();

    if (!editor) {
        throw new Error("Expected active text editor!");
    }

    return editor;
}

export { getActiveTextEditor };
