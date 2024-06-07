# Source Map Tests

This repository holds testing discussions and tests for the the Source Map debugging format. Specifically, we're looking to encourage discussion around:

- Manual and automated testing strategies for Source Maps
- Gathering a list of Soure Map generators and consumers
- General discussion around deviations between source maps

Open discussion happens in the [GitHub issues](https://github.com/source-map/source-map-tests/issues).

Source Map spec: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#

## Test cases

These test cases are still a work-in-progress 🚧.

#### Running the tests

How to run in WebKit:
  * Check out [WebKit](https://github.com/WebKit/WebKit/)
  * `cd` to the checked out WebKit directory.
  * Run `git am <this-repo>/webkit/0001-Add-harness-for-source-maps-spec-tests.patch`
  * Run `Tools/Scripts/build-webkit` (depending on the platform you may need to pass `--gtk` or other flags)
  * Run `Tools/Scripts/run-webkit-tests LayoutTests/inspector/model/source-map-spec.html` (again, you may need `--gtk` on Linux)

For Firefox, see the Mozilla [source-map](https://github.com/mozilla/source-map) library:
  * There is a [branch](https://github.com/takikawa/source-map/tree/add-spec-tests) for adding the spec tests to the package.

How to run in Chrome Devtools:
1. Setup:
    * Install depot_tools following this [depot_tools guide](https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html#_setting_up)
    * Check out [Chrome Devtools](https://chromium.googlesource.com/devtools/devtools-frontend):
    * Run `gclient config https://chromium.googlesource.com/devtools/devtools-frontend --unmanaged`
    * Run `cd devtools-frontend`
    * Run `gclient sync`
    * Run `gn gen out/Default`
2. Build:
    * Run `autoninja -C out/Default`
3. Test:
    * Run `npm run auto-unittest`
4. Apply patches from this repo:
    * Run `git apply <path to .patch file>` in `devtools-frontend` repo

More information about running Chrome Devtools without building Chromium can be found [here](https://chromium.googlesource.com/devtools/devtools-frontend/+/refs/heads/chromium/3965/README.md)

### Goals of tests

* Thoroughly test all aspects of the source maps spec that can be tested.
* Strictly follow the spec when determining test behavior.

### Test coverage

#### Core spec

* Encoding
  - [ ] Source map must be a valid JSON document.
  - Base64 VLQ
    * VLQs should decode correctly
      - [X] A VLQ with a non-base64 character will fail to decode.
      - [ ] A VLQ with one digit and no continuation digits should decode.
      - [ ] A negative VLQ with the sign bit set to 1 should decode.
      - [ ] A VLQ with non-zero continuation bits (and more than one digit) should decode.
      - [X] A VLQ with a non-zero continuation bit with no further digits should fail to decode.
      - [ ] A VLQ should decode with the correct order of digits (least to most significant).
      - [x] A long VLQ with many trailing zero digits will decode.
    * [x] A VLQ exceeding the 32-bit size limit is invalid (note: the spec is unclear on the details of this limit)
    * [x] A VLQ at exactly the 32-bit size limit should be decoded (positive and negative).
* Basic format
  - `version` field
    * [X] Must be present
    * [X] Must be a number
    * [X] Must be 3
  - `file` field
    * [ ] Optional, allow missing
    * [ ] Must be a string? (spec is not clear)
  - `sourceRoot` field
    * [ ] Optional, allow missing
    * [ ] Must be a string? (spec is not clear)
  - `sources` field
    * [X] Must be present
    * [X] Must be an array
    * [X] Array elements must be `null` or a string
  - `sourcesContent` field
    * [X] Must be present
    * [X] Must be an array
    * [X] Array elements must be `null` or a string
  - `names` field
    * [X] Must be present (note: the spec implies this but implementations may not agree)
    * [X] Must be an array
    * [X] Array elements must be strings
  - `mappings` field
    * [X] Must be present
    * [X] Must be a string
    * [ ] Empty string is valid
  - `ignoreList` field
    * [ ] Optional, allow missing
    * [ ] Must be an array
    * [ ] Array elements must be numbers
    * [ ] Elements must not be out of bounds for the `sources` list
  - [X] Extra unrecognized fields are allowed
* Index maps
  - ? Must be mutually exclusive with non-index map?
  - `file` field
    * [ ] Optional, allow missing
    * [ ] Must be a string? (spec is not clear)
  - `sections` field
    * [X] Must be present
    * [X] Must be an array
    * [ ] An empty sections array is valid
    * [X] Array elements are valid section objects
      - `offset` field
        * [X] Must be present
        * `line` field
          - [X] Must be present
          - [X] Must be a number
        * `column` field
          - [X] Must be present
          - [X] Must be a number
      - `map` field
        * [X] Must be present
        * [X] Must be an object
        * [ ] Must be a valid source map
    - [X] Sections are in order (the spec is not 100% clear, but assumption is increasing numeric order, may need subtests)
    - [X] Sections are non-overlapping (the definition of overlap is not clear, may need subtests)
* Mappings format
  - [X] Each line is separated by ";"
  - [X] A line may consist of zero segments (e.g., ";;")
  - [X] Each line consists only of segments separated by ","
  - [X] Must have greater than zero fields (note: many implementations don't check)
  - [X] Must have 1, 4, or 5 fields
  - [X] The source index must not be out of bounds of the sources array
  - [X] The name index must not be out of bounds of the names array
  - Absolute VLQ values must be non-negative
    * [X] The column must be non-negative
    * [X] The source index must be non-negative
    * [X] The original line must be non-negative
    * [X] The original column must be non-negative
    * [X] The name index must be non-negative
  - Relative VLQ values must be non-negative after adding to previous value
    * [X] The column must be non-negative
    * [X] The source index must be non-negative
    * [X] The original line must be non-negative
    * [X] The original column must be non-negative
    * [X] The name index must be non-negative
* Ignore list
  - [X] An ignore list is optional, may be missing
  - [X] An ignore list can't be a non-array value
    * [X] An ignore list can be empty
    * [X] An ignore list entry must be a number
    * [X] An ignore list entry cannot be out-of-bounds of the sources array
  - [X] Ignore list entries are detected and are present
  - [X] Items not specified in the ignore list don't show up as ignored
* Mappings semantics
  - [ ] A source map with no mappings does not map any position.
  - [ ] A single field segment gets mapped to the correct line and column.
  - [X] A four field segment gets mapped to the correct line and column.
  - [X] A five field segment gets mapped to the correct line and column.
  - [X] When a name is present in a segment, it is correctly mapped.
  - [X] When a source is present in a segment, it is correctly mapped.
  - [ ] The second occurence of a field segment in a line is mapped relative to the previous one.
  - [ ] When a new line starts, the generated column field resets to zero rather than being relative to the previous line.
  - [ ] For fields other than the generated column, a segment field that has occured once in a previous line is mapped relatively when it occurs in the next line.
  - [ ] Ensure that a transitive source map mapping works as expected
  - Index maps are correctly used in mappings
    * [ ] An index map with one sub-map will map correctly.
    * [X] An index map with multiple sub-maps will map correctly, with appropriate offsets for the second and later sub-maps.
* Resolution of sources
  - [ ] When `sourceRoot` is provided, it is prepended to any `sources` entries and will be mapped with the full URL.
  - [ ] If the source URL is an absolute URL, it is resolved as an absolute URL.
  - [ ] If the source  URL is a relative URL, it is resolved relative to the source map path.
* Wasm support
  - [ ] Create versions of the tests that use a Wasm source.

### Scopes Proposal

TODO
