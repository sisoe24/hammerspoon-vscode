import * as vscode from "vscode";
import * as path from "path";

export const languagePath = path.resolve(__dirname, "../language");

/**
 * Get configuration property value.
 *
 * If property name is not found, throws an error.
 *
 * @param property - name of the configuration property to get.
 * @returns - the value of the property.
 */
export function hammerspoonConfig(property: string): unknown {
    const config = vscode.workspace.getConfiguration("hammerspoon");
    const subConfig = config.get(property);

    if (typeof subConfig === "undefined") {
        throw new Error(`Configuration: ${property} doesn't exist`);
    }

    return subConfig;
}
