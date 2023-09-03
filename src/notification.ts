import * as vscode from "vscode";

const _msg = `
Hammerspoon extension now uses the EmmyLua.spoons for completion.
Please use the new command \`Hammerspoon: Add Stubs\` to generate the completion stubs.
More information can be found in the
[README](https://github.com/sisoe24/hammerspoon-vscode/blob/main/README.md#13-stubs)
`;

/**
 * Show update message box if version is newer or update message is different.
 *
 * @param context vscode ExtensionContext
 */
export function showNotification(
    context: vscode.ExtensionContext,
    msg: string = _msg
): void {
    const extensionId = context.extension.id;

    // get the value stored inside the global state key: _value['extension.version']
    const extVersion = extensionId + ".version";
    const previousVersion = context.globalState.get<string>(
        extVersion
    ) as string;

    // get the value stored inside the global key: _value['extension.updateMsg']
    const extUpdateMsg = extensionId + ".updateMsg";
    const previousMsg = context.globalState.get<string>(extUpdateMsg) as string;

    // get the package.json version
    // if it cannot resolve the version will return 0.0.0
    const currentVersion =
        (vscode.extensions.getExtension(extensionId)?.packageJSON
            .version as string) ?? "0.0.0";

    // store the current version in the global state key _value['extension.version']
    context.globalState.update(extVersion, currentVersion);

    // store the current update message in the global state key _value['extension.updateMsg']
    context.globalState.update(extUpdateMsg, msg);

    if (currentVersion > previousVersion && msg !== previousMsg) {
        vscode.window.showInformationMessage(msg);
    }
}
