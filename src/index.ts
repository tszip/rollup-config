// import * as typescript from 'typescript';
// import { resolve } from 'path';

import typescriptPlugin from "@rollup/plugin-typescript";
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

import { RollupOptions } from "rollup";
import { join, relative } from "path";
import { requireShim } from "./plugins/requireShim";
import { resolveImports } from "./plugins/resolveImports";
import { terser } from "rollup-plugin-terser";
// import { errorExtraction } from "./plugins/extractErrors";

const shebang = require('rollup-plugin-preserve-shebang');

interface CreateConfigOptions {
  action: 'build' | 'watch'
  input: string
  minify?: boolean
  // extractErrors: boolean
}

type RunConfig = Omit<CreateConfigOptions, 'action'>;

const DEFAULT_PLUGINS = [shebang()];
const getEsmPlugins = (watch = false) => [requireShim(), resolveImports(watch)];

const DEFAULTS = {
  /**
   * Silence warnings.
   */
  onwarn: () => {},
  /**
   * Plugins necessary to render TypeScript to valid ESNext (no directory
   * imports, must be statically resolved AOT).
   */
  plugins: getEsmPlugins(),
};
/**
 * The minimum config needed to execute the program as expected.
 */
const createWatchConfig = ({ input }: Omit<RunConfig, 'minify'>): RollupOptions => {
  return {
    output: {
      file: join('dist', relative('./src', input)),
      format: 'es',
    },
    plugins: [
      ...DEFAULT_PLUGINS,
      typescriptPlugin(),
      ...getEsmPlugins(true),
    ],
    watch: {
      include: ['src/**'],
      exclude: ['node_modules/**', 'dist/**'],
    },
  };
};
/**
 * The maximum compression config for production builds.
 */
const createBuildConfig = ({ input, minify }: RunConfig): RollupOptions => {
  return {
    output: {
      file: input,
      format: 'es',
      freeze: false,
      esModule: true,
      sourcemap: false,
      exports: 'named',
    },
    plugins: [
      ...DEFAULT_PLUGINS,
      ...getEsmPlugins(),
      input.endsWith('.css') &&
        postcss({
          plugins: [
            autoprefixer(),
            cssnano({
              preset: 'default',
            }),
          ],
          inject: false,
          extract: true,
        }),
      minify && terser({
        format: {
          keep_quoted_props: true,
          comments: false,
        },
        compress: {
          keep_infinity: true,
          pure_getters: true,
          passes: 2,
        },
        ecma: 2020,
        module: true,
        toplevel: true,
      }),
    ],
    shimMissingExports: true,
    treeshake: {
      propertyReadSideEffects: false,
    },
  };
}

export const createConfig = ({
  action,
  input,
  minify = false,
  // extractErrors,
}: CreateConfigOptions): RollupOptions => {
  const envConfig =
    action === 'build'
      ? createBuildConfig({ input, minify })
      : createWatchConfig({ input });

  return {
    ...DEFAULTS,
    ...envConfig,
    /**
     * Entry-point to create a config for.
     */
    input,
    /**
     * Mark all other entry-points as extern (do not resolve or bundle them).
     */
    external: (id: string) => id !== input,
  };
}