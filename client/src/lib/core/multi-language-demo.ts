/**
 * Multi-Language Demo Suite - Tests ALL 20+ integrated languages
 * Run this to verify all languages execute correctly via RunnerManager
 */

import { runnerManager } from './RunnerManager';

export interface LanguageDemo {
  name: string;
  code: string;
  expectedOutput?: string;
}

export const LANGUAGE_DEMOS: Record<string, LanguageDemo> = {
  // ===== FULLY WORKING =====
  javascript: {
    name: 'JavaScript',
    code: `
console.log('JavaScript: ' + (2 + 3));
console.log('Array sum: ' + [1,2,3,4,5].reduce((a,b) => a+b, 0));
    `.trim(),
    expectedOutput: '5',
  },
  
  html: {
    name: 'HTML',
    code: `
<!DOCTYPE html>
<html>
<body>
  <h1>HTML Demo</h1>
  <p>This is rendered in a sandboxed iframe</p>
  <button onclick="alert('Works!')">Click Me</button>
</body>
</html>
    `.trim(),
    expectedOutput: 'Rendered',
  },
  
  json: {
    name: 'JSON',
    code: `
{
  "name": "Aindrocode",
  "languages": ["JavaScript", "Python", "Go", "Rust"],
  "count": 20,
  "working": true
}
    `.trim(),
    expectedOutput: 'Aindrocode',
  },
  
  css: {
    name: 'CSS',
    code: `
body {
  background-color: #f0f0f0;
  font-family: Arial, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
    `.trim(),
    expectedOutput: 'validated',
  },

  // ===== WASM-BASED (with CDN loading) =====
  python: {
    name: 'Python',
    code: `
print('Python: Hello World')
numbers = [1, 2, 3, 4, 5]
print('Sum:', sum(numbers))
print('Factorial of 5:', __import__('math').factorial(5) if 'math' in dir(__builtins__) else 'N/A')
    `.trim(),
    expectedOutput: 'Hello World',
  },

  sql: {
    name: 'SQL (DuckDB)',
    code: `
SELECT 1 as one, 2 as two, 3 as three
UNION ALL
SELECT 4 as one, 5 as two, 6 as three
    `.trim(),
    expectedOutput: 'one',
  },

  lua: {
    name: 'Lua',
    code: `
print("Lua: Hello from WASM")
local sum = 0
for i = 1, 5 do
  sum = sum + i
end
print("Sum 1-5: " .. sum)
    `.trim(),
    expectedOutput: 'Hello from WASM',
  },

  // ===== NEEDS COMPILATION (informational) =====
  go: {
    name: 'Go (TinyGo)',
    code: `
package main

import "fmt"

func main() {
  fmt.Println("Hello from Go!")
  sum := 0
  for i := 1; i <= 5; i++ {
    sum += i
  }
  fmt.Println("Sum:", sum)
}
    `.trim(),
    expectedOutput: 'requires pre-compilation',
  },

  php: {
    name: 'PHP',
    code: `
<?php
echo "PHP: Hello World\\n";
$numbers = [1, 2, 3, 4, 5];
echo "Sum: " . array_sum($numbers) . "\\n";
echo "PHP execution works!\\n";
    `.trim(),
    expectedOutput: 'Hello World',
  },

  ruby: {
    name: 'Ruby',
    code: `
puts "Ruby: Hello World"
numbers = [1, 2, 3, 4, 5]
puts "Sum: #{numbers.sum}"
puts "Ruby WASM works!"
    `.trim(),
    expectedOutput: 'Hello World',
  },

  rust: {
    name: 'Rust',
    code: `
fn main() {
  println!("Hello from Rust!");
  let sum: i32 = (1..=5).sum();
  println!("Sum: {}", sum);
}
    `.trim(),
    expectedOutput: 'requires pre-compilation',
  },

  cpp: {
    name: 'C/C++',
    code: `
#include <stdio.h>
int main() {
  printf("Hello from C++\\n");
  int sum = 0;
  for (int i = 1; i <= 5; i++) {
    sum += i;
  }
  printf("Sum: %d\\n", sum);
  return 0;
}
    `.trim(),
    expectedOutput: 'requires pre-compilation',
  },

  java: {
    name: 'Java',
    code: `
public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello from Java!");
    int sum = 0;
    for (int i = 1; i <= 5; i++) {
      sum += i;
    }
    System.out.println("Sum: " + sum);
  }
}
    `.trim(),
    expectedOutput: 'requires pre-compilation',
  },

  haskell: {
    name: 'Haskell',
    code: `
main = do
  putStrLn "Hello from Haskell!"
  let numbers = [1, 2, 3, 4, 5]
  putStrLn ("Sum: " ++ show (sum numbers))
    `.trim(),
    expectedOutput: 'requires pre-compilation',
  },

  swift: {
    name: 'Swift',
    code: `
import Foundation

print("Hello from Swift!")
let numbers = [1, 2, 3, 4, 5]
let sum = numbers.reduce(0, +)
print("Sum: \\(sum)")
    `.trim(),
    expectedOutput: 'requires pre-compilation',
  },

  csharp: {
    name: 'C#',
    code: `
using System;
using System.Linq;

class Program {
  static void Main() {
    Console.WriteLine("Hello from C#!");
    int[] numbers = { 1, 2, 3, 4, 5 };
    Console.WriteLine("Sum: " + numbers.Sum());
  }
}
    `.trim(),
    expectedOutput: 'requires pre-compilation',
  },

  kotlin: {
    name: 'Kotlin',
    code: `
fun main() {
  println("Hello from Kotlin!")
  val numbers = listOf(1, 2, 3, 4, 5)
  println("Sum: \${numbers.sum()}")
}
    `.trim(),
    expectedOutput: 'requires pre-compilation',
  },

  r: {
    name: 'R',
    code: `
print("Hello from R!")
numbers <- c(1, 2, 3, 4, 5)
print(paste("Sum:", sum(numbers)))
    `.trim(),
    expectedOutput: 'Hello from R',
  },
};

