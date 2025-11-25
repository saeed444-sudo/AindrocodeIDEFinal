// JavaScript Worker - Direct execution
import { InMemoryFS, mountProjectFiles } from '../core/fs-sync';

let fs: InMemoryFS | null = null;

self.onmessage = async (event: MessageEvent) => {
  const { type, entry, files, env, args } = event.data;

  if (type === 'run') {
    try {
      fs = new InMemoryFS();
      await mountProjectFiles(fs, files);

      const code = files[entry];
      if (!code) {
        self.postMessage({ type: 'error', data: `Entry file not found: ${entry}` });
        return;
      }

      let output = '';
      const origLog = console.log;
      const origError = console.error;
      
      console.log = (...args: any[]) => {
        const line = args.map(String).join(' ');
        output += line + '\n';
        self.postMessage({ type: 'stdout', data: line });
      };
      
      console.error = (...args: any[]) => {
        const line = args.map(String).join(' ');
        output += line + '\n';
        self.postMessage({ type: 'stderr', data: line });
      };

      try {
        // Execute code with global scope
        const fn = new Function(code);
        await fn();

        self.postMessage({
          type: 'exit',
          data: {
            exitCode: 0,
            artifacts: fs!.getAllFiles(),
          },
        });
      } finally {
        console.log = origLog;
        console.error = origError;
      }
    } catch (error) {
      self.postMessage({
        type: 'error',
        data: error instanceof Error ? error.message : String(error),
      });
    }
  }
};
