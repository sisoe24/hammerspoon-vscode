import * as assert from "assert";

import { prepareCommand } from "../../repl";

suite("Test Escape String", () => {
    test("Test string with dobule quotes", async () => {
        assert.ok(
            prepareCommand(`hs.alert.show("Hello")`) ===
                `hs.alert.show(\\"Hello\\")`
        );
    });

    test("Test string with single quotes", async () => {
        assert.ok(
            prepareCommand(`hs.alert.show('Hello')`) ===
                `hs.alert.show('Hello')`
        );
    });

    test("Test complex string escaping", async () => {
        assert.ok(
            prepareCommand(
                `local foo = 'hello'
            local bar = "from \\"Lua\\""
            hs.alert.show(foo .. ' ' .. bar)`
            ) ===
                `local foo = 'hello'
            local bar = \\"from \\\\\\"Lua\\\\\\"\\"
            hs.alert.show(foo .. ' ' .. bar)`
        );
    });
});
