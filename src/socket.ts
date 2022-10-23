import * as net from "net";
import * as vscode from "vscode";
import { hammerspoonConfig } from "./utils";

// TODO: Test module

const server = new net.Server();

const statusBarItem = vscode.window.createStatusBarItem();
const hsDisconnect = "$(debug-disconnect) Hammerspoon: Disconnected";
const hsConnect = "$(vm-connect) Hammerspoon: Listening...";

const outputWindowNetwork = vscode.window.createOutputChannel("Hammerspoon Network");

/**
 * Append text to vscode console
 *
 * @param text text to append in console
 */
export function debugNetwork(text: string): void {
    const date = new Date().toISOString();
    outputWindowNetwork.appendLine(`[${date}] ${text}`);
}

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
        (resolve) => {
            debugNetwork("Command executed successfully");
        },
        (reject) => {
            debugNetwork(`Command rejected: ${reject.message}`);
            vscode.window.showWarningMessage(reject.message);
        }
    );
}

function startServer() {
    // TODO: save port value in settings
    const port = hammerspoonConfig("network.port") as number;

    statusBarItem.tooltip = `Toggle connection for Hammerspoon on localhost:${port}`;

    // TODO: add custom host
    server.listen(port);

    debugNetwork(`Connecting to 'localhost:${port}'`);
    server.on("connection", function (socket) {
        socket.on("data", function (chunk) {
            const data = chunk.toString();
            debugNetwork(`Data received: '${data}'`);
            executeVscodeCommand(data);
        });

        socket.on("end", async function () {
            debugNetwork("Closing client connection.");
        });

        socket.on("error", function (err) {
            debugNetwork(`Server error: ${err.message}`);
            vscode.window.showWarningMessage(err.message);
        });
    });
}

export async function connectHammerspoon() {
    if (server.listening) {
        statusBarItem.tooltip = "";
        statusBarItem.text = hsDisconnect;
        server.close();
    } else {
        statusBarItem.text = hsConnect;
        startServer();
    }
}
