/**
 * Demo Integration Tests for Execution Engine
 * Run these to verify all runtimes are working
 */

import { runnerManager } from './RunnerManager';

export interface DemoTestResult {
  language: string;
  status: 'pass' | 'fail';
  output: string;
  error?: string;
  executionTimeMs: number;
}

/**
 * JavaScript Demo - Direct execution
 */
export async function testJavaScript(): Promise<DemoTestResult> {
  const startTime = performance.now();
  try {
    const handle = runnerManager.run({
      entry: 'main.js',
      files: {
        'main.js': `
          let sum = 0;
          for (let i = 1; i <= 5; i++) {
            sum += i;
          }
          console.log('Sum of 1-5:', sum);
          console.log('JavaScript execution: SUCCESS');
        `,
      },
    });

    const result = await (await handle.promise);

    return {
      language: 'JavaScript',
      status: result.exitCode === 0 ? 'pass' : 'fail',
      output: result.output,
      error: result.stderr,
      executionTimeMs: performance.now() - startTime,
    };
  } catch (error) {
    return {
      language: 'JavaScript',
      status: 'fail',
      output: '',
      error: String(error),
      executionTimeMs: performance.now() - startTime,
    };
  }
}

/**
 * Python Demo - Pyodide execution
 */
export async function testPython(): Promise<DemoTestResult> {
  const startTime = performance.now();
  try {
    const handle = runnerManager.run({
      entry: 'main.py',
      files: {
        'main.py': `
print('Hello from Python')
numbers = [1, 2, 3, 4, 5]
print('Sum:', sum(numbers))
print('Python execution: SUCCESS')
        `,
      },
    });

    const result = await (await handle.promise);

    return {
      language: 'Python',
      status: result.exitCode === 0 ? 'pass' : 'fail',
      output: result.output,
      error: result.stderr,
      executionTimeMs: performance.now() - startTime,
    };
  } catch (error) {
    return {
      language: 'Python',
      status: 'fail',
      output: '',
      error: String(error),
      executionTimeMs: performance.now() - startTime,
    };
  }
}

/**
 * HTML Demo - Iframe rendering
 */
export async function testHTML(): Promise<DemoTestResult> {
  const startTime = performance.now();
  try {
    const handle = runnerManager.run({
      entry: 'index.html',
      files: {
        'index.html': `
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <h1>HTML Execution: SUCCESS</h1>
  <p>This is rendered in a sandboxed iframe</p>
</body>
</html>
        `,
      },
    });

    const result = await (await handle.promise);

    return {
      language: 'HTML',
      status: result.exitCode === 0 ? 'pass' : 'fail',
      output: result.output,
      error: result.stderr,
      executionTimeMs: performance.now() - startTime,
    };
  } catch (error) {
    return {
      language: 'HTML',
      status: 'fail',
      output: '',
      error: String(error),
      executionTimeMs: performance.now() - startTime,
    };
  }
}

/**
 * SQL Demo - DuckDB execution
 */
export async function testSQL(): Promise<DemoTestResult> {
  const startTime = performance.now();
  try {
    const handle = runnerManager.run({
      entry: 'query.sql',
      files: {
        'query.sql': `
SELECT 1 as one, 2 as two, 3 as three
UNION ALL
SELECT 4, 5, 6
        `,
      },
    });

    const result = await (await handle.promise);

    return {
      language: 'SQL',
      status: result.exitCode === 0 ? 'pass' : 'fail',
      output: result.output,
      error: result.stderr,
      executionTimeMs: performance.now() - startTime,
    };
  } catch (error) {
    return {
      language: 'SQL',
      status: 'fail',
      output: '',
      error: String(error),
      executionTimeMs: performance.now() - startTime,
    };
  }
}

/**
 * JSON Demo - Parse & format
 */
export async function testJSON(): Promise<DemoTestResult> {
  const startTime = performance.now();
  try {
    const handle = runnerManager.run({
      entry: 'data.json',
      files: {
        'data.json': `{"name": "Aindrocode", "version": "1.0", "languages": ["js", "python", "go"]}`,
      },
    });

    const result = await (await handle.promise);

    return {
      language: 'JSON',
      status: result.exitCode === 0 ? 'pass' : 'fail',
      output: result.output,
      error: result.stderr,
      executionTimeMs: performance.now() - startTime,
    };
  } catch (error) {
    return {
      language: 'JSON',
      status: 'fail',
      output: '',
      error: String(error),
      executionTimeMs: performance.now() - startTime,
    };
  }
}

/**
 * Run all demo tests
 */
export async function runAllDemos(): Promise<DemoTestResult[]> {
  console.log('🚀 Starting Execution Engine Demo Tests...\n');

  const tests = [
    { name: 'JavaScript', fn: testJavaScript },
    { name: 'Python', fn: testPython },
    { name: 'HTML', fn: testHTML },
    { name: 'SQL', fn: testSQL },
    { name: 'JSON', fn: testJSON },
  ];

  const results: DemoTestResult[] = [];

  for (const test of tests) {
    console.log(`⏳ Running ${test.name} test...`);
    const result = await test.fn();
    results.push(result);

    if (result.status === 'pass') {
      console.log(`✅ ${test.name} PASSED (${result.executionTimeMs.toFixed(2)}ms)`);
      console.log(`   Output: ${result.output.substring(0, 100)}...\n`);
    } else {
      console.log(`❌ ${test.name} FAILED`);
      console.log(`   Error: ${result.error}\n`);
    }
  }

  // Summary
  const passed = results.filter(r => r.status === 'pass').length;
  const total = results.length;
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  console.log(`Total execution time: ${results.reduce((sum, r) => sum + r.executionTimeMs, 0).toFixed(2)}ms`);

  return results;
}
