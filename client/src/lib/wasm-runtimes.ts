// Multi-language WASM runtime loader system
// Supports: Lua, Go, Ruby, PHP, SQL, Rust, Bash, Java WASM

export interface WasmRuntime {
  name: string;
  ready: boolean;
  error?: string;
  version: string;
}

export interface WasmRuntimeManager {
  lua: WasmRuntime;
  go: WasmRuntime;
  ruby: WasmRuntime;
  php: WasmRuntime;
  sql: WasmRuntime;
  rust: WasmRuntime;
  bash: WasmRuntime;
  java: WasmRuntime;
}

const runtimes: WasmRuntimeManager = {
  lua: { name: "Lua WASM", ready: false, version: "5.4" },
  go: { name: "TinyGo WASM", ready: false, version: "1.21" },
  ruby: { name: "Ruby WASM", ready: false, version: "3.2" },
  php: { name: "PHP WASM", ready: false, version: "8.2" },
  sql: { name: "DuckDB WASM", ready: false, version: "0.9" },
  rust: { name: "Rustc WASM", ready: false, version: "limited" },
  bash: { name: "Shell WASM", ready: false, version: "5.2" },
  java: { name: "TeaVM JVM WASM", ready: false, version: "limited" },
};

// Load WASM runtimes from CDN
async function loadLuaWasm(): Promise<any> {
  if (runtimes.lua.ready) return (window as any).lua;
  try {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/vsergeev/lua-wasm/dist/lua.js";
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    runtimes.lua.ready = true;
    return (window as any).Lua;
  } catch (e) {
    runtimes.lua.error = String(e);
    return null;
  }
}

async function loadSQLWasm(): Promise<any> {
  if (runtimes.sql.ready) return (window as any).duckdb;
  try {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@duckdb/wasm@1.28.0/dist/duckdb-mvp.wasm.js";
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    runtimes.sql.ready = true;
    return (window as any).duckdb;
  } catch (e) {
    runtimes.sql.error = String(e);
    return null;
  }
}

async function loadGoWasm(): Promise<any> {
  if (runtimes.go.ready) return (window as any).Go;
  try {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tinygo-wasm@latest/wasm_exec.js";
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    runtimes.go.ready = true;
    return (window as any).Go;
  } catch (e) {
    runtimes.go.error = String(e);
    return null;
  }
}

async function loadRubyWasm(): Promise<any> {
  if (runtimes.ruby.ready) return (window as any).Ruby;
  try {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/ruby-wasm-umd@latest/dist/ruby.wasm.umd.js";
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    runtimes.ruby.ready = true;
    return (window as any).Ruby;
  } catch (e) {
    runtimes.ruby.error = String(e);
    return null;
  }
}

async function loadPHPWasm(): Promise<any> {
  if (runtimes.php.ready) return (window as any).PHP;
  try {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@php-wasm/web@latest/PhpWeb.js";
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    runtimes.php.ready = true;
    return (window as any).PHP;
  } catch (e) {
    runtimes.php.error = String(e);
    return null;
  }
}

export async function initializeWasmRuntimes(): Promise<void> {
  try {
    // Load runtimes in parallel with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Runtime init timeout")), 5000)
    );

    Promise.race([
      Promise.all([
        loadLuaWasm().catch(() => null),
        loadSQLWasm().catch(() => null),
        loadGoWasm().catch(() => null),
        loadRubyWasm().catch(() => null),
        loadPHPWasm().catch(() => null),
      ]),
      timeoutPromise,
    ]).catch(() => {
      console.warn("Some WASM runtimes failed to load");
    });
  } catch (error) {
    console.error("WASM initialization error:", error);
  }
}

export function getRuntimes(): WasmRuntimeManager {
  return runtimes;
}

export function getRuntime(lang: string): WasmRuntime | null {
  return runtimes[lang as keyof WasmRuntimeManager] || null;
}

