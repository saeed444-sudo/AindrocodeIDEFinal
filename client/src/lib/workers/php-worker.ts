// PHP Worker - php-wasm execution
import { InMemoryFS, mountProjectFiles } from '../core/fs-sync';

let php: any = null;
let fs: InMemoryFS | null = null;

async function loadPHP() {
  if (php) return;
  try {
    const script = await fetch('https://cdn.jsdelivr.net/npm/@php-wasm/web@latest/PhpWeb.js');
    const code = await script.text();
    eval(code);
    php = (globalThis as any).PHP;
  } catch (error) {
    throw new Error(`Failed to load PHP WASM: ${error}`);
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { type, entry, files } = event.data;
  if (type === 'run') {
    try {
      await loadPHP();
      fs = new InMemoryFS();
      await mountProjectFiles(fs, files);

      const code = files[entry];
      if (!code) {
        self.postMessage({ type: 'error', data: `Entry file not found: ${entry}` });
        return;
      }

      let output = '';
      try {
        // PHP code needs to be wrapped with <?php tags if not present
        const phpCode = code.includes('<?php') ? code : `<?php\n${code}`;
        
        if (php && php.run) {
          output = await php.run(phpCode);
          self.postMessage({ type: 'stdout', data: output });
        } else {
          throw new Error('PHP WASM not properly initialized');
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
