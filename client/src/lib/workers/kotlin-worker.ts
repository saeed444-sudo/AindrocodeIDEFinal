// Kotlin Worker - Compile & Execute via Wandbox
import { InMemoryFS, mountProjectFiles } from '../core/fs-sync';
import { compileAndRunKotlin } from '../core/online-compiler';

let fs: InMemoryFS | null = null;

self.onmessage = async (event: MessageEvent) => {
  const { type, entry, files } = event.data;
  if (type === 'run') {
    try {
      fs = new InMemoryFS();
      await mountProjectFiles(fs, files);

      const code = files[entry];
      if (!code) {
        self.postMessage({ type: 'error', data: `Entry file not found: ${entry}` });
        return;
      }

      self.postMessage({ type: 'stdout', data: '⏳ Compiling and running Kotlin...' });
      
      const result = await compileAndRunKotlin(code);
      
      if (result.success && result.output) {
        self.postMessage({ type: 'stdout', data: result.output });
        self.postMessage({
          type: 'exit',
          data: { exitCode: 0, artifacts: fs!.getAllFiles() },
        });
      } else {
        throw new Error(result.error || 'Kotlin execution failed');
      }
    } catch (error) {
      self.postMessage({
        type: 'error',
        data: error instanceof Error ? error.message : String(error),
      });
    }
  }
};
