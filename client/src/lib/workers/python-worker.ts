// Python Worker - Pyodide execution
import { InMemoryFS, mountProjectFiles, snapshotFS } from '../core/fs-sync';

let pyodide: any = null;
let fs: InMemoryFS | null = null;

async function loadPyodide() {
  if (pyodide) return;
  const script = await fetch('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
  const scriptText = await script.text();
  eval(scriptText);
  pyodide = (globalThis as any).loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
  if (pyodide && typeof pyodide.then === 'function') {
    pyodide = await pyodide;
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { type, entry, files, env, args } = event.data;

  if (type === 'run') {
    try {
      await loadPyodide();
      fs = new InMemoryFS();
      await mountProjectFiles(fs, files);

      const code = files[entry];
      if (!code) {
        self.postMessage({ type: 'error', data: `Entry file not found: ${entry}` });
        return;
      }

      let output = '';
      const origLog = console.log;
      console.log = (...args: any[]) => {
        const line = args.map(String).join(' ');
        output += line + '\n';
        self.postMessage({ type: 'stdout', data: line });
      };

      try {
        pyodide.runPython(code);
        self.postMessage({
          type: 'exit',
          data: {
            exitCode: 0,
            artifacts: fs.getAllFiles(),
          },
        });
      } finally {
        console.log = origLog;
      }
    } catch (error) {
      self.postMessage({
        type: 'error',
        data: error instanceof Error ? error.message : String(error),
      });
    }
  }
};
