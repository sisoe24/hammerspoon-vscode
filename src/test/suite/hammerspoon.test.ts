import * as assert from "assert";
import * as hs from "../../providers/hammerspoon";
import * as testUtils from "./test_utils";

import * as console from "../../console";

const sampleOutput = testUtils.formatContent(`
2022-03-10 11:16:37: -- Loading extension: fs
2022-03-10 11:16:37: 11:16:37 ERROR: test
2022-03-10 11:16:37:              hotkey: Enabled hotkey ⌃⌥C: Coords copied
2022-03-10 11:16:37: -> test
2022-03-10 11:16:37: -- Done.
`);

suite("Hammerspoon Console", () => {
    test("Get console text", async () => {
        // XXX: this would fail if hammerspoon app is not running
        assert.ok(await console.getHsConsoleOutput());
    });

    test("Filter output but no text", () => {
        const output = console.filterOutput("", ["ERROR:.+", "->.+"]);
        assert.ok(!output);
    });

    test("Filter output text", () => {
        const output = console.filterOutput(sampleOutput, ["ERROR:.+", "->.+"]);
        assert.strictEqual(output, "ERROR: test\n-> test\n");
    });
});
