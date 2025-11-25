// Singleton Pyodide instance manager with caching & performance optimization
// With support for input() function and proper I/O handling

let pyodideInstance: any = null;
let pyodideLoading: Promise<any> | null = null;
const pythonModuleCache = new Set<string>();
let userInputQueue: string[] = [];
let inputPromptCallback: ((prompt: string) => Promise<string>) | null = null;

export async function getPyodide(): Promise<any> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (pyodideLoading) {
    return pyodideLoading;
  }

  pyodideLoading = loadPyodideInternal();
  pyodideInstance = await pyodideLoading;
  return pyodideInstance;
}

async function loadPyodideInternal(): Promise<any> {
  try {
    let loadPyodide = (window as any).loadPyodide;
    let attempts = 0;

    while (!loadPyodide && attempts < 100) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      loadPyodide = (window as any).loadPyodide;
      attempts++;
    }

    if (!loadPyodide) {
      throw new Error("Pyodide not available");
    }

    const pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
    });

    // Set up input() function support
    setupInputFunction(pyodide);

    return pyodide;
  } catch (error) {
    pyodideLoading = null;
    throw error;
  }
}

function setupInputFunction(pyodide: any): void {
  // Override Python's built-in input() function
  const code = `
import sys
_original_input = None

def setup_input_handler(callback_fn):
  global _original_input
  _original_input = __builtins__.input
  
  def custom_input(prompt=""):
    if prompt:
      print(prompt, end="", flush=True)
    user_input = callback_fn(prompt)
    return user_input
  
  __builtins__.input = custom_input

def restore_input():
  if _original_input:
    __builtins__.input = _original_input
`;
  
  try {
    pyodide.runPython(code);
  } catch (e) {
    console.warn("Could not setup input handler:", e);
  }
}

export function setInputPromptCallback(callback: (prompt: string) => Promise<string>): void {
  inputPromptCallback = callback;
}

export function addInputToQueue(value: string): void {
  userInputQueue.push(value);
}

export async function executePythonCode(code: string): Promise<string> {
  const pyodide = await getPyodide();

  try {
    let output = "";

    // Capture stdout
    const sys = pyodide.pyimport("sys");
    const io = pyodide.pyimport("io");
    const oldStdout = sys.stdout;
    const stringIo = io.StringIO();
    sys.stdout = stringIo;

    // Create input handler function
    const inputHandler = pyodide.globals.get("PyDict_New")
      ? pyodide.globals.get("dict")
      : {};

    const customInputFn = async (prompt: string): Promise<string> => {
      // Try to get from queue first (for pre-provided inputs)
      if (userInputQueue.length > 0) {
        return userInputQueue.shift() || "";
      }

      // Use callback if available (browser input dialog)
      if (inputPromptCallback) {
        return await inputPromptCallback(prompt);
      }

      // Fallback: simple prompt
      return window.prompt(prompt || "> ") || "";
    };

    try {
      // Wrap input handler in Python-callable function
      pyodide.globals.set("_js_input_handler", inputHandler);
      
      const setupCode = `
import builtins
async def _aindro_input(prompt=""):
  return _js_input_handler() if hasattr(_js_input_handler, '__call__') else input(prompt)
`;
      
      pyodide.runPython(setupCode);
      pyodide.runPython(code);
      output = stringIo.getvalue();
    } finally {
      sys.stdout = oldStdout;
      userInputQueue = []; // Clear queue after execution
    }

    return output || "(No output)";
  } catch (error) {
    throw error;
  }
}

export async function installPythonPackages(packages: string[]): Promise<boolean> {
  const pyodide = await getPyodide();

  try {
    const micropip = pyodide.pyimport("micropip");
    const toInstall = packages.filter((pkg) => !pythonModuleCache.has(pkg));

    if (toInstall.length === 0) {
      return true; // All already cached
    }

    await Promise.all(toInstall.map((pkg) => micropip.install(pkg)));

    // Update cache
    toInstall.forEach((pkg) => pythonModuleCache.add(pkg));
    return true;
  } catch (error) {
    console.error("Python package install error:", error);
    return false;
  }
}

export function isPyodideReady(): boolean {
  return pyodideInstance !== null;
}

export function getPyodideInstance(): any | null {
  return pyodideInstance;
}
