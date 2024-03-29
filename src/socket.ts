import * as net from "net";
import * as vscode from "vscode";

import { getConfig } from "./config";

// TODO: Test module

const server = new net.Server();

const statusBarItem = vscode.window.createStatusBarItem();
statusBarItem.tooltip = "Toggle socket connection for Hammerspoon";
const hsDisconnect = "$(debug-disconnect) HS Socket: Off";
const hsConnect = "$(vm-connect) HS Socket: On";

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
    statusBarItem.text = hsDisconnect;
    statusBarItem.command = "hammerspoon.connect";
    statusBarItem.show();
}

function executeVscodeCommand(command: string) {
    let args = command.match(/(?:{)(.+)(?:})/) || [];
    if (args.length !== 0) {
        // clean command from args
        command = command.replace(args[0], "");

        // extract the args and clean them from spaces
        args = args[1].split(",").map((arg) => arg.trim());
        debugNetwork(`Command args: [${args}]`);
    }
    vscode.commands.executeCommand(command.trim(), ...args).then(
        (resolve) => {
            debugNetwork("Command executed successfully");
        },
        (reject) => {
            debugNetwork(`[ERROR] Command rejected: ${reject.message}`);
            vscode.window.showWarningMessage(reject.message);
        }
    );
}

function startServer() {
    const port = getConfig("network.port") as number;

    statusBarItem.tooltip = `${statusBarItem.tooltip} - localhost:${port}`;

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
            debugNetwork(`[ERROR] Server error: ${err.message}`);
            vscode.window.showWarningMessage(err.message);
        });
    });
}

export async function connectHammerspoon() {
    if (server.listening) {
        statusBarItem.text = hsDisconnect;
        server.close();
        debugNetwork("Closing server.");
    } else {
        statusBarItem.text = hsConnect;
        startServer();
    }
}
