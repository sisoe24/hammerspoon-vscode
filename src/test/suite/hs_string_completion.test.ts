import * as vscode from "vscode";
import * as assert from "assert";

import * as testUtils from "./test_utils";
import { HSStringCompletionProvider } from "../../providers/hs_string_completion";

const demoFile = "hs_spoon_demo.lua";

suite("Hs String Completion", () => {
    test("Spoon completions", async () => {
        await testUtils.createDemoContent(demoFile, "hs.loadSpoon('')");
        const editor = await testUtils.focusDemoFile(demoFile);

        const completion = new HSStringCompletionProvider();
        const provider = await completion.provideCompletionItems(
            editor.document,
            new vscode.Position(0, 13)
        );

        assert.ok(provider);
    });
});
