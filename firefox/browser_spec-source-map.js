"use strict";

async function isValidSourceMap(base) {
  try {
    await fetchFixtureSourceMap(base);
  } catch (exn) {
    return false;
  }
  return true;
}

add_task(async function testSourceMapVersion() {

  Assert.equal(true, await isValidSourceMap("version-valid"));
  Assert.equal(false, await isValidSourceMap("version-not-a-number"));
  Assert.equal(false, await isValidSourceMap("version-too-low"));
  Assert.equal(false, await isValidSourceMap("version-too-high"));

});
