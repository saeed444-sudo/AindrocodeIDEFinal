// FileSystem Sync Utilities - Write/Read project files to runtime FS

export interface FileSystemAdapter {
  writeFile(path: string, content: string | Uint8Array): Promise<void>;
  readFile(path: string): Promise<string | Uint8Array>;
  mkdir(path: string): Promise<void>;
  ls(path: string): Promise<string[]>;
  rm(path: string): Promise<void>;
}

/**
 * In-memory filesystem (fallback/demo)
 */
export class InMemoryFS implements FileSystemAdapter {
  private files: Map<string, string | Uint8Array> = new Map();

  async writeFile(path: string, content: string | Uint8Array): Promise<void> {
    const dir = path.substring(0, path.lastIndexOf('/'));
    if (dir && !this.files.has(dir)) {
      await this.mkdir(dir);
    }
    this.files.set(path, content);
  }

  async readFile(path: string): Promise<string | Uint8Array> {
    const content = this.files.get(path);
    if (!content) throw new Error(`File not found: ${path}`);
    return content;
  }

  async mkdir(path: string): Promise<void> {
    this.files.set(path, '__dir__');
  }

  async ls(path: string): Promise<string[]> {
    const prefix = path.endsWith('/') ? path : path + '/';
    const files: Set<string> = new Set();
    for (const key of Array.from(this.files.keys())) {
      if (key.startsWith(prefix)) {
        const rel = key.substring(prefix.length);
        const first = rel.split('/')[0];
        if (first) files.add(first);
      }
    }
    return Array.from(files);
  }

  async rm(path: string): Promise<void> {
    this.files.delete(path);
  }

  /**
   * Export all files for artifact collection
   */
  getAllFiles(): Record<string, string | Uint8Array> {
    const result: Record<string, string | Uint8Array> = {};
    for (const [path, content] of Array.from(this.files.entries())) {
      if (content !== '__dir__') {
        result[path] = content;
      }
    }
    return result;
  }
}

/**
 * Project file mounting helpers
 */
export async function mountProjectFiles(
  fs: FileSystemAdapter,
  files: Record<string, string>,
  baseDir: string = '/'
): Promise<void> {
  const basePath = baseDir.endsWith('/') ? baseDir : baseDir + '/';
  
  // Create directory structure first
  const dirs = new Set<string>();
  for (const path of Object.keys(files)) {
    let dir = path;
    while (dir.includes('/')) {
      dir = dir.substring(0, dir.lastIndexOf('/'));
      if (dir) dirs.add(dir);
    }
  }
  for (const dir of Array.from(dirs)) {
    try {
      await fs.mkdir(basePath + dir);
    } catch (e) {
      // Dir might exist
    }
  }
  
  // Write all files
  for (const [path, content] of Object.entries(files)) {
    await fs.writeFile(basePath + path, content);
  }
}

/**
 * Collect output files from runtime FS
 */
export async function snapshotFS(
  fs: FileSystemAdapter,
  paths: string[]
): Promise<Record<string, Uint8Array>> {
  const artifacts: Record<string, Uint8Array> = {};
  
  for (const path of paths) {
    try {
      const content = await fs.readFile(path);
      if (content instanceof Uint8Array) {
        artifacts[path] = content;
      } else if (typeof content === 'string') {
        artifacts[path] = new TextEncoder().encode(content);
      }
    } catch (e) {
      // File might not exist
    }
  }
  
  return artifacts;
}

/**
 * Synchronize files between main thread and worker
 */
export function createFSSyncMessage(action: string, payload: any) {
  return {
    type: 'fs-sync',
    action,
    payload,
  };
}

export interface FSSyncMessage {
  type: 'fs-sync';
  action: 'write' | 'read' | 'mkdir' | 'ls' | 'rm' | 'snapshot';
  payload: any;
}