// Execute code with specific WASM runtime
export async function executeLua(code: string): Promise<string> {
  try {
    const lua = await loadLuaWasm();
    if (!lua) {
      return 'Lua WASM runtime not available. Loading...\nTry again in a moment.';
    }
    const L = lua.luaL_newstate();
    lua.luaL_openlibs(L);

    let output = "";
    const origLog = (window as any).print;
    (window as any).print = (...args: any[]) => {
      output += args.join(" ") + "\n";
      if (origLog) origLog(...args);
    };

    try {
      lua.luaL_dostring(L, code);
    } finally {
      (window as any).print = origLog;
      lua.lua_close(L);
    }

    return output || "Execution completed";
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function executeSQL(code: string): Promise<string> {
  try {
    const duckdb = await loadSQLWasm();
    if (!duckdb) {
      return 'SQL/DuckDB runtime not available. Loading...\nTry again in a moment.';
    }

    let output = "";
    const origLog = console.log;
    console.log = (...args: any[]) => {
      output += args.join(" ") + "\n";
      origLog(...args);
    };

    try {
      // Execute SQL with DuckDB
      const db = new (window as any).duckdb.Database();
      const conn = db.connect();
      const result = conn.query(code);
      
      // Format results
      if (result && result.toArray) {
        const rows = result.toArray();
        if (rows.length === 0) {
          output = "Query executed. No results.";
        } else {
          // Format as table
          const headers = Object.keys(rows[0]);
          output = headers.join("\t") + "\n";
          rows.forEach((row: any) => {
            output += headers.map((h: string) => row[h]).join("\t") + "\n";
          });
        }
      } else {
        output = String(result) || "Query executed";
      }
    } finally {
      console.log = origLog;
    }

    return output || "SQL executed successfully";
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function executeRuby(code: string): Promise<string> {
  try {
    const ruby = await loadRubyWasm();
    if (!ruby) {
      return 'Ruby WASM runtime not available. Loading...\nTry again in a moment.';
    }

    let output = "";
    const origLog = console.log;
    console.log = (...args: any[]) => {
      output += args.join(" ") + "\n";
      origLog(...args);
    };

    try {
      // Simplified - Ruby WASM API varies
      const result = await (ruby as any).eval(code);
      if (result !== undefined) {
        output += String(result);
      }
    } finally {
      console.log = origLog;
    }

    return output || "Execution completed";
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function executePHP(code: string): Promise<string> {
  try {
    const php = await loadPHPWasm();
    if (!php) {
      return 'PHP WASM runtime not available. Loading...\nTry again in a moment.';
    }

    let output = "";
    const origLog = console.log;
    console.log = (...args: any[]) => {
      output += args.join(" ") + "\n";
      origLog(...args);
    };

    try {
      // PHP WASM API: requires initialization
      const phpInstance = await (php as any).boot();
      const result = await phpInstance.run(`<?php ${code}`);
      output += String(result);
    } finally {
      console.log = origLog;
    }

    return output || "Execution completed";
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Package management stubs
export interface PackageManager {
  install(packages: string[]): Promise<boolean>;
  uninstall(packages: string[]): Promise<boolean>;
  list(): Promise<string[]>;
}

export const npmPackageManager: PackageManager = {
  async install(packages: string[]): Promise<boolean> {
    // Only support CDN/ESM-based packages
    const cdnPackages = packages.map((p) => {
      const version = p.includes("@") ? p.split("@")[1] : "latest";
      const name = p.split("@")[0];
      return `https://cdn.jsdelivr.net/npm/${name}@${version}/+esm`;
    });

    try {
      for (const url of cdnPackages) {
        const script = document.createElement("script");
        script.type = "module";
        script.src = url;
        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      return true;
    } catch {
      return false;
    }
  },

  async uninstall(): Promise<boolean> {
    console.warn("Package uninstall not supported in browser context");
    return false;
  },

  async list(): Promise<string[]> {
    return Object.keys((window as any).__npm_modules || {});
  },
};

export const pipPackageManager: PackageManager = {
  async install(packages: string[]): Promise<boolean> {
    try {
      const pyodide = (window as any).pyodide;
      if (!pyodide) return false;

      const micropip = pyodide.pyimport("micropip");
      await Promise.all(
        packages.map((pkg) => micropip.install(pkg))
      );
      return true;
    } catch {
      return false;
    }
  },

  async uninstall(): Promise<boolean> {
    console.warn("pip uninstall in WASM browser context requires micropip");
    return false;
  },

  async list(): Promise<string[]> {
    try {
      const pyodide = (window as any).pyodide;
      if (!pyodide) return [];
      const sys = pyodide.pyimport("sys");
      return Object.keys(sys.modules);
    } catch {
      return [];
    }
  },
};

// Framework detection
export interface FrameworkConfig {
  name: string;
  detected: boolean;
  buildTool: string;
  canBuild: boolean;
  buildCommand: string;
}

export function detectFramework(
  files: Array<{ name: string; content: string }>
): FrameworkConfig | null {
  // React detection
  if (
    files.some(
      (f) =>
        f.name === "package.json" &&
        (f.content.includes('"react"') || f.content.includes("react-dom"))
    )
  ) {
    return {
      name: "React",
      detected: true,
      buildTool: "esbuild/vite WASM",
      canBuild: true,
      buildCommand: "Static build only (no dev server)",
    };
  }

  // Flask/Django detection
  const requirementsFile = files.find((f) => f.name === "requirements.txt");
  if (requirementsFile) {
    if (requirementsFile.content.includes("flask")) {
      return {
        name: "Flask",
        detected: true,
        buildTool: "Pyodide WASM",
        canBuild: false,
        buildCommand: "Framework server limitations in browser",
      };
    }
    if (requirementsFile.content.includes("django")) {
      return {
        name: "Django",
        detected: true,
        buildTool: "Pyodide WASM",
        canBuild: false,
        buildCommand: "Framework server limitations in browser",
      };
    }
  }

  return null;
}
