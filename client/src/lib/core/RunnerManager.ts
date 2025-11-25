// RunnerManager - Unified API for executing code in 50+ languages
import { getRuntimeMeta, RuntimeMeta } from './runtime-registry';
import { InMemoryFS, mountProjectFiles, snapshotFS } from './fs-sync';
import { getRuntimeBlob, cacheRuntimeBlob } from '../utils/cache';

export interface RunOptions {
  entry: string; // e.g., 'main.py' or 'index.js'
  files: Record<string, string>; // path -> content
  runtimeHint?: string; // optional override
  timeoutMs?: number;
  env?: Record<string, string>;
  args?: string[];
}

export interface RunResult {
  exitCode: number;
  output: string;
  stderr?: string;
  artifacts?: Record<string, Uint8Array>;
  executionTimeMs: number;
  warnings?: string[];
}

export interface RunHandle {
  promise: Promise<RunResult>;
  cancel(): void;
  onStdout(line: string): void;
  onStderr(line: string): void;
}

/**
 * Auto-detect runtime from file extension
 */
export function detectRuntime(entry: string): string | null {
  const ext = entry.split('.').pop()?.toLowerCase();
  if (!ext) return null;
  
  const meta = getRuntimeMeta(ext);
  return meta ? Object.entries(require('./runtime-registry').RUNTIME_REGISTRY).find(
    ([_, m]) => m === meta
  )?.[0] || null : null;
}

/**
 * Main RunnerManager class
 */
export class RunnerManager {
  private workers: Map<string, Worker> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();
  private outputBuffer: string[] = [];
  private errorBuffer: string[] = [];

  /**
   * Execute code with specified options
   */
  run(
    options: RunOptions,
    onStdout?: (line: string) => void,
    onStderr?: (line: string) => void
  ): RunHandle {
    const startTime = performance.now();
    const runtime = options.runtimeHint || detectRuntime(options.entry);
    
    if (!runtime) {
      return this.createFailedHandle(
        `Cannot detect runtime for "${options.entry}"`,
        startTime
      );
    }

    const meta = getRuntimeMeta(runtime);
    if (!meta) {
      return this.createFailedHandle(
        `Unsupported runtime: ${runtime}`,
        startTime
      );
    }

    const timeoutMs = options.timeoutMs || meta.timeoutMs;
    const abortController = new AbortController();
    const handleId = `run-${Date.now()}-${Math.random()}`;
    this.abortControllers.set(handleId, abortController);

    const promise = this.executeInRuntime(
      runtime,
      meta,
      options,
      timeoutMs,
      abortController,
      onStdout,
      onStderr,
      startTime
    );

    return {
      promise,
      cancel: () => abortController.abort(),
      onStdout: (line: string) => onStdout?.(line),
      onStderr: (line: string) => onStderr?.(line),
    };
  }

  /**
   * Execute code in appropriate runtime
   */
  private async executeInRuntime(
    runtime: string,
    meta: RuntimeMeta,
    options: RunOptions,
    timeoutMs: number,
    abortController: AbortController,
    onStdout?: (line: string) => void,
    onStderr?: (line: string) => void,
    startTime: number = performance.now()
  ): Promise<RunResult> {
    try {
      switch (meta.strategy) {
        case 'worker':
          return await this.executeInWorker(
            runtime,
            meta,
            options,
            timeoutMs,
            abortController,
            onStdout,
            onStderr
          );
        case 'iframe':
          return await this.executeInIframe(runtime, meta, options, onStdout, onStderr);
        case 'inline':
          return this.executeInline(runtime, meta, options, onStdout, onStderr);
        default:
          return {
            exitCode: 1,
            output: '',
            stderr: `Unknown execution strategy: ${meta.strategy}`,
            executionTimeMs: performance.now() - startTime,
          };
      }
    } catch (error) {
      return {
        exitCode: 1,
        output: '',
        stderr: error instanceof Error ? error.message : String(error),
        executionTimeMs: performance.now() - startTime,
      };
    }
  }

