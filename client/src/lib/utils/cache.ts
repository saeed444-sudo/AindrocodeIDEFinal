// IndexedDB Cache for Runtime Blobs

export interface CacheEntry {
  key: string;
  version: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

const DB_NAME = 'AindroCodeRuntimeCache';
const STORE_NAME = 'runtimes';
const CACHE_VERSION = 1;

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
async function initDb(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, CACHE_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('version', 'version', { unique: false });
      }
    };
  });
}

/**
 * Cache a runtime blob
 */
export async function cacheRuntimeBlob(
  key: string,
  version: string,
  blob: Blob,
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  const database = await initDb();
  const entry: CacheEntry = {
    key,
    version,
    blob,
    timestamp: Date.now(),
    size: blob.size,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(entry);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Retrieve a cached runtime blob
 */
export async function getRuntimeBlob(key: string, version?: string): Promise<Blob | null> {
  const database = await initDb();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const entry: CacheEntry | undefined = request.result;
      if (!entry) {
        resolve(null);
        return;
      }
      if (version && entry.version !== version) {
        resolve(null);
        return;
      }
      resolve(entry.blob);
    };
  });
}

/**
 * Clear expired cache (older than maxAgeMs)
 */
export async function clearExpiredCache(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
  const database = await initDb();
  const cutoff = Date.now() - maxAgeMs;
  let deleted = 0;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const range = IDBKeyRange.upperBound(cutoff);
    const request = index.openCursor(range);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cursor.delete();
        deleted++;
        cursor.continue();
      } else {
        resolve(deleted);
      }
    };
  });
}

/**
 * Get cache stats
 */
export async function getCacheStats(): Promise<{
  count: number;
  totalSize: number;
  entries: CacheEntry[];
}> {
  const database = await initDb();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const entries: CacheEntry[] = request.result;
      const totalSize = entries.reduce((sum, e) => sum + e.size, 0);
      resolve({
        count: entries.length,
        totalSize,
        entries,
      });
    };
  });
}

/**
 * Clear all cached runtimes
 */
export async function clearAllCache(): Promise<void> {
  const database = await initDb();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
