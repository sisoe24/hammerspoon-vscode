import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

import * as cp from "child_process";
import * as utils from "./utils";
import { title } from "process";

/**
 * Execute a shell command.
 *
 * @param cmd the command the execute.
 * @returns A promise<boolean> after 200ms of timeout if resolves.
 */
async function execCommand(cmd: string): Promise<boolean> {
    let result: boolean;
    cp.exec(cmd, (err, stdout, stderr) => {
        if (stderr) {
            result = false;
            vscode.window.showErrorMessage("stderr: " + stderr);
            return null;
        }
        if (err) {
            result = false;
            vscode.window.showErrorMessage("error: " + err);
            return null;
        }
        result = true;
    });

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(result);
        }, 200);
    });
}

/**
 * Check if path exists.
 *
 * @param path string like file system path.
 * @returns `true` if it does, `false` otherwise. When false will show a user error.
 */
function pathExists(path: string): boolean {
    if (!fs.existsSync(path)) {
        vscode.window.showErrorMessage(`Path: ${path} appears to be invalid`);
        return false;
    }
    return true;
}

/**
 * Generate the base `docs.json` documentation for a Spoon.
 *
 * Method will execute a shell command that invokes the `hs.ipc` module. If this
 * module is not installed, will fail.
 *
 * @param dir Directory of the current active file.
 */
async function generateDocsJson(dir: string): Promise<void> {
    const result = await execCommand(
        `cd ${dir} && hs -c "hs.doc.builder.genJSON(\\"$(pwd)\\")" | grep -v "^--" > docs.json`
    );

    if (result) {
        vscode.window.showInformationMessage("Documentation created!");
    }
}

/**
 * Generate the base extra documentation (HTML/Markdown) for a Spoon.
 *
 * Method will execute a shell command that invokes the `hs.ipc` module. If this
 * module is not installed, will fail.
 *
 * @param dir Directory of the current active file.
 */
async function generateExtraDocs(dir: string): Promise<void | null> {
    const hsSourceRoot = utils.hammerspoonConfig("spoons.extraDocumentation") as {
        [key: string]: string;
    };

    const hsSourcePath = hsSourceRoot["source-code-path"];
    const hsSourcePythonPath = hsSourceRoot["source-code-python-interpreter-path"];
    if (!hsSourcePath || !hsSourcePythonPath) {
        return null;
    }
    if (!pathExists(hsSourcePath) || !pathExists(hsSourcePythonPath)) {
        return null;
    }

    const hsDocScript = `${hsSourcePath}/scripts/docs`;
    const cmd = `${hsSourcePythonPath} ${hsDocScript}/bin/build_docs.py --templates ${hsDocScript}/templates/ --output_dir . --json --html --markdown --standalone .`;

    await execCommand(`cd ${dir} && ${cmd}`);
}

/**
 * Generate Hammerspoon Spoon documentation from a `spoon/init.lua`.
 */
export function generateSpoonDoc(): void {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const filePath = path.dirname(editor.document.fileName);
        generateDocsJson(filePath);
        generateExtraDocs(filePath);
    }
}

/**
 * Get the Spoon directory path from extension settings.
 *
 * @returns the Spoon directory path.
 */
function getSpoonRootDir(): string {
    const spoonsRootDir = utils.hammerspoonConfig("spoons.path") as string;
    return spoonsRootDir.replace("~", os.homedir());
}

/**
 * Create the new Spoon directory.
 *
 * @param path the path where to create.
 * @returns true if path was created, false otherwise.
 */
function createSpoonDir(path: string): boolean {
    if (fs.existsSync(path)) {
        vscode.window.showWarningMessage("Spoon directory already exists.");
        return false;
    }
    fs.mkdirSync(path);
    return true;
}

type PlaceHolders = {
    [key: string]: string;
};

/**
 * Create the `init.lua` template file.
 *
 * @param spoonDir path where to create the spoon template.
 * @param placeholders placeholders object to replace inside the `init.lua` template.
 */
function createSpoonTemplate(spoonDir: string, placeholders: PlaceHolders): void {
    let spoonSample = fs.readFileSync(`${utils.languagePath}/spoon_sample.lua`, "utf-8");

    for (const [key, value] of Object.entries(placeholders)) {
        spoonSample = spoonSample.replace(RegExp(key, "g"), value);
    }

    fs.writeFileSync(`${spoonDir}/init.lua`, spoonSample);
}

/**
 * Ask user to fill some value that are going to be used to replace some
 * placeholders when creating the Spoon template.
 *
 * @returns a placeholders object.
 */
async function askUser(): Promise<PlaceHolders> {
    const placeholders: PlaceHolders = {
        _spoonName_: "Spoon name without the .spoon extension",
        _description_: "Spoon Description",
        _author_: "Author",
    };

    for (const [key, value] of Object.entries(placeholders)) {
        const action = await vscode.window.showInputBox({
            title: key,
            placeHolder: value,
        });

        if (action) {
            placeholders[key] = action;
        } else {
            placeholders[key] = key;
        }
    }
    return placeholders;
}

/**
 * Create the spoon directory and file template.
 */
export async function createSpoon(): Promise<void> {
    const placeholders = await askUser();

    const spoonDir = `${getSpoonRootDir()}/${placeholders["_spoonName_"]}.spoon`;

    if (createSpoonDir(spoonDir)) {
        createSpoonTemplate(spoonDir, placeholders);
        vscode.window.showInformationMessage("Spoon created");
    }
}
