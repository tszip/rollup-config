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

/**
 * Force src/ rootDir, dist/ outDir, and override noEmit.
 */
const DEFAULT_TSC_FLAGS = {
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

type TscFlagOverrides = Partial<typeof DEFAULT_TSC_FLAGS>;
type CustomTscFlags = {
  tsconfig?: string;
};

type TscFlags = CustomTscFlags & TscFlagOverrides;

export const getTscFlags = (customFlags: TscFlags) => {
  const flags: TscFlags = {
    ...DEFAULT_TSC_FLAGS,
    ...customFlags,
  };

  const args: string[] = [];
  for (const [flag, value] of Object.entries(flags)) {
    if (!value) continue;
    switch (flag) {
      case 'tsconfig':
        args.push('-p', value.toString());
        break;
      
      default:
        args.push(`--${flag}`, value.toString());
        break;
    }
  }

  return args;
}