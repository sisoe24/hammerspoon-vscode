import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";

import extract = require("extract-zip");
const axios = require("axios");

import { getConfig } from "./config";
import { writeStatement } from "./spoons";
import { runSync } from "./run_cmd";

const tmpStubsDownload = path.join(os.tmpdir(), "EmmyLua.zip");

/**
 * Download the EmmyLua.spoon ZIP file from GitHub.
 *
 * @returns a Promise.
 * @throws an error if the download fails.
 */
async function downloadZip() {
    const url =
        "https://github.com/Hammerspoon/Spoons/raw/master/Spoons/EmmyLua.spoon.zip";

    const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
    });

    const writer = fs.createWriteStream(tmpStubsDownload);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

/**
 * Get the Spoon directory path from extension settings.
 *
 * @returns the Spoon directory path.
 */
function getSpoonRootDir(): string {
    const spoonsRootDir = getConfig("spoons.path") as string;
    return spoonsRootDir.replace("~", os.homedir());
}

/**
 * Check if the Lua Language Server is installed.
 *
 * @returns true if installed, false otherwise.
 */
function isLuaLspInstalled(): boolean {
    return Boolean(vscode.extensions.getExtension("sumneko.lua"));
}

/**
 * Update the Lua Language Server configuration to include the EmmyLua.spoon
 * annotations.
 */
function updateLuaLspConfig() {
    const config = vscode.workspace.getConfiguration("Lua.workspace", null);
    const library = config.get("library") as string[];

    const stubsDir = path.join(
        getSpoonRootDir(),
        "EmmyLua.spoon",
        "annotations"
    );

    if (!library.includes(stubsDir)) {
        library.push(stubsDir);
        config.update("library", library, vscode.ConfigurationTarget.Global);
    }
}

/**
 * Add the EmmyLua.spoon stubs to the Hammerspoon configuration.
 *
 * This method will download the EmmyLua.spoon ZIP file from GitHub, extract
 * the contents to the Hammerspoon Spoon directory, and update the Lua Language
 * Server configuration to include the EmmyLua.spoon annotations.
 *
 * @returns true if the stubs were added, false otherwise.
 */
export function addStubs(): boolean {
    if (!isLuaLspInstalled()) {
        vscode.window.showInformationMessage(
            "Lua Language Server is not installed. Please install before adding the stubs."
        );
        return false;
    }

    downloadZip()
        .then(async () => {
            try {
                await extract(tmpStubsDownload, { dir: getSpoonRootDir() });
                writeStatement("hs.loadSpoon('EmmyLua')");
                runSync("hs -c 'hs.reload()'", true);
                updateLuaLspConfig();
            } catch (err) {
                vscode.window.showErrorMessage(err as string);
                return false;
            }
        })
        .catch((error) => {
            vscode.window.showErrorMessage(
                `Failed to download ZIP file: ${error}`
            );
            return false;
        });

    return true;
}
