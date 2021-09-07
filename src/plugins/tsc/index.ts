import fg from 'fast-glob';

import { RunTscArgs, execTsc } from './exec';
import { Plugin } from 'rollup';
import { resolve } from 'path';

export function watchTsSrcFiles(): Plugin {
  return {
    name: 'Adding all TS files in src/ to watch graph.',
    async buildStart() {
      if (this.meta.watchMode) {
        const files = await fg('src/**/*.{ts,tsx,js,jsx,css}');
        for (const file of files) {
          this.addWatchFile(resolve(file));
        }
      }
    },
  };
}

/**
 * This simply runs `tsc` in process.cwd(), reading the TSConfig in that
 * directory, and forcing an emit.
 */
export function tsc(overrides: RunTscArgs = {}): Plugin {
  return {
    name: 'Run TSC',
    /**
     * Wait for the process to finish.
     */
    async buildStart() {
      await execTsc(overrides);
    },
  };
}
