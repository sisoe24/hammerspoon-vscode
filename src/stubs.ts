import * as os from "os";
import * as vscode from "vscode";

import path = require("path");
import extract = require("extract-zip");

const fs = require("fs");
const axios = require("axios");

import { getConfig } from "./config";
import { writeStatement } from "./spoons";
import { runSync } from "./run_cmd";

const filePath = path.join(os.tmpdir(), "EmmyLua.zip");

async function downloadZip() {
    const url =
        "https://github.com/Hammerspoon/Spoons/raw/master/Spoons/EmmyLua.spoon.zip";

    const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

function getSpoonRootDir(): string {
    const spoonsRootDir = getConfig("spoons.path") as string;
    return spoonsRootDir.replace("~", os.homedir());
}

export function downloadStubs() {
    downloadZip()
        .then(async () => {
            try {
                await extract(filePath, { dir: getSpoonRootDir() });
                writeStatement("hs.loadSpoon('EmmyLua')");
                runSync("hs.reload()");
                // TODO: Check for Lua Language Server installation
                // TODO: Add the stubs to the Lua Language Server config
            } catch (err) {
                console.log(err);
                vscode.window.showErrorMessage(err as string);
                return false;
            }
        })
        .catch((error) => {
            vscode.window.showErrorMessage(
                `Failed to download ZIP file: ${error}`
            );
        });
}
