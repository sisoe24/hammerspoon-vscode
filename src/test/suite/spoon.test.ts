import * as assert from "assert";
import * as vscode from "vscode";

import * as fs from "fs";
import * as os from "os";

import * as testUtils from "./test_utils";
import * as spoons from "../../spoons";

// const demoFile = "tests/hs_hover_demo.lua";
const hsPath = `${testUtils.demoPath}/.hammerspoon/Spoons`;
const newSpoon = `${hsPath}/test.spoon`;

suiteSetup("CleanUp .hammerspoon content", async () => {
    fs.rmSync(newSpoon, { force: true, recursive: true });
});

setup("Clean settings files", () => {
    testUtils.cleanSettings();
});

suite("Spoons Creation", () => {
    const placeholders: spoons.PlaceHolders = {
        _spoonName_: "Spoon_Name",
        _description_: "Spoon_Description",
        _author_: "Spoon_Author",
    };

    test("Get Spoon directory", () => {
        const dir = spoons.getSpoonRootDir();
        assert.strictEqual(dir, `${os.homedir()}/.hammerspoon/Spoons`);
    });

    test("Get Custom Spoon directory", async () => {
        await testUtils.updateConfig("spoons.path", "new_path");
        const dir = spoons.getSpoonRootDir();
        assert.strictEqual(dir, "new_path");
    });

    test("Create Spoon directory", () => {
        const dir = spoons.createSpoonDir(newSpoon);
        assert.ok(dir);
    });

    test("Dont create if Spoon directory exists already", () => {
        const dir = spoons.createSpoonDir(newSpoon);
        assert.ok(!dir);
    });

    test("Create Spoon", () => {
        const file = spoons.createSpoonTemplate(newSpoon, placeholders);
        assert.ok(fs.existsSync(file));
    });

    test("Created Spoon should have placeholders substituted", () => {
        const spoonFile = fs.readFileSync(`${newSpoon}/init.lua`, "utf-8");
        for (const [key, value] of Object.entries(placeholders)) {
            assert.ok(RegExp(value, "g").test(spoonFile));
            assert.ok(!RegExp(key, "g").test(spoonFile));
        }
    });

    test.skip("Ask user", async () => {
        const file = await spoons.askUser();
        assert.strictEqual(file, "");
    });
});

suite("Spoon Docs", () => {
    test("Generate Docs", () => {
        assert.strictEqual("", "");
    });

    test("Path Exists", () => {
        const path = spoons.pathExists(hsPath);
        assert.ok(path);
    });

    test("Path does not exists", () => {
        const path = spoons.pathExists("abc");
        assert.ok(!path);
    });

    test("Generate docs.json", async () => {
        await spoons.generateDocsJson(newSpoon);
        assert.ok(fs.existsSync(`${newSpoon}/docs.json`));
    });

    test("Generate extra docs but no path is set", async () => {
        const result = await spoons.generateExtraDocs(newSpoon);
        assert.ok(!result);
    });

    test("Generate extra docs but path is invalid", async () => {
        await testUtils.updateConfig("spoons.extraDocumentation", {
            "repository-path": "abc",
            "interpreter-path": "abc",
        });

        const result = await spoons.generateExtraDocs(newSpoon);
        assert.ok(!result);
    });

    test("Generate extra docs ", async () => {
        const hsSource = `${os.homedir()}/Developer/SourceCode/hammerspoon`;

        await testUtils.updateConfig("spoons.extraDocumentation", {
            "repository-path": hsSource,
            "interpreter-path": `${hsSource}/.venv/bin/python`,
        });

        await spoons.generateExtraDocs(newSpoon);
        assert.ok(fs.existsSync(`${newSpoon}/docs_index.json`));
        assert.ok(fs.existsSync(`${newSpoon}/markdown`));
        assert.ok(fs.existsSync(`${newSpoon}/html`));
    });
});

suite("Spoon misc", () => {
    test("Execute command with error", async () => {
        const result = await spoons.execCommand("abc -c");
        assert.ok(!result);
    });
});
