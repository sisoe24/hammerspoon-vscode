import * as assert from "assert";
import * as vscode from "vscode";

import * as testUtils from "./test_utils";
import * as hsHover from "../../providers/hs_hover";

const demoFile = "tests/hs_hover_demo.lua";

suite("Hs Hover ", () => {
    test("Skip if no word", async () => {
        await testUtils.createDemoContent(demoFile, " ");

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(0, 5));

        assert.ok(!provider);
    });

    test("Skip if Lua keyword", async () => {
        await testUtils.createDemoContent(demoFile, "local");

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(0, 3));

        assert.ok(!provider);
    });

    test("Skip if not valid module", async () => {
        await testUtils.createDemoContent(demoFile, "local app = hs.application():name()");

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(0, 7));

        assert.ok(!provider);
    });

    test("Skip if no constructor", async () => {
        await testUtils.createDemoContent(demoFile, "local alert = hs.alert.closeAll()");

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(0, 7));

        assert.ok(!provider);
    });

    test("Hover on `application` of: `hs.application`", async () => {
        await testUtils.createDemoContent(demoFile, "hs.application");

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(0, 5));

        assert.ok(provider);
        assert.strictEqual(provider.contents.toString(), testUtils.getDoc("hs", "application"));
    });

    test("Hover on `mainWindow` of: `hs.application():mainWindow`", async () => {
        await testUtils.createDemoContent(demoFile, "hs.application():mainWindow");

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(0, 24));

        assert.ok(provider);
        assert.strictEqual(
            provider.contents.toString(),
            testUtils.getDoc("hs.application", "mainWindow")
        );
    });

    test("Hover over `setSize` of: `app:mainWindow():setSize`", async () => {
        const contentFile = testUtils.formatContent(`
        local app = hs.application() 
        local window = app:mainWindow():setSize()
        `);
        await testUtils.createDemoContent(demoFile, contentFile);

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(1, 35));

        assert.ok(provider);
        assert.strictEqual(provider.contents.toString(), testUtils.getDoc("hs.window", "setSize"));
    });

    test("Hover over `app` of: `local app = hs.application()`", async () => {
        await testUtils.createDemoContent(demoFile, "local app = hs.application()");

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(0, 6));

        assert.ok(provider);
        assert.strictEqual(hover.hsConstructor, "hs.application");
    });

    test("Hover over `mainWindow` of: `app:mainWindow`", async () => {
        const contentFile = testUtils.formatContent(`
        local app = hs.application()
        local window = app:mainWindow()
        `);
        await testUtils.createDemoContent(demoFile, contentFile);

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(1, 25));

        assert.ok(provider);
        assert.strictEqual(
            provider.contents.toString(),
            testUtils.getDoc("hs.application", "mainWindow")
        );
    });

    test("Hover over `app` of: `local app = hs.application.watcher.new()`", async () => {
        await testUtils.createDemoContent(demoFile, "local app = hs.application.watcher.new()");

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(0, 7));

        assert.ok(provider);
        assert.strictEqual(hover.hsConstructor, "hs.application.watcher");
    });

    test("Hover over `app` of: `local app = hs.application.pathForBundleID()`", async () => {
        await testUtils.createDemoContent(demoFile, "local app = hs.application.pathForBundleID()");

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(0, 7));

        assert.ok(provider);
        assert.strictEqual(hover.hsConstructor, "string or nil");
    });

    test("Hover over `window` of: `local window = app:mainWindow()`", async () => {
        const contentFile = testUtils.formatContent(`
        local app = hs.application() 
        local window = app:mainWindow()
        `);

        await testUtils.createDemoContent(demoFile, contentFile);

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(1, 8));

        assert.ok(provider);
        assert.strictEqual(hover.hsConstructor, "hs.window");
    });

    test("Hover over `mainWindow` of: `table.foo:mainWindow`", async () => {
        const contentFile = testUtils.formatContent(`
        local table = { app = hs.application() }
        local window = table.app:mainWindow()
        `);

        await testUtils.createDemoContent(demoFile, contentFile);

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(1, 27));

        assert.ok(provider);
        assert.strictEqual(
            provider.contents.toString(),
            testUtils.getDoc("hs.application", "mainWindow")
        );
    });

    test("Hover over `app` of: `table.app`", async () => {
        const contentFile = testUtils.formatContent(`
        local table = { app = hs.application() }
        local window = table.app
        `);

        await testUtils.createDemoContent(demoFile, contentFile);

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(1, 22));

        assert.ok(provider);
        assert.strictEqual(hover.hsConstructor, "hs.application");
    });

    test("Hover over `window` of: `local window = table.app:getWindow()`", async () => {
        const contentFile = testUtils.formatContent(`
        local table = { app = hs.application() }
        local window = table.app:getWindow()
        `);

        await testUtils.createDemoContent(demoFile, contentFile);

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(1, 11));

        assert.ok(provider);
        assert.strictEqual(hover.hsConstructor, "hs.window");
    });

    test("Hover over `window` of: `local window = app:getWindow():centerOnScreen()`", async () => {
        const contentFile = testUtils.formatContent(`
        local app = hs.application()
        local window = app:getWindow():centerOnScreen()
        `);

        await testUtils.createDemoContent(demoFile, contentFile);

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(1, 11));

        assert.ok(provider);
        assert.strictEqual(hover.hsConstructor, "hs.window");
    });

    test("Hover over `getWindow` of: `table[1]:getWindow`", async () => {
        const contentFile = testUtils.formatContent(`
        local table = { hs.application() }
        local window = table[1]:getWindow()
        `);

        await testUtils.createDemoContent(demoFile, contentFile);

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(1, 26));

        assert.ok(provider);
        assert.strictEqual(
            provider.contents.toString(),
            testUtils.getDoc("hs.application", "getWindow")
        );
    });

    test("Hover over `app` of: `local window = app`", async () => {
        const contentFile = testUtils.formatContent(`
        local app = hs.application()
        local window = app
        `);

        await testUtils.createDemoContent(demoFile, contentFile);

        const editor = await testUtils.focusDemoFile(demoFile);
        const hover = new hsHover.HsHoverProvider();
        const provider = await hover.provideHover(editor.document, new vscode.Position(1, 17));

        assert.ok(provider);
        assert.strictEqual(hover.hsConstructor, "hs.application");
    });
});
