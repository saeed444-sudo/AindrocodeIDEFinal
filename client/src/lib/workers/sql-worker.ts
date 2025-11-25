// SQL Worker - DuckDB execution
import { InMemoryFS, mountProjectFiles } from '../core/fs-sync';

let duckdb: any = null;
let fs: InMemoryFS | null = null;

async function loadDuckDB() {
  if (duckdb) return;
  try {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@duckdb/wasm@1.28.0/dist/duckdb-mvp.wasm.js';
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    duckdb = (globalThis as any).duckdb;
  } catch (error) {
    throw new Error(`Failed to load DuckDB: ${error}`);
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { type, entry, files } = event.data;

  if (type === 'run') {
    try {
      await loadDuckDB();
      fs = new InMemoryFS();
      await mountProjectFiles(fs, files);

      const sql = files[entry];
      if (!sql) {
        self.postMessage({ type: 'error', data: `Entry file not found: ${entry}` });
        return;
      }

      let output = '';
      try {
        const db = new (duckdb as any).Database();
        const conn = db.connect();
        const result = conn.query(sql);

        if (result && result.toArray) {
          const rows = result.toArray();
          if (rows.length === 0) {
            output = 'Query executed. No results.';
          } else {
            const headers = Object.keys(rows[0]);
            output = headers.join('\t') + '\n';
            rows.forEach((row: any) => {
              output += headers.map((h: string) => row[h]).join('\t') + '\n';
            });
          }
        } else {
          output = String(result) || 'Query executed';
        }

        self.postMessage({ type: 'stdout', data: output });
        self.postMessage({
          type: 'exit',
          data: { exitCode: 0, artifacts: fs!.getAllFiles() },
        });
      } catch (error) {
        throw error;
      }
    } catch (error) {
      self.postMessage({
        type: 'error',
        data: error instanceof Error ? error.message : String(error),
      });
    }
  }
};