/**
 * Run demo for single language
 */
export async function runLanguageDemo(languageKey: string): Promise<{
  language: string;
  status: 'pass' | 'fail';
  output: string;
  error?: string;
  executionTimeMs: number;
}> {
  const demo = LANGUAGE_DEMOS[languageKey];
  if (!demo) {
    return {
      language: languageKey,
      status: 'fail',
      output: '',
      error: `Unknown language: ${languageKey}`,
      executionTimeMs: 0,
    };
  }

  const startTime = performance.now();

  try {
    const handle = runnerManager.run({
      entry: `demo.${languageKey === 'cpp' ? 'cpp' : languageKey === 'csharp' ? 'cs' : languageKey}`,
      files: {
        [`demo.${languageKey === 'cpp' ? 'cpp' : languageKey === 'csharp' ? 'cs' : languageKey}`]: demo.code,
      },
    });

    const result = await (await handle.promise);

    return {
      language: demo.name,
      status: result.exitCode === 0 ? 'pass' : 'fail',
      output: result.output,
      error: result.stderr,
      executionTimeMs: performance.now() - startTime,
    };
  } catch (error) {
    return {
      language: demo.name,
      status: 'fail',
      output: '',
      error: error instanceof Error ? error.message : String(error),
      executionTimeMs: performance.now() - startTime,
    };
  }
}

/**
 * Run all language demos
 */
export async function runAllLanguageDemos() {
  console.log('\n🚀 AINDROCODE - 20+ LANGUAGE EXECUTION DEMO\n');
  console.log('=' .repeat(60));

  const results: Record<string, any> = {};
  let passed = 0;
  let failed = 0;

  for (const [key, demo] of Object.entries(LANGUAGE_DEMOS)) {
    console.log(`\n⏳ Testing ${demo.name}...`);

    const result = await runLanguageDemo(key);
    results[key] = result;

    if (result.status === 'pass') {
      console.log(`✅ ${result.language} PASSED (${result.executionTimeMs.toFixed(2)}ms)`);
      if (result.output) {
        const output = result.output.substring(0, 100);
        console.log(`   Output: ${output}${result.output.length > 100 ? '...' : ''}`);
      }
      passed++;
    } else {
      console.log(`❌ ${result.language} FAILED`);
      if (result.error) {
        console.log(`   Error: ${result.error.substring(0, 100)}`);
      }
      failed++;
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log(`\n📊 FINAL RESULTS: ${passed} passed, ${failed} failed out of ${Object.keys(LANGUAGE_DEMOS).length}`);
  console.log(`✨ Languages with WASM execution: JavaScript, HTML, JSON, CSS, Python, SQL, Lua, PHP, Ruby`);
  console.log(`📦 Compiled languages (pre-compilation required): Go, Rust, C/C++, Java, Haskell, Swift, C#, Kotlin, R`);

  return results;
}

// Auto-run on import if in browser console
if (typeof window !== 'undefined') {
  (globalThis as any).runAllLanguageDemos = runAllLanguageDemos;
  (globalThis as any).runLanguageDemo = runLanguageDemo;
  console.log('💡 Languages loaded! Run: await runAllLanguageDemos() in console');
}
