// Runtime Registry - Maps languages to execution strategies
export type RuntimeType = 'native' | 'wasm' | 'interpreter' | 'compiler' | 'experimental';
export type ExecutionStrategy = 'worker' | 'iframe' | 'inline' | 'http-api';

export interface RuntimeMeta {
  name: string;
  type: RuntimeType;
  strategy: ExecutionStrategy;
  extensions: string[];
  loaderUrl?: string;
  wasmUrl?: string;
  cdnUrl?: string;
  version: string;
  timeoutMs: number;
  maxMemoryMb: number;
  supportLevel: 'full' | 'partial' | 'experimental';
  notes?: string;
}

const RUNTIME_REGISTRY: Record<string, RuntimeMeta> = {
  // ========== PHASE 1: CORE RUNTIMES (MVP) ==========
  javascript: {
    name: 'JavaScript/TypeScript',
    type: 'native',
    strategy: 'worker',
    extensions: ['js', 'jsx', 'mjs', 'ts', 'tsx'],
    version: 'ES2023',
    timeoutMs: 30000,
    maxMemoryMb: 512,
    supportLevel: 'full',
    notes: 'Native browser execution via Worker'
  },
  python: {
    name: 'Python (Pyodide)',
    type: 'interpreter',
    strategy: 'worker',
    extensions: ['py', 'pyw'],
    loaderUrl: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js',
    wasmUrl: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
    version: '3.11',
    timeoutMs: 60000,
    maxMemoryMb: 1024,
    supportLevel: 'full',
    notes: 'Full stdlib via Pyodide, micropip for packages'
  },
  c_cpp: {
    name: 'C/C++ (Emscripten/Clang)',
    type: 'compiler',
    strategy: 'worker',
    extensions: ['c', 'cpp', 'cc', 'cxx', 'h', 'hpp'],
    loaderUrl: './runtimes/clang/loader.js',
    wasmUrl: './runtimes/clang/clang.wasm',
    version: 'clang-15',
    timeoutMs: 60000,
    maxMemoryMb: 2048,
    supportLevel: 'partial',
    notes: 'WASM target, limited stdlib (no native I/O)'
  },
  go: {
    name: 'Go (TinyGo)',
    type: 'compiler',
    strategy: 'worker',
    extensions: ['go'],
    loaderUrl: 'https://cdn.jsdelivr.net/npm/tinygo-wasm@latest/wasm_exec.js',
    wasmUrl: './runtimes/tinygo/tinygo.wasm',
    version: '1.21',
    timeoutMs: 60000,
    maxMemoryMb: 1024,
    supportLevel: 'partial',
    notes: 'TinyGo WASM, limited cgo support'
  },
  sql: {
    name: 'SQL (DuckDB)',
    type: 'interpreter',
    strategy: 'worker',
    extensions: ['sql'],
    wasmUrl: 'https://cdn.jsdelivr.net/npm/@duckdb/wasm@1.28.0/dist/duckdb-mvp.wasm.js',
    version: '0.9',
    timeoutMs: 30000,
    maxMemoryMb: 512,
    supportLevel: 'full',
    notes: 'Local SQL queries via DuckDB WASM'
  },
  lua: {
    name: 'Lua (lua-wasm)',
    type: 'interpreter',
    strategy: 'worker',
    extensions: ['lua'],
    wasmUrl: 'https://cdn.jsdelivr.net/gh/vsergeev/lua-wasm/dist/lua.js',
    version: '5.4',
    timeoutMs: 30000,
    maxMemoryMb: 256,
    supportLevel: 'full',
    notes: 'Lua interpreter compiled to WASM'
  },

  // ========== PHASE 2: EXTENDED RUNTIMES ==========
  php: {
    name: 'PHP (php-wasm)',
    type: 'interpreter',
    strategy: 'worker',
    extensions: ['php'],
    wasmUrl: 'https://cdn.jsdelivr.net/npm/@php-wasm/web@latest/PhpWeb.js',
    version: '8.2',
    timeoutMs: 30000,
    maxMemoryMb: 512,
    supportLevel: 'partial',
    notes: 'PHP 8.2 via WASM, limited extensions'
  },
  ruby: {
    name: 'Ruby (ruby-wasm)',
    type: 'interpreter',
    strategy: 'worker',
    extensions: ['rb'],
    wasmUrl: 'https://cdn.jsdelivr.net/npm/ruby-wasm-umd@latest/dist/ruby.wasm.umd.js',
    version: '3.2',
    timeoutMs: 30000,
    maxMemoryMb: 512,
    supportLevel: 'partial',
    notes: 'Ruby WASM, limited stdlib'
  },
  rust: {
    name: 'Rust (WASM)',
    type: 'compiler',
    strategy: 'worker',
    extensions: ['rs'],
    loaderUrl: './runtimes/rust/loader.js',
    wasmUrl: './runtimes/rust/rust.wasm',
    version: '1.73',
    timeoutMs: 60000,
    maxMemoryMb: 2048,
    supportLevel: 'partial',
    notes: 'Rust → WASM, no_std target'
  },

  // ========== PHASE 3: EXPERIMENTAL ==========
  java: {
    name: 'Java (TeaVM)',
    type: 'compiler',
    strategy: 'worker',
    extensions: ['java'],
    loaderUrl: './runtimes/java/loader.js',
    wasmUrl: './runtimes/java/teavm.wasm',
    version: 'TeaVM',
    timeoutMs: 60000,
    maxMemoryMb: 2048,
    supportLevel: 'experimental',
    notes: 'TeaVM JVM → WASM, limited reflection'
  },
  haskell: {
    name: 'Haskell (Asterius)',
    type: 'compiler',
    strategy: 'worker',
    extensions: ['hs'],
    loaderUrl: './runtimes/haskell/loader.js',
    wasmUrl: './runtimes/haskell/asterius.wasm',
    version: 'Asterius',
    timeoutMs: 90000,
    maxMemoryMb: 2048,
    supportLevel: 'experimental',
    notes: 'Haskell → WASM, large output'
  },
  swift: {
    name: 'Swift (SwiftWasm)',
    type: 'compiler',
    strategy: 'worker',
    extensions: ['swift'],
    loaderUrl: './runtimes/swift/loader.js',
    wasmUrl: './runtimes/swift/swiftwasm.wasm',
    version: '5.9',
    timeoutMs: 60000,
    maxMemoryMb: 2048,
    supportLevel: 'experimental',
    notes: 'Swift → WASM, limited stdlib'
  },

  // ========== HTML/CSS/JSON (Static) ==========
  html: {
    name: 'HTML',
    type: 'native',
    strategy: 'iframe',
    extensions: ['html', 'htm'],
    version: 'HTML5',
    timeoutMs: 10000,
    maxMemoryMb: 256,
    supportLevel: 'full',
    notes: 'Render in sandboxed iframe'
  },
  css: {
    name: 'CSS',
    type: 'native',
    strategy: 'inline',
    extensions: ['css'],
    version: 'CSS3',
    timeoutMs: 1000,
    maxMemoryMb: 0,
    supportLevel: 'full',
    notes: 'Validation only'
  },
  json: {
    name: 'JSON',
    type: 'native',
    strategy: 'inline',
    extensions: ['json'],
    version: 'JSON5',
    timeoutMs: 1000,
    maxMemoryMb: 0,
    supportLevel: 'full',
    notes: 'Parse and format'
  },
};

