import { Plugin } from "rollup";

const REQUIRE_SHIM = `import{require}from'@tszip/esm-require';`;

export const requireShim = (): Plugin => ({
  name: 'Shim require().',
  renderChunk: async (code) => {
    if (code.includes('require(') || code.includes('require.')) {
      let banner = REQUIRE_SHIM;
      if (code.startsWith('#!')) {
        const afterNewline = code.indexOf('\n') + 1;
        const shebang = code.slice(0, afterNewline);
        code = code.slice(afterNewline);
        banner = shebang + REQUIRE_SHIM;
      }
      code = banner + code;
    }

    return {
      code,
      map: null,
    };
  },
});