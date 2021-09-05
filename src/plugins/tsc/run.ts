/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @see https://github.com/GoogleChromeLabs/proxx/blob/master/lib/simple-ts.js
 * @see https://twitter.com/jaffathecake/status/1145979217852678144
 */

import execa from 'execa';
import glob from 'glob-promise';

import { basename, extname, join } from 'path';
import { cp } from 'fs/promises';
import { parseArgs } from './utils';

interface TscArgs {
  tsconfig?: string | null;
  transpileOnly?: boolean;
  // watch?: boolean;
}

export async function runTsc({
  tsconfig = null,
  transpileOnly = false,
  // watch = false,
}: TscArgs = {}) {
  /**
   * Force src/ rootDir, dist/ outDir, and override noEmit.
   *
   * @todo Leave sourceMaps and declarations in when splitting per-file.
   */
  const args: Record<string, any> = {
    rootDir: 'src/',
    outDir: 'dist/',
    jsx: 'react-jsx',
    module: 'esnext',
    target: 'esnext',
    noEmit: false,
    allowJs: true,
    declaration: true,
    sourceMap: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    resolveJsonModule: true,
  };

  const parsedArgs = parseArgs(args);
  if (tsconfig) {
    parsedArgs.push('-p', tsconfig);
  }

  try {
    await execa('tsc', parsedArgs);
  } catch (error: any) {
    if (!transpileOnly) {
      console.error(error.toString());
      process.exit(1);
    }
  }

  const srcFiles = await glob('src/**/*', { nodir: true });
  await Promise.all(
    srcFiles
      .filter(
        (file: string) => !/^\.(ts|tsx|js|jsx|json)$/.test(extname(file))
      )
      .map(
        async (file: string) => await cp(file, join('dist', basename(file)))
      )
  );

  // if (watch) {
  //   const watchArgs = [...parsedArgs, '--watch', '--preserveWatchOutput'];
  //   console.log('Calling tsc:', watchArgs);
  //   await execa('tsc', watchArgs);
  // }
}
