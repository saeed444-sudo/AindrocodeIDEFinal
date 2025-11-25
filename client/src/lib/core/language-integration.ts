/**
 * Language Integration - Auto-loads workers for all supported languages
 * This module maps each language to its worker and handles the execution pipeline
 */

import { getRuntimeMeta } from './runtime-registry';

export const LANGUAGE_WORKERS: Record<string, () => Worker> = {
  javascript: () => new Worker(
    new URL('../workers/javascript-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  python: () => new Worker(
    new URL('../workers/python-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  sql: () => new Worker(
    new URL('../workers/sql-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  lua: () => new Worker(
    new URL('../workers/lua-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  go: () => new Worker(
    new URL('../workers/go-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  php: () => new Worker(
    new URL('../workers/php-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  ruby: () => new Worker(
    new URL('../workers/ruby-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  rust: () => new Worker(
    new URL('../workers/rust-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  c_cpp: () => new Worker(
    new URL('../workers/cpp-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  java: () => new Worker(
    new URL('../workers/java-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  haskell: () => new Worker(
    new URL('../workers/haskell-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  swift: () => new Worker(
    new URL('../workers/swift-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  csharp: () => new Worker(
    new URL('../workers/csharp-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  kotlin: () => new Worker(
    new URL('../workers/kotlin-worker.ts', import.meta.url),
    { type: 'module' }
  ),
  r: () => new Worker(
    new URL('../workers/r-worker.ts', import.meta.url),
    { type: 'module' }
  ),
};

/**
 * Get worker loader for language
 */
export function getWorkerLoader(language: string): (() => Worker) | null {
  const normalized = language.toLowerCase();
  
  // Direct match
  if (LANGUAGE_WORKERS[normalized]) {
    return LANGUAGE_WORKERS[normalized];
  }
  
  // Try to find by runtime meta
  const meta = getRuntimeMeta(normalized);
  if (meta && LANGUAGE_WORKERS[normalized]) {
    return LANGUAGE_WORKERS[normalized];
  }
  
  return null;
}

/**
 * Get all supported languages with working implementations
 */
export function getFullyIntegratedLanguages(): string[] {
  return Object.keys(LANGUAGE_WORKERS);
}

/**
 * Get supported language count
 */
export function getLanguageCount(): number {
  return Object.keys(LANGUAGE_WORKERS).length;
}
