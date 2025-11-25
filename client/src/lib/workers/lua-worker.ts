// Lua Worker - lua-wasm execution
import { InMemoryFS, mountProjectFiles } from '../core/fs-sync';

let lua: any = null;
let fs: InMemoryFS | null = null;

async function loadLua() {
  if (lua) return;
  try {
    const script = await fetch('https://cdn.jsdelivr.net/npm/lua-wasm/dist/lua.js');
    const code = await script.text();
    eval(code);
    lua = (globalThis as any).Lua;
  } catch (error) {
    throw new Error(`Failed to load Lua: ${error}`);
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { type, entry, files } = event.data;
  if (type === 'run') {
    try {
      await loadLua();
      fs = new InMemoryFS();
      await mountProjectFiles(fs, files);

      const code = files[entry];
      if (!code) {
        self.postMessage({ type: 'error', data: `Entry file not found: ${entry}` });
        return;
      }

      let output = '';
      try {
        const state = new lua.LuaState();
        state.loadStdLib();
        
        // Capture print output
        const originalPrint = state.global.get('print');
        state.global.set('print', (...args: any[]) => {
          const line = args.map((a: any) => a?.toString?.() || String(a)).join('\t');
          output += line + '\n';
          self.postMessage({ type: 'stdout', data: line });
        });

        state.doString(code);
        
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
