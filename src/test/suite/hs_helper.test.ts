import * as assert from "assert";
import * as vscode from "vscode";

import * as testUtils from "./test_utils";
import * as hsHelper from "../../providers/hs_helper";

const demoFile = "tests/hs_helper_demo.lua";

suite("Hs Helper", () => {
    test("Skip if no word", async () => {
        await testUtils.createDemoContent(demoFile, " ");

        const editor = await testUtils.focusDemoFile(demoFile);
        const helper = new hsHelper.HsSignatureHelpProvider();

        const provider = await helper.provideSignatureHelp(
            editor.document,
            new vscode.Position(0, 5)
        );

        assert.ok(!provider);
    });

    test("Helper active parameter", async () => {
        await testUtils.createDemoContent(demoFile, "local app = hs.window():setFrame({},)");

        const editor = await testUtils.focusDemoFile(demoFile);
        const helper = new hsHelper.HsSignatureHelpProvider();

        const provider = await helper.provideSignatureHelp(
            editor.document,
            new vscode.Position(0, 36)
        );

        assert.ok(provider);
        assert.strictEqual(provider.signatures[0].label, "(rect[, duration]) -> hs.window object");
        assert.strictEqual(provider.signatures[0].activeParameter, 1);
    });

    test("Helper for `activate` on `hs.application():activate()`", async () => {
        await testUtils.createDemoContent(demoFile, "hs.application():activate()");

        const editor = await testUtils.focusDemoFile(demoFile);
        const helper = new hsHelper.HsSignatureHelpProvider();

        const provider = await helper.provideSignatureHelp(
            editor.document,
            new vscode.Position(0, 26)
        );

        assert.ok(provider);
        assert.strictEqual(provider.signatures[0].label, "([allWindows]) -> bool");
    });

    test("Helper for `setSize` on `app:mainWindow():setSize()`", async () => {
        const contentFile = testUtils.formatContent(`
        local app = hs.application()
        local window = app:mainWindow():setSize()
        `);

        await testUtils.createDemoContent(demoFile, contentFile);

        const editor = await testUtils.focusDemoFile(demoFile);
        const helper = new hsHelper.HsSignatureHelpProvider();

        const provider = await helper.provideSignatureHelp(
            editor.document,
            new vscode.Position(1, 40)
        );

        assert.ok(provider);
        assert.strictEqual(provider.signatures[0].label, "(size) -> window");
        assert.strictEqual(provider.signatures[0].parameters[0].label, "size");
        assert.strictEqual(
            provider.signatures[0].parameters[0].documentation,
            "A size-table containing the width and height the window should be resized to"
        );
    });

    test("Helper for `isRunning` on `app:isRunning(`", async () => {
        const contentFile = testUtils.formatContent(`
        local app = hs.application()
        local window = app:isRunning()
        `);

        await testUtils.createDemoContent(demoFile, contentFile);

        const editor = await testUtils.focusDemoFile(demoFile);
        const helper = new hsHelper.HsSignatureHelpProvider();

        const provider = await helper.provideSignatureHelp(
            editor.document,
            new vscode.Position(1, 29)
        );

        assert.ok(provider);
        assert.strictEqual(provider.signatures[0].label, "() -> boolean");
    });

    test("Helper for `activate` on `app:activate(`", async () => {
        const contentFile = testUtils.formatContent(`
        local tab = {app = hs.application()}
        local window = tab.app:getWindow()
        `);

        await testUtils.createDemoContent(demoFile, contentFile);

        const editor = await testUtils.focusDemoFile(demoFile);
        const helper = new hsHelper.HsSignatureHelpProvider();

        const provider = await helper.provideSignatureHelp(
            editor.document,
            new vscode.Position(1, 33)
        );

        assert.ok(provider);
        assert.strictEqual(provider.signatures[0].label, "(title) -> hs.window object");
        assert.strictEqual(provider.signatures[0].parameters[0].label, "title");
        assert.strictEqual(
            provider.signatures[0].parameters[0].documentation,
            "the desired window's title string as per `hs.window:title()`"
        );
    });

    test("Helper for `activate` on `app[1]:activate(`", async () => {
        const contentFile = testUtils.formatContent(`
        local tab = {hs.application()}
        local window = tab[1]:getWindow()
        `);

        await testUtils.createDemoContent(demoFile, contentFile);

        const editor = await testUtils.focusDemoFile(demoFile);
        const helper = new hsHelper.HsSignatureHelpProvider();

        const provider = await helper.provideSignatureHelp(
            editor.document,
            new vscode.Position(1, 32)
        );

        assert.ok(provider);
        assert.strictEqual(provider.signatures[0].label, "(title) -> hs.window object");
        assert.strictEqual(provider.signatures[0].parameters[0].label, "title");
        assert.strictEqual(
            provider.signatures[0].parameters[0].documentation,
            "the desired window's title string as per `hs.window:title()`"
        );
    });
});
