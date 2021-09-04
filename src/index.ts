import { RollupOptions } from "rollup";
import { requireShim } from "./plugins/requireShim";
import { resolveImports } from "./plugins/resolveImports";

import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { terser } from "rollup-plugin-terser";

const shebang = require('rollup-plugin-preserve-shebang');

interface CreateConfigOptions {
  env: 'production' | 'dev'
  input: string
  minify: boolean
}

const EMIT_ESM_PLUGINS = [shebang(), requireShim(), resolveImports()];

const DEFAULTS = {
  /**
   * Silence warnings.
   */
  onwarn: () => {},
  /**
   * Plugins necessary to render TypeScript to valid ESNext (no directory
   * imports, must be statically resolved AOT).
   */
  plugins: EMIT_ESM_PLUGINS,
};
/**
 * The minimum config needed to execute the program as expected.
 */
const createDevConfig = (input: string): RollupOptions => {
  return {
    output: {
      file: input,
      format: 'es',
    },
  };
};
/**
 * The maximum compression config for production builds.
 */
const createProductionConfig = (input: string, minify: boolean): RollupOptions => {
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
      ...EMIT_ESM_PLUGINS,
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
  env,
  input,
  minify,
}: CreateConfigOptions): RollupOptions => {
  const envConfig =
    env === 'production'
      ? createProductionConfig(input, minify)
      : createDevConfig(input);

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