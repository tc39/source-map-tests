"use strict";

async function isValidSourceMap(base) {
  try {
    await fetchFixtureSourceMap(base);
  } catch (exn) {
    return false;
  }
  return true;
}

const SPEC_TESTS_URI = `${URL_ROOT_SSL}fixtures/source-map-spec-tests.json`
const testDescriptions = JSON.parse(read(SPEC_TESTS_URI));

for (const testCase of testDescriptions.tests) {
  async function testFunction() {
      const baseName = testCase.baseFile.substring(0, testCase.baseFile.indexOf(".js"));
      Assert.equal(testCase.sourceMapIsValid, await isValidSourceMap(baseName));
  };
  Object.defineProperty(testFunction, "name", { value: testCase.name });
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