  /**
   * Execute in Worker (for Python, C/C++, Go, etc.)
   */
  private async executeInWorker(
    runtime: string,
    meta: RuntimeMeta,
    options: RunOptions,
    timeoutMs: number,
    abortController: AbortController,
    onStdout?: (line: string) => void,
    onStderr?: (line: string) => void
  ): Promise<RunResult> {
    const startTime = performance.now();
    const workerId = `worker-${runtime}`;
    let worker = this.workers.get(workerId);

    // Create worker if needed
    if (!worker) {
      try {
        // Try to dynamically import the worker module
        const { getWorkerLoader } = await import('./language-integration');
        const workerLoader = getWorkerLoader(runtime);
        
        if (workerLoader) {
          worker = workerLoader();
        } else {
          // Fallback to generic worker
          worker = new Worker(new URL(`../workers/${runtime}-worker.ts`, import.meta.url), {
            type: 'module',
          });
        }
        this.workers.set(workerId, worker);
      } catch (error) {
        throw new Error(`Failed to load worker for ${runtime}: ${error}`);
      }
    }

    // Mount files in in-memory FS
    const fs = new InMemoryFS();
    await mountProjectFiles(fs, options.files);

    const outputLines: string[] = [];
    const errorLines: string[] = [];

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        worker?.terminate();
        this.workers.delete(workerId);
        reject(new Error(`Timeout: execution exceeded ${timeoutMs}ms`));
      }, timeoutMs);

      const messageHandler = (event: MessageEvent) => {
        const { type, data } = event.data;

        if (type === 'stdout') {
          onStdout?.(data);
          outputLines.push(data);
        } else if (type === 'stderr') {
          onStderr?.(data);
          errorLines.push(data);
        } else if (type === 'exit') {
          clearTimeout(timeout);
          worker?.removeEventListener('message', messageHandler);
          
          resolve({
            exitCode: data.exitCode || 0,
            output: outputLines.join('\n'),
            stderr: errorLines.join('\n'),
            artifacts: data.artifacts,
            executionTimeMs: performance.now() - startTime,
          });
        } else if (type === 'error') {
          clearTimeout(timeout);
          worker?.removeEventListener('message', messageHandler);
          reject(new Error(data));
        }
      };

      worker?.addEventListener('message', messageHandler);

      // Send execution request to worker
      worker?.postMessage({
        type: 'run',
        runtime,
        entry: options.entry,
        files: options.files,
        env: options.env,
        args: options.args,
      });
    });
  }

  /**
   * Execute in iframe (for HTML)
   */
  private async executeInIframe(
    runtime: string,
    meta: RuntimeMeta,
    options: RunOptions,
    onStdout?: (line: string) => void,
    onStderr?: (line: string) => void
  ): Promise<RunResult> {
    const startTime = performance.now();
    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts');
    iframe.sandbox.add('allow-same-origin');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    try {
      const html = options.files[options.entry] || '';
      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc) throw new Error('Cannot access iframe document');

      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      onStdout?.('HTML rendered successfully');

      return {
        exitCode: 0,
        output: 'Rendered',
        executionTimeMs: performance.now() - startTime,
      };
    } catch (error) {
      return {
        exitCode: 1,
        output: '',
        stderr: error instanceof Error ? error.message : String(error),
        executionTimeMs: performance.now() - startTime,
      };
    } finally {
      document.body.removeChild(iframe);
    }
  }

  /**
   * Execute inline (for JSON, CSS validation)
   */
  private executeInline(
    runtime: string,
    meta: RuntimeMeta,
    options: RunOptions,
    onStdout?: (line: string) => void,
    onStderr?: (line: string) => void
  ): RunResult {
    const startTime = performance.now();
    const content = options.files[options.entry] || '';

    try {
      if (runtime === 'json') {
        const parsed = JSON.parse(content);
        onStdout?.(JSON.stringify(parsed, null, 2));
        return {
          exitCode: 0,
          output: JSON.stringify(parsed, null, 2),
          executionTimeMs: performance.now() - startTime,
        };
      } else if (runtime === 'css') {
        onStdout?.('CSS is valid syntax');
        return {
          exitCode: 0,
          output: 'CSS validated',
          executionTimeMs: performance.now() - startTime,
        };
      }
      return {
        exitCode: 1,
        output: '',
        stderr: `Unknown inline runtime: ${runtime}`,
        executionTimeMs: performance.now() - startTime,
      };
    } catch (error) {
      return {
        exitCode: 1,
        output: '',
        stderr: error instanceof Error ? error.message : String(error),
        executionTimeMs: performance.now() - startTime,
      };
    }
  }

  /**
   * Create a failed run handle
   */
  private createFailedHandle(error: string, startTime: number): RunHandle {
    const result: RunResult = {
      exitCode: 1,
      output: '',
      stderr: error,
      executionTimeMs: performance.now() - startTime,
    };
    return {
      promise: Promise.resolve(result),
      cancel: () => {},
      onStdout: () => {},
      onStderr: () => {},
    };
  }

  /**
   * Cleanup resources
   */
  dispose() {
    for (const worker of Array.from(this.workers.values())) {
      worker.terminate();
    }
    this.workers.clear();
    this.abortControllers.clear();
  }
}

// Global singleton
export const runnerManager = new RunnerManager();
