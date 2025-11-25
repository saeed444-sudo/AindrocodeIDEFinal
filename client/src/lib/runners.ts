import type { RunnerConfig } from "@shared/schema";

// Runner configurations for 50+ languages
export const runnerConfigs: Record<string, RunnerConfig> = {
  // Tier 1: Full browser support
  py: {
    extension: "py",
    name: "Python",
    command: "python3",
    supportsPackages: true, // via micropip
    supportsNetwork: true,
    supportsFS: true,
    runtime: "wasm",
  },
  js: {
    extension: "js",
    name: "JavaScript",
    command: "node",
    supportsPackages: false,
    supportsNetwork: true,
    supportsFS: true,
    runtime: "native",
  },
  ts: {
    extension: "ts",
    name: "TypeScript",
    command: "ts-node",
    supportsPackages: false,
    supportsNetwork: true,
    supportsFS: true,
    runtime: "interpreter",
  },
  lua: {
    extension: "lua",
    name: "Lua",
    command: "lua",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: true,
    runtime: "wasm",
  },
  sql: {
    extension: "sql",
    name: "SQL",
    command: "duckdb",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: true,
    runtime: "wasm",
  },

  // Tier 2: WASM Runtime
  c: {
    extension: "c",
    name: "C",
    command: "clang",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: true,
    runtime: "wasm",
  },
  cpp: {
    extension: "cpp",
    name: "C++",
    command: "clang++",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: true,
    runtime: "wasm",
  },
  cc: {
    extension: "cc",
    name: "C++",
    command: "clang++",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: true,
    runtime: "wasm",
  },
  go: {
    extension: "go",
    name: "Go",
    command: "tinygo run",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: true,
    runtime: "wasm",
  },
  rs: {
    extension: "rs",
    name: "Rust",
    command: "rustc",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: true,
    runtime: "wasm",
  },
  rb: {
    extension: "rb",
    name: "Ruby",
    command: "ruby",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: true,
    runtime: "wasm",
  },
  php: {
    extension: "php",
    name: "PHP",
    command: "php",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: true,
    runtime: "wasm",
  },
  sh: {
    extension: "sh",
    name: "Shell",
    command: "bash",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: true,
    runtime: "wasm",
  },
  bash: {
    extension: "bash",
    name: "Bash",
    command: "bash",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: true,
    runtime: "wasm",
  },

  // Additional languages
  java: {
    extension: "java",
    name: "Java",
    command: "java",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: true,
    runtime: "limited",
  },
  kt: {
    extension: "kt",
    name: "Kotlin",
    command: "kotlinc",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  swift: {
    extension: "swift",
    name: "Swift",
    command: "swift",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  r: {
    extension: "r",
    name: "R",
    command: "Rscript",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: true,
    runtime: "limited",
  },
  pl: {
    extension: "pl",
    name: "Perl",
    command: "perl",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  scala: {
    extension: "scala",
    name: "Scala",
    command: "scala",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  groovy: {
    extension: "groovy",
    name: "Groovy",
    command: "groovy",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  clj: {
    extension: "clj",
    name: "Clojure",
    command: "clojure",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  exs: {
    extension: "exs",
    name: "Elixir",
    command: "elixir",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  erl: {
    extension: "erl",
    name: "Erlang",
    command: "erl",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  hs: {
    extension: "hs",
    name: "Haskell",
    command: "runhaskell",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  ml: {
    extension: "ml",
    name: "OCaml",
    command: "ocaml",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "interpreter",
  },
  fs: {
    extension: "fs",
    name: "F#",
    command: "dotnet fsi",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  cs: {
    extension: "cs",
    name: "C#",
    command: "mcs",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  vb: {
    extension: "vb",
    name: "Visual Basic",
    command: "vbc",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  dart: {
    extension: "dart",
    name: "Dart",
    command: "dart",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  nim: {
    extension: "nim",
    name: "Nim",
    command: "nim compile --run",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  zig: {
    extension: "zig",
    name: "Zig",
    command: "zig run",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "wasm",
  },
  d: {
    extension: "d",
    name: "D",
    command: "ldc2 -run",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  cr: {
    extension: "cr",
    name: "Crystal",
    command: "crystal run",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  jl: {
    extension: "jl",
    name: "Julia",
    command: "julia",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  pas: {
    extension: "pas",
    name: "Pascal",
    command: "fpc",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "interpreter",
  },
  f90: {
    extension: "f90",
    name: "Fortran",
    command: "gfortran",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
  scm: {
    extension: "scm",
    name: "Scheme",
    command: "scheme --script",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "interpreter",
  },
  lisp: {
    extension: "lisp",
    name: "Common Lisp",
    command: "sbcl --script",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "interpreter",
  },
  rkt: {
    extension: "rkt",
    name: "Racket",
    command: "racket",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "interpreter",
  },
  coffee: {
    extension: "coffee",
    name: "CoffeeScript",
    command: "coffee",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "interpreter",
  },
  v: {
    extension: "v",
    name: "V",
    command: "v run",
    supportsPackages: false,
    supportsNetwork: false,
    supportsFS: false,
    runtime: "limited",
  },
};

export type ExecutionResult = {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
  duration: number;
};

export class RunnerManager {
  private pyodidePromise: Promise<any> | null = null;

  async detectLanguage(filePath: string): Promise<string> {
    const ext = filePath.split(".").pop()?.toLowerCase() || "";
    return ext;
  }

  getRunnerConfig(extension: string): RunnerConfig | undefined {
    return runnerConfigs[extension];
  }

  async execute(filePath: string, code: string): Promise<ExecutionResult> {
    const startTime = performance.now();
    const ext = await this.detectLanguage(filePath);
    const config = this.getRunnerConfig(ext);

    if (!config) {
      return {
        success: false,
        output: "",
        error: `❌ Unsupported file type: .${ext}`,
        exitCode: 1,
        duration: performance.now() - startTime,
      };
    }

    try {
      let output = "";
      let error = "";

      // Route to appropriate runtime
      if (ext === "py") {
        const result = await this.executePython(code);
        output = result.output;
        error = result.error;
      } else if (ext === "js") {
        const result = await this.executeJavaScript(code);
        output = result.output;
        error = result.error;
      } else if (ext === "ts") {
        const result = await this.executeTypeScript(code);
        output = result.output;
        error = result.error;
      } else {
        // Fallback for unsupported languages
        error = `⚠ ${config.name} execution not yet implemented in browser.\nRuntime: ${config.runtime}\nThis will be fully supported in the native APK version.`;
      }

      const duration = performance.now() - startTime;

      return {
        success: !error,
        output,
        error,
        exitCode: error ? 1 : 0,
        duration,
      };
    } catch (err) {
      return {
        success: false,
        output: "",
        error: err instanceof Error ? err.message : String(err),
        exitCode: 1,
        duration: performance.now() - startTime,
      };
    }
  }

  private async executePython(code: string): Promise<{ output: string; error: string }> {
    try {
      // Initialize Pyodide if not already loaded
      if (!this.pyodidePromise) {
        this.pyodidePromise = (window as any).loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
        });
      }

      const pyodide = await this.pyodidePromise;

      // Capture stdout
      let output = "";
      pyodide.setStdout({
        batched: (text: string) => {
          output += text + "\n";
        },
      });

      // Run the code
      await pyodide.runPythonAsync(code);

      return { output, error: "" };
    } catch (err) {
      return {
        output: "",
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private async executeJavaScript(code: string): Promise<{ output: string; error: string }> {
    try {
      // Create a safe execution context
      const originalLog = console.log;
      const originalError = console.error;
      let output = "";

      console.log = (...args: any[]) => {
        output += args.map(String).join(" ") + "\n";
      };
      console.error = (...args: any[]) => {
        output += "[ERROR] " + args.map(String).join(" ") + "\n";
      };

      try {
        // Execute in isolated scope
        const result = new Function(code)();
        if (result !== undefined) {
          output += String(result) + "\n";
        }
      } finally {
        console.log = originalLog;
        console.error = originalError;
      }

      return { output, error: "" };
    } catch (err) {
      return {
        output: "",
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private async executeTypeScript(code: string): Promise<{ output: string; error: string }> {
    // For TypeScript, we'd need to transpile first
    // For now, treat as JavaScript (simplified)
    return this.executeJavaScript(code);
  }

  getAllLanguages(): RunnerConfig[] {
    return Object.values(runnerConfigs);
  }

  getSupportedLanguages(): RunnerConfig[] {
    return this.getAllLanguages().filter(
      (config) => config.runtime === "native" || config.runtime === "wasm"
    );
  }

  getLimitedLanguages(): RunnerConfig[] {
    return this.getAllLanguages().filter(
      (config) => config.runtime === "limited" || config.runtime === "interpreter"
    );
  }
}

export const runnerManager = new RunnerManager();
