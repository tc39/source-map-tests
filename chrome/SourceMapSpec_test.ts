// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const {assert} = chai;

import type * as Platform from '../../../../../front_end/core/platform/platform.js';
import {assertNotNullOrUndefined} from '../../../../../front_end/core/platform/platform.js';
import { SourceMapV3 } from '../../../../../front_end/core/sdk/SourceMap.js';
import * as SDK from '../../../../../front_end/core/sdk/sdk.js';
import {describeWithEnvironment} from '../../helpers/EnvironmentHelpers.js';

interface TestSpec {
  name: string;
  description: string;
  baseFile: string;
  sourceMapFile: string;
  sourceMapIsValid: boolean;
  testActions?: TestAction[];
}

interface TestAction {
  actionType: string;
  generatedLine: number;
  generatedColumn: number;
  originalSource: string;
  originalLine: number;
  originalColumn: number;
  mappedName: null | string;
}

const testCases = await loadTestCasesFromFixture('source-map-spec-tests.json');

describeWithEnvironment.only('SourceMapSpec', async () => {
  testCases.forEach(async ({
    baseFile,
    sourceMapFile,
    testActions,
    sourceMapIsValid
  }) => {
    it('checks mappings', async () => {
      if (!sourceMapIsValid) {
        return;
      }
      
      const baseFileUrl = baseFile as Platform.DevToolsPath.UrlString;
      const sourceMapFileUrl = sourceMapFile as Platform.DevToolsPath.UrlString;
      console.log(`loading sourcemap: ${sourceMapFile}`);
      const sourceMapContent = await loadSourceMapFromFixture(sourceMapFile);

      const sourceMap = new SDK.SourceMap.SourceMap(
        baseFileUrl, 
        sourceMapFileUrl, 
        sourceMapContent);
    
      
      if (testActions !== undefined) {
        testActions.forEach(({
          actionType,
          originalSource,
          originalLine, 
          originalColumn,
          generatedLine,
          generatedColumn
        }) => {
          if (actionType === "checkMapping" && sourceMapIsValid) {
            const actual = sourceMap.findEntry(generatedLine, generatedColumn);
            assertNotNullOrUndefined(actual);
      
            assert.strictEqual(actual.sourceURL, originalSource, 'unexpected source URL');
            assert.strictEqual(actual.sourceLineNumber, originalLine, 'unexpected source line number');
            assert.strictEqual(actual.sourceColumnNumber, originalColumn, 'unexpected source column number');
          }
        });
      }
    }); 
  });
});

async function loadTestCasesFromFixture(filename: string): Promise<TestSpec[]> {
  const testSpec = await getFixtureFileContents<{ tests: TestSpec[] }>(filename);
  return testSpec?.tests ?? [];
};

async function loadSourceMapFromFixture(filename: string): Promise<SourceMapV3> {
  return getFixtureFileContents<SourceMapV3>(filename);
};

async function getFixtureFileContents<T>(filename: string):
    Promise<T> {

  const url = new URL(`/fixtures/sourcemaps/${filename}`, window.location.origin);

  const response = await fetch(url);

  if (response.status !== 200) {
    throw new Error(`Unable to load ${url}`);
  }

  const contentType = response.headers.get('content-type');
  const isGzipEncoded = contentType !== null && contentType.includes('gzip');
  let buffer = await response.arrayBuffer();

  const decoder = new TextDecoder('utf-8');
  const contents = JSON.parse(decoder.decode(buffer)) as T;
  return contents;
}
