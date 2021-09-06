export const a = 10;
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

import { RollupOptions } from "rollup";
import { requireShim } from "./plugins/requireShim";
import { resolveImports } from "./plugins/resolveImports";
import { terser } from "rollup-plugin-terser";

const shebang = require('rollup-plugin-preserve-shebang');

type RunConfig = Omit<CreateConfigOptions, 'action'>;
interface CreateConfigOptions {
  action: 'build' | 'dev' | 'watch'
  input: string
  minify?: boolean
  // extractErrors: boolean
}


const DEFAULT_PLUGINS = [shebang()];
const getEsmPlugins = (watch = false) => [requireShim(), resolveImports(watch)];

const DEFAULTS: RollupOptions = {
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
 * Create a development config which does the least amount of work to emit
 * operable output.
 */
export const createDevConfig = ({ input }: RunConfig): RollupOptions => {
  return {
    ...DEFAULTS,
    input,
    output: {
      file: input,
      format: 'es',
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
    ],
  };
}

/**
 * The maximum compression config for production builds.
 */
export const createBuildConfig = ({ input, minify }: RunConfig): RollupOptions => {
  return {
    ...DEFAULTS,
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
  let config = {};
  switch (action) {
    case 'build':
      config = createBuildConfig({ input, minify });
      break;

    case 'dev':
      config = createDevConfig({ input });
      break;
    
    case 'watch':
      break;
  }

  return {
    ...DEFAULTS,
    ...config,
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