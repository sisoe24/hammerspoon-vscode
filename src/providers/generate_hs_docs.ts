import * as path from "path";
import { readFileSync, writeFileSync } from "fs";

const PATH = "/Applications/Hammerspoon.app/Contents/Resources/docs.json";

const HSDOC = JSON.parse(readFileSync(PATH, "utf-8"));
const newDocs: any = {};

/**
 * Add submodule data inside file.json.
 *
 * @param base
 * @param identifier
 * @param module
 */
function createSubModules(base: string, identifier: string, module: any): void {
    try {
        const inner = newDocs[base][identifier];

        inner["doc"] = module["doc"];
        if ("Constructor" in module) {
            inner["def"] = "-> " + module["name"];
        }
    } catch (error) {
        // first run there will be no data in the newDocs so it will fail.
    }
}

/**
 * Create a list of modules parents plus child
 *
 * * hs.application will return `['hs', 'application']`
 * * hs.application.watcher will return `['hs.application', 'watcher']`
 *
 * @param module hammerspoon module name
 * @returns
 */
function addSubmoduleData(module: any): void {
    const splittedName = module["name"].split(".");
    const nameLength = splittedName.length;

    let base = splittedName[0];
    const identifier = splittedName[nameLength - 1];

    if (nameLength >= 3) {
        base = splittedName.slice(0, -1).join(".");
    }
    createSubModules(base, identifier, module);
}

/**
 * Create new documentation from the base hammerspoon module.
 */
export function createNewDocs(): void {
    for (const module of HSDOC) {
        addSubmoduleData(module);

        const moduleName = module["name"];
        newDocs[moduleName] = {};

        for (const item of module["submodules"]) {
            Object.assign(newDocs[moduleName], { [item]: { type: "Module" } });
        }

        for (const item of module["items"]) {
            Object.assign(newDocs[moduleName], { [item.name]: item });
        }
    }

    for (const [key, value] of Object.entries(newDocs)) {
        const file = path.join(
            path.resolve(__dirname, "../../"),
            "resources",
            "hs_docs",
            key + ".json"
        );
        writeFileSync(file, JSON.stringify(value));
    }
}
