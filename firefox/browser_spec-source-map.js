"use strict";

const {
  generatedToOriginalId,
} = require("resource://devtools/client/shared/source-map-loader/utils/index.js");

async function checkValidity(isValid, base, testCase) {
  try {
    await fetchFixtureSourceMap(base);
    const originalId = generatedToOriginalId(testCase.baseFile, "unused");
    await gSourceMapLoader.getOriginalRanges(originalId);
  } catch (exn) {
    Assert.ok(!isValid, "Source map loading failed with " + exn.message);
    return;
  }
  Assert.ok(isValid, "Source map loading should have failed but did not");
}

async function checkMapping(testCase, action) {
  const originalId = generatedToOriginalId(testCase.baseFile, `${URL_ROOT_SSL}fixtures/${action.originalSource}`);
  const generatedLoc = await gSourceMapLoader.getGeneratedLocation({
    sourceId: originalId,
    line: action.originalLine + 1,
    column: action.originalColumn,
  });
  Assert.ok(generatedLoc !== null, "Location lookup should not return null");
  Assert.equal(testCase.baseFile, generatedLoc.sourceId);
  Assert.equal(action.generatedLine + 1, generatedLoc.line);
  Assert.equal(action.generatedColumn, generatedLoc.column);
}

const SPEC_TESTS_URI = `${URL_ROOT_SSL}fixtures/source-map-spec-tests.json`
const testDescriptions = JSON.parse(read(SPEC_TESTS_URI));

for (const testCase of testDescriptions.tests) {
  // The following uses a hack to ensure the test case name is used in stack traces.
  const testFunction = {[testCase.name]: async function() {
    const baseName = testCase.baseFile.substring(0, testCase.baseFile.indexOf(".js"));
    await checkValidity(testCase.sourceMapIsValid, baseName, testCase);

    if (testCase.testActions) {
      for (const action of testCase.testActions) {
        if (action.actionType === "checkMapping")
          await checkMapping(testCase, action);
      }
    }
  }}[testCase.name];
  add_task(testFunction);
}

function read(srcChromeURL) {
  const scriptableStream = Cc[
    "@mozilla.org/scriptableinputstream;1"
  ].getService(Ci.nsIScriptableInputStream);

  const channel = NetUtil.newChannel({
    uri: srcChromeURL,
    loadUsingSystemPrincipal: true,
  });
  const input = channel.open();
  scriptableStream.init(input);

  let data = "";
  while (input.available()) {
    data = data.concat(scriptableStream.read(input.available()));
  }
  scriptableStream.close();
  input.close();

  return data;
}
