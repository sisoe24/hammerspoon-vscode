import * as assert from "assert";

import { escapeString } from "../../repl";

suite("Test Escape String", () => {
    test("Test string with dobule quotes", async () => {
        assert.ok(
            escapeString(`hs.alert.show("Hello")`) ===
                `hs.alert.show(\\"Hello\\")`
        );
    });

    test("Test string with single quotes", async () => {
        assert.ok(
            escapeString(`hs.alert.show('Hello')`) === `hs.alert.show('Hello')`
        );
    });

    test("Test complex string escaping", async () => {
        assert.ok(
            escapeString(
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
