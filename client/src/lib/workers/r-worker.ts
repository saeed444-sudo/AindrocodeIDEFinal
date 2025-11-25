// R Worker - R.js/WebR execution
import { InMemoryFS, mountProjectFiles } from '../core/fs-sync';

let r: any = null;
let fs: InMemoryFS | null = null;

async function loadR() {
  if (r) return;
  try {
    // WebR is available from CDN
    const script = await fetch('https://cdn.jsdelivr.net/npm/webr@latest/dist/webr.js');
    const code = await script.text();
    eval(code);
    r = (globalThis as any).webR || (globalThis as any).R;
  } catch (error) {
    throw new Error(`Failed to load R/WebR: ${error}`);
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { type, entry, files } = event.data;
  if (type === 'run') {
    try {
      await loadR();
      fs = new InMemoryFS();
      await mountProjectFiles(fs, files);

      const code = files[entry];
      if (!code) {
        self.postMessage({ type: 'error', data: `Entry file not found: ${entry}` });
        return;
      }

      let output = '';
      try {
        if (r && r.eval) {
          const result = await r.eval(code);
          output = String(result || '');
          self.postMessage({ type: 'stdout', data: output });
        } else {
          throw new Error('R/WebR not properly initialized');
        }

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
