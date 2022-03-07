import * as vscode from "vscode";
import * as assert from "assert";

import * as testUtils from "./test_utils";
import * as hsCompletion from "../../providers/hs_module_completion";

const demoFile = "hs_completion_demo.lua";

/**
 * Compare hs module file with provider return module.
 *
 * @param module name of the module to compare
 * @param provider provider return to compare
 * @param isMethod if `true` compare only by methods
 */
function compare(module: string, provider: vscode.CompletionItem[], isMethod = false): void {
    let n = 0;
    for (const [key, value] of Object.entries(testUtils.openModule(module))) {
        if (isMethod && value.type !== "Method") {
            continue;
        }
        assert.strictEqual(provider[n].label, key);
        n++;
    }
}

suite("HS Completion", () => {
    test("No suggestions", async () => {
        await testUtils.createDemoContent(demoFile, "fs.");

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(0, 3)
        );
        assert.ok(!provider);
    });

    test("Completion for: `hs.`", async () => {
        await testUtils.createDemoContent(demoFile, "hs.");

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(0, 3)
        );

        assert.ok(provider);
        compare("hs", provider);
    });

    test("Completion for: `hs.applc`", async () => {
        await testUtils.createDemoContent(demoFile, "hs.applc");

        const editor = await testUtils.focusDemoFile(demoFile, 1);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(0, 9)
        );

        assert.ok(provider);
        compare("hs", provider);
    });

    test("Completion for: `hs.application('Code):`", async () => {
        await testUtils.createDemoContent(demoFile, "hs.application('Code'):");

        const editor = await testUtils.focusDemoFile(demoFile, 1);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(0, 24)
        );

        assert.ok(provider);
        compare("hs.application", provider, true);
    });

    test("Completion for: `app[1]:`", async () => {
        const fileContent = testUtils.formatContent(`
        local app = { hs.application() }
        local window = app[1]:
        `);

        await testUtils.createDemoContent(demoFile, fileContent);

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(1, 23)
        );

        assert.ok(provider);
        compare("hs.application", provider, true);
    });

    test("Completion for: `app.foo:`", async () => {
        const fileContent = testUtils.formatContent(`
        local app = { foo = hs.application() }
        local window = app.foo:
        `);

        await testUtils.createDemoContent(demoFile, fileContent);

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(1, 24)
        );

        assert.ok(provider);
        compare("hs.application", provider, true);
    });

    test("Completion for: `app:mainWindow():", async () => {
        const fileContent = testUtils.formatContent(`
        local app = hs.application()
        local window = app:mainWindow():
        `);

        await testUtils.createDemoContent(demoFile, fileContent);

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(1, 33)
        );

        assert.ok(provider);
        compare("hs.window", provider, true);
    });

    test("Completion for: `app:` 1", async () => {
        const fileContent = testUtils.formatContent(`
        local app = hs.application()
        local window = app:
        `);

        await testUtils.createDemoContent(demoFile, fileContent);

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(1, 19)
        );

        assert.ok(provider);
        compare("hs.application", provider, true);
    });

    test("Completion for: `app:` 2", async () => {
        const fileContent = testUtils.formatContent(`
        local app = hs.application.get()
        local window = app:
        `);

        await testUtils.createDemoContent(demoFile, fileContent);

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(1, 19)
        );

        assert.ok(provider);
        compare("hs.application", provider, true);
    });

    test("Completion for: `myapp:` from identifier", async () => {
        const fileContent = testUtils.formatContent(`
        local app = hs.application()
        local myapp = app
        local window = myapp:
        `);
        await testUtils.createDemoContent(demoFile, fileContent);

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(2, 21)
        );

        assert.ok(provider);
        compare("hs.application", provider, true);
    });

    test("Completion for `app:` below a if statement", async () => {
        const fileContent = testUtils.formatContent(`
        local app = hs.application()
        if '1' then local app = hs.chooser() end
        local window = app:
        `);

        await testUtils.createDemoContent(demoFile, fileContent);

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(2, 19)
        );

        assert.ok(provider);
        compare("hs.application", provider, true);
    });

    test("Completion for if nested `app:`", async () => {
        const fileContent = testUtils.formatContent(`
        local app = hs.application()
        if '1' then 
            local app = hs.chooser() 
            local ch = app:
        end
        `);

        await testUtils.createDemoContent(demoFile, fileContent);

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(3, 19)
        );

        assert.ok(provider);
        compare("hs.chooser", provider, true);
    });

    test("Completion for multi level nested `app:`", async () => {
        const fileContent = testUtils.formatContent(`
        local app = hs.application()
        do
            if '1' then 
                local app = hs.chooser() 
                local ch = app
                if '2' then 
                    local ch2 = app:
                end
            end
        end
        `);

        await testUtils.createDemoContent(demoFile, fileContent);

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(6, 28)
        );

        assert.ok(provider);
        compare("hs.chooser", provider, true);
    });

    test("Completion for: `tab.foo.bar:` from expression", async () => {
        const fileContent = testUtils.formatContent(`
        local tab = {
            foo = {
                bar = hs.application()
            }
        }
        local window = tab.foo.bar:
        `);

        await testUtils.createDemoContent(demoFile, fileContent);

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(5, 27)
        );

        assert.ok(provider);
        compare("hs.application", provider, true);
    });

    test("Completion for: `tab.foo.bar:` from identifier", async () => {
        const fileContent = testUtils.formatContent(`
        local app = hs.application()
        local tab = { foo = { bar = app } }
        local window = tab.foo.bar:
        `);

        await testUtils.createDemoContent(demoFile, fileContent);

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(2, 27)
        );

        assert.ok(provider);
        compare("hs.application", provider, true);
    });

    test("Completion for: `tab[1][1]:` from expression", async () => {
        const fileContent = testUtils.formatContent(`
        local tab = {
            {
                hs.application()
            }
        }
        local window = tab[1][1]:
        `);

        await testUtils.createDemoContent(demoFile, fileContent);

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(5, 25)
        );

        assert.ok(provider);
        compare("hs.application", provider, true);
    });

    test("Completion for: `tab[1][1]:` from identifier", async () => {
        const fileContent = testUtils.formatContent(`
        local app = hs.application()
        local tab = { { app } }
        local window = tab[1][1]:
        `);

        await testUtils.createDemoContent(demoFile, fileContent);

        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new hsCompletion.HSModulesCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(2, 34)
        );

        assert.ok(provider);
        compare("hs.application", provider, true);
    });
});