export function getRuntimeMeta(languageOrExt: string): RuntimeMeta | null {
  const normalized = languageOrExt.toLowerCase().replace(/^\./, '');
  
  // Direct lookup by language name
  if (RUNTIME_REGISTRY[normalized]) {
    return RUNTIME_REGISTRY[normalized];
  }
  
  // Lookup by file extension
  for (const [lang, meta] of Object.entries(RUNTIME_REGISTRY)) {
    if (meta.extensions.includes(normalized)) {
      return meta;
    }
  }
  
  return null;
}

export function getAllRuntimes(): Record<string, RuntimeMeta> {
  return RUNTIME_REGISTRY;
}

export function getFullySupportedRuntimes(): string[] {
  return Object.entries(RUNTIME_REGISTRY)
    .filter(([_, meta]) => meta.supportLevel === 'full')
    .map(([lang, _]) => lang);
}

export function getPartialRuntimes(): string[] {
  return Object.entries(RUNTIME_REGISTRY)
    .filter(([_, meta]) => meta.supportLevel === 'partial')
    .map(([lang, _]) => lang);
}

export function getExperimentalRuntimes(): string[] {
  return Object.entries(RUNTIME_REGISTRY)
    .filter(([_, meta]) => meta.supportLevel === 'experimental')
    .map(([lang, _]) => lang);
}
