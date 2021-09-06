import { Plugin, RenderedChunk } from "rollup";

const REQUIRE_SHIM = `import { require } from '@tszip/esm-require';\n`;

export const requireShim = (): Plugin => ({
  name: 'Shim require().',
  renderChunk: async (code, chunk: RenderedChunk) => {
    if (chunk.imports.includes('@tszip/esm-require')) {
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