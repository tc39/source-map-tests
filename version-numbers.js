// Test that invalid version numbers are rejected.

assert(isValidSourceMap("./version-valid.map"));
assert(!isValidSourceMap("./version-not-a-number.map"));
assert(!isValidSourceMap("./version-too-low.map"));
assert(!isValidSourceMap("./version-too-high.map"));
