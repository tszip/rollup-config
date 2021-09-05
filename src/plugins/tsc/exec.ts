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
import fs from 'fs-extra';
import execa from 'execa';
import glob from 'glob-promise';

import { basename, extname, join } from 'path';
import { getTscFlags } from './utils';

export interface RunTscArgs {
  tsconfig?: string;
  transpileOnly?: boolean;
}

export const execTsc = async ({
  tsconfig,
  transpileOnly = false,
  // watch = false,
}: RunTscArgs) => {

  const tscFlags = getTscFlags({ tsconfig });

  /**
   * Execute TSC and transpile.
   */
  try {
    await execa('tsc', tscFlags);
  } catch (error: any) {
    if (!transpileOnly) {
      console.error(error.toString());
      process.exit(1);
    }
  }

  /**
   * Copy over any CSS etc. (non-TS/JS/JSON) that TSC might not have grabbed.
   */
  const srcFiles = await glob('src/**/*', { nodir: true });
  await Promise.all(
    srcFiles
      .filter(
        (file: string) => !/^\.(ts|tsx|js|jsx|json)$/.test(extname(file))
      )
      .map(
        async (file: string) => await fs.copy(file, join('dist', basename(file)))
      )
  );

  // if (watch) {
  //   const watchArgs = [...parsedArgs, '--watch', '--preserveWatchOutput'];
  //   console.log('Calling tsc:', watchArgs);
  //   await execa('tsc', watchArgs);
  // }
}
