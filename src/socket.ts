import * as net from "net";
import * as vscode from "vscode";
import { hammerspoonConfig } from "./utils";

// TODO: Test module

const server = new net.Server();

const statusBarItem = vscode.window.createStatusBarItem();
const hsDisconnect = "$(debug-disconnect) Hammerspoon: Disconnected";
const hsConnect = "$(vm-connect) Hammerspoon: Listening...";

/**
 * Create the status bar action.
 */
export function createStatusBar() {
    // statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
    statusBarItem.text = hsDisconnect;
    statusBarItem.command = "hammerspoon.connect";
    statusBarItem.show();
}

function executeVscodeCommand(command: string) {
    vscode.commands.executeCommand(command).then(
        () => {},
        (reject) => {
            vscode.window.showErrorMessage(reject.message);
        }
    );
}

function startServer() {
    // TODO: save port value in settings
    const port = hammerspoonConfig("network.port") as number;
    statusBarItem.tooltip = `Toggle connection for Hammerspoon on localhost:${port}`;
    // TODO: add custom host
    server.listen(port);

    server.on("connection", function (socket) {
        socket.on("data", function (chunk) {
            executeVscodeCommand(chunk.toString());
        });

        socket.on("end", function () {
            vscode.window.showInformationMessage("Closing connection.");
        });

        socket.on("error", function (err) {
            vscode.window.showErrorMessage(err.message);
        });
    });
}

export function connectHammerspoon() {
    if (server.listening) {
        statusBarItem.tooltip = "";
        statusBarItem.text = hsDisconnect;
        server.close();
    } else {
        statusBarItem.text = hsConnect;
        startServer();
    }
}
