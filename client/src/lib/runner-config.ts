// Runner capabilities and configuration per language
export interface RunnerCapabilities {
  networkAccess: boolean;
  filesystemSimulation: boolean;
  hasCompiler: boolean;
  hasInterpreter: boolean;
  supportsPackageManager: boolean;
  lspSupported: boolean;
  wasmSupported: boolean;
}

export interface LanguageConfig {
  name: string;
  extensions: string[];
  capabilities: RunnerCapabilities;
  wasmModule?: string;
  interpreter?: string;
}

export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  python: {
    name: "Python",
    extensions: ["py"],
    capabilities: {
      networkAccess: false,
      filesystemSimulation: true,
      hasCompiler: false,
      hasInterpreter: true,
      supportsPackageManager: true, // micropip for pyodide
      lspSupported: true,
      wasmSupported: true,
    },
    wasmModule: "pyodide",
    interpreter: "python3",
  },
  javascript: {
    name: "JavaScript",
    extensions: ["js", "jsx", "mjs"],
    capabilities: {
      networkAccess: false,
      filesystemSimulation: true,
      hasCompiler: false,
      hasInterpreter: true,
      supportsPackageManager: true,
      lspSupported: true,
      wasmSupported: false,
    },
    interpreter: "node",
  },
  typescript: {
    name: "TypeScript",
    extensions: ["ts", "tsx"],
    capabilities: {
      networkAccess: false,
      filesystemSimulation: true,
      hasCompiler: true,
      hasInterpreter: true,
      supportsPackageManager: true,
      lspSupported: true,
      wasmSupported: false,
    },
    interpreter: "node",
  },
  lua: {
    name: "Lua",
    extensions: ["lua"],
    capabilities: {
      networkAccess: false,
      filesystemSimulation: true,
      hasCompiler: false,
      hasInterpreter: true,
      supportsPackageManager: false,
      lspSupported: true,
      wasmSupported: true,
    },
    wasmModule: "lua-wasm",
    interpreter: "lua",
  },
  sql: {
    name: "SQL",
    extensions: ["sql"],
    capabilities: {
      networkAccess: false,
      filesystemSimulation: true,
      hasCompiler: false,
      hasInterpreter: true,
      supportsPackageManager: false,
      lspSupported: true,
      wasmSupported: true,
    },
    wasmModule: "duckdb",
    interpreter: "duckdb",
  },
  rust: {
    name: "Rust",
    extensions: ["rs"],
    capabilities: {
      networkAccess: false,
      filesystemSimulation: true,
      hasCompiler: true,
      hasInterpreter: false,
      supportsPackageManager: true,
      lspSupported: true,
      wasmSupported: true,
    },
    interpreter: "rustc",
  },
  go: {
    name: "Go",
    extensions: ["go"],
    capabilities: {
      networkAccess: false,
      filesystemSimulation: true,
      hasCompiler: true,
      hasInterpreter: false,
      supportsPackageManager: true,
      lspSupported: true,
      wasmSupported: false,
    },
    interpreter: "go",
  },
  cpp: {
    name: "C++",
    extensions: ["cpp", "cc", "cxx"],
    capabilities: {
      networkAccess: false,
      filesystemSimulation: true,
      hasCompiler: true,
      hasInterpreter: false,
      supportsPackageManager: true,
      lspSupported: true,
      wasmSupported: false,
    },
    interpreter: "g++",
  },
  java: {
    name: "Java",
    extensions: ["java"],
    capabilities: {
      networkAccess: false,
      filesystemSimulation: true,
      hasCompiler: true,
      hasInterpreter: true,
      supportsPackageManager: true,
      lspSupported: true,
      wasmSupported: false,
    },
    interpreter: "java",
  },
};

export function getLanguageConfig(language: string): LanguageConfig | undefined {
  return LANGUAGE_CONFIGS[language.toLowerCase()];
}

export function canRunCode(language: string): boolean {
  const config = getLanguageConfig(language);
  return config ? config.capabilities.hasInterpreter || config.capabilities.hasCompiler : false;
}

export function supportsLSP(language: string): boolean {
  const config = getLanguageConfig(language);
  return config?.capabilities.lspSupported ?? false;
}

export function supportsWASM(language: string): boolean {
  const config = getLanguageConfig(language);
  return config?.capabilities.wasmSupported ?? false;
}
