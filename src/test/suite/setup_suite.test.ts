import * as testUtils from "./test_utils";

/**
 * I image this is not common practice, but I wanted to have a way to setup
 * and teardown the test environment. Also the teardown makes some tests flaky.
 */
suiteSetup("Setup folders", () => {
    testUtils.createDemoFolder();
});

// suiteTeardown("Teardown folders", () => {
//     testUtils.cleanDemoFolder();
// });
