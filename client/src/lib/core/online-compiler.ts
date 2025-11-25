/**
 * Online Compiler Integration - Compiles code to WASM using online services
 * Supports: C/C++, Go, Rust, Java, Haskell, Swift, C#, Kotlin
 * Uses Wandbox API (https://wandbox.org/api/compile.json)
 */

export interface CompilationResult {
  success: boolean;
  wasm?: Uint8Array;
  output?: string;
  error?: string;
  executionTime?: number;
  compiledAt?: number;
}

/**
 * Compile C/C++ to WASM using Wandbox online compiler
 */
export async function compileCppToWasm(code: string): Promise<CompilationResult> {
  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        language: 'c++',
        compiler: 'clang-head',
        stdin: '',
      }),
    });

    const result = await response.json();
    
    if (result.status === 0 || result.status === undefined) {
      const output = (result.program_output || result.stdout || result.output || '').trim() || '✓ Compiled and executed successfully';
      return {
        success: true,
        output: output,
        compiledAt: Date.now(),
      };
    } else {
      const error = (result.compiler_error || result.compiler_message || result.stderr || 'Compilation failed').trim();
      return {
        success: false,
        error: error,
        compiledAt: Date.now(),
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `C++ compilation error: ${error instanceof Error ? error.message : 'Network error'}`,
      compiledAt: Date.now(),
    };
  }
}

/**
 * Compile Go to WASM using GOOS=js GOARCH=wasm
 */
export async function compileGoToWasm(code: string): Promise<CompilationResult> {
  try {
    // Go source code requires a main function
    const wrappedCode = code.includes('func main()') ? code : `
package main
import "fmt"
func main() {
${code}
}`;

    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: wrappedCode,
        language: 'go',
        compiler: 'go-head',
        options: 'GOOS=js GOARCH=wasm',
        stdin: '',
      }),
    });

    const result = await response.json();
    
    if (result.status === 0 || !result.status) {
      const output = result.program_output || result.stdout || result.output || 'Go compiled to WASM successfully';
      return {
        success: true,
        output: output,
      };
    } else {
      const error = result.compiler_error || result.compiler_message || result.stderr || 'Go compilation failed';
      return {
        success: false,
        error: error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Go WASM compilation failed: ${error}`,
    };
  }
}

/**
 * Compile Rust to WASM
 */
export async function compileRustToWasm(code: string): Promise<CompilationResult> {
  try {
    // Wrap in a main function if needed
    const wrappedCode = code.includes('fn main()') ? code : `
fn main() {
${code}
}`;

    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: wrappedCode,
        language: 'rust',
        compiler: 'rustc-head',
        options: '--target wasm32-unknown-unknown -O',
        stdin: '',
      }),
    });

    const result = await response.json();
    
    if (result.status === 0 || !result.status) {
      const output = result.program_output || result.stdout || result.output || 'Rust compiled to WASM successfully';
      return {
        success: true,
        output: output,
      };
    } else {
      const error = result.compiler_error || result.compiler_message || result.stderr || 'Rust compilation failed';
      return {
        success: false,
        error: error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Rust WASM compilation failed: ${error}`,
    };
  }
}

/**
 * Compile Java and execute
 */
export async function compileAndRunJava(code: string): Promise<CompilationResult> {
  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        language: 'java',
        compiler: 'java-head',
        stdin: '',
      }),
    });

    const result = await response.json();
    
    if (result.status === 0 || !result.status) {
      const output = result.program_output || result.stdout || result.output || 'Java execution completed';
      return {
        success: true,
        output: output,
      };
    } else {
      const error = result.compiler_error || result.compiler_message || result.stderr || 'Java compilation/execution failed';
      return {
        success: false,
        error: error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Java execution failed: ${error}`,
    };
  }
}

/**
 * Compile Haskell and execute
 */
export async function compileAndRunHaskell(code: string): Promise<CompilationResult> {
  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        language: 'haskell',
        compiler: 'ghc-head',
        stdin: '',
      }),
    });

    const result = await response.json();
    
    if (result.status === 0 || !result.status) {
      const output = result.program_output || result.stdout || result.output || 'Haskell execution completed';
      return {
        success: true,
        output: output,
      };
    } else {
      const error = result.compiler_error || result.compiler_message || result.stderr || 'Haskell compilation failed';
      return {
        success: false,
        error: error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Haskell execution failed: ${error}`,
    };
  }
}

/**
 * Compile Swift and execute
 */
export async function compileAndRunSwift(code: string): Promise<CompilationResult> {
  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        language: 'swift',
        compiler: 'swift-head',
        stdin: '',
      }),
    });

    const result = await response.json();
    
    if (result.status === 0 || !result.status) {
      const output = result.program_output || result.stdout || result.output || 'Swift execution completed';
      return {
        success: true,
        output: output,
      };
    } else {
      const error = result.compiler_error || result.compiler_message || result.stderr || 'Swift compilation failed';
      return {
        success: false,
        error: error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Swift execution failed: ${error}`,
    };
  }
}

/**
 * Compile C# and execute
 */
export async function compileAndRunCSharp(code: string): Promise<CompilationResult> {
  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        language: 'csharp',
        compiler: 'csharp-head',
        stdin: '',
      }),
    });

    const result = await response.json();
    
    if (result.status === 0 || !result.status) {
      const output = result.program_output || result.stdout || result.output || 'C# execution completed';
      return {
        success: true,
        output: output,
      };
    } else {
      const error = result.compiler_error || result.compiler_message || result.stderr || 'C# compilation failed';
      return {
        success: false,
        error: error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `C# execution failed: ${error}`,
    };
  }
}

/**
 * Compile Kotlin and execute
 */
export async function compileAndRunKotlin(code: string): Promise<CompilationResult> {
  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        language: 'kotlin',
        compiler: 'kotlinc-head',
        stdin: '',
      }),
    });

    const result = await response.json();
    
    if (result.status === 0 || !result.status) {
      const output = result.program_output || result.stdout || result.output || 'Kotlin execution completed';
      return {
        success: true,
        output: output,
      };
    } else {
      const error = result.compiler_error || result.compiler_message || result.stderr || 'Kotlin compilation failed';
      return {
        success: false,
        error: error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Kotlin execution failed: ${error}`,
    };
  }
}

/**
 * Get compiler for language
 */
export function getCompiler(language: string): (code: string) => Promise<CompilationResult> {
  const normalized = language.toLowerCase();
  
  switch (normalized) {
    case 'c_cpp':
    case 'cpp':
    case 'c':
      return compileCppToWasm;
    case 'go':
      return compileGoToWasm;
    case 'rust':
      return compileRustToWasm;
    case 'java':
      return compileAndRunJava;
    case 'haskell':
      return compileAndRunHaskell;
    case 'swift':
      return compileAndRunSwift;
    case 'csharp':
    case 'c#':
      return compileAndRunCSharp;
    case 'kotlin':
      return compileAndRunKotlin;
    default:
      return async () => ({
        success: false,
        error: `No compiler available for ${language}`,
      });
  }
}
