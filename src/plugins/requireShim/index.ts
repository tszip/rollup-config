import { Plugin, RenderedChunk } from "rollup";

const REQUIRE_SHIM = `await (async()=>{if(void 0===globalThis.require){const{default:e}=await import("module");globalThis.require=e.createRequire(import.meta.url)}})();\n`;

export const requireShim = (): Plugin => ({
  name: 'Shim require().',
  renderChunk: async (code, chunk: RenderedChunk) => {
    /**
    * Skip if the shim already exists, or if we're emitting this polyfill.
    */
    if (
      chunk.imports.includes('@tszip/esm-require') ||
      chunk?.facadeModuleId?.endsWith('esm-require/dist/index.js')
    ) {
      return null;
    }

    if (code.startsWith('#!')) {
      const afterNewline = code.indexOf('\n') + 1;
      const shebang = code.slice(0, afterNewline);
      return {
        code: shebang + REQUIRE_SHIM + code.slice(afterNewline),
        map: null
      };
    }

    return {
      code: REQUIRE_SHIM + code,
      map: null,
    };
  },
});