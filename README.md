# Source Map Tests

This repository holds testing discussions and tests for the the Source Map debugging format. Specifically, we're looking to encourage discussion around:

- Manual and automated testing strategies for Source Maps
- Gathering a list of Soure Map generators and consumers
- General discussion around deviations between source maps

Open discussion happens in the [GitHub issues](https://github.com/source-map/source-map-tests/issues).

Source Map spec: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#

## Test cases

These test cases are still a work-in-progress 🚧.

How to run in Firefox:
  * Check out mozilla-unified
  * `git am <this-repo>/0001-WIP-Firefox-source-map-spec-tests.patch`
  * `mach build`
  * `mach-with firefox test devtools/client/shared/source-map-loader/`
