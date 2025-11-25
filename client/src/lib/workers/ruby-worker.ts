// Ruby Worker - ruby-wasm execution
import { InMemoryFS, mountProjectFiles } from '../core/fs-sync';

let ruby: any = null;
let fs: InMemoryFS | null = null;

async function loadRuby() {
  if (ruby) return;
  try {
    const script = await fetch('https://cdn.jsdelivr.net/npm/ruby-wasm-umd@latest/dist/ruby.wasm.umd.js');
    const code = await script.text();
    eval(code);
    ruby = (globalThis as any).Ruby;
  } catch (error) {
    throw new Error(`Failed to load Ruby WASM: ${error}`);
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { type, entry, files } = event.data;
  if (type === 'run') {
    try {
      await loadRuby();
      fs = new InMemoryFS();
      await mountProjectFiles(fs, files);

      const code = files[entry];
      if (!code) {
        self.postMessage({ type: 'error', data: `Entry file not found: ${entry}` });
        return;
      }

      let output = '';
      try {
        if (ruby && typeof ruby.eval === 'function') {
          const result = ruby.eval(code);
          output = String(result || '');
          self.postMessage({ type: 'stdout', data: output });
        } else if (ruby && ruby.run) {
          output = await ruby.run(code);
          self.postMessage({ type: 'stdout', data: output });
        } else {
          throw new Error('Ruby WASM not properly initialized');
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
