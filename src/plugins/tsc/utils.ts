import * as ts from 'typescript';

export function loadConfig() {
  const fileName = ts.findConfigFile('.', ts.sys.fileExists);
  if (!fileName) throw Error('tsconfig not found');

  const text = ts.sys.readFile(fileName) ?? '';
  const loadedConfig = ts.parseConfigFileTextToJson(fileName, text).config;
  const parsedTsConfig = ts.parseJsonConfigFileContent(
    loadedConfig,
    ts.sys,
    process.cwd(),
    undefined,
    fileName
  );
  
  return parsedTsConfig;
}

export function resolveId(id: string, importer = '') {
  const config = loadConfig();

  // If there isn't an importer, it's an entry point, so we don't need to resolve it relative
  // to something.
  if (!importer) return null;

  const tsResolve = ts.resolveModuleName(id, importer, config.options, ts.sys);

  if (
    // It didn't find anything
    !tsResolve.resolvedModule ||
    // Or if it's linking to a definition file, it's something in node_modules,
    // or something local like css.d.ts
    tsResolve.resolvedModule.extension === '.d.ts'
  ) {
    return null;
  }

  return tsResolve.resolvedModule.resolvedFileName;
}

export const parseArgs = (options: { [key: string]: any }) => {
  const args: string[] = [];
  for (const [key, val] of Object.entries(options)) {
    args.push(`--${key}`, val.toString());
  }

  return args;
};
