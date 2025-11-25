// Integrated runner that handles code execution and terminal output
import { runnerManager, type ExecutionResult } from "./runners";

export interface TerminalOutput {
  type: "stdout" | "stderr" | "info";
  content: string;
  timestamp: number;
}

export class IntegratedRunner {
  private onOutput: ((output: TerminalOutput) => void) | null = null;

  setOutputHandler(handler: (output: TerminalOutput) => void) {
    this.onOutput = handler;
  }

  private log(content: string, type: "stdout" | "stderr" | "info" = "stdout") {
    if (this.onOutput) {
      this.onOutput({
        type,
        content,
        timestamp: Date.now(),
      });
    }
  }

  async executeFile(filePath: string, code: string): Promise<ExecutionResult> {
    this.log(`Running ${filePath}...\n`, "info");
    
    const result = await runnerManager.execute(filePath, code);
    
    if (result.output) {
      this.log(result.output, "stdout");
    }
    
    if (result.error) {
      this.log(result.error, "stderr");
    }
    
    this.log(`\nCompleted in ${result.duration.toFixed(2)}ms (exit code ${result.exitCode})\n`, "info");
    
    return result;
  }
}

export const integratedRunner = new IntegratedRunner();
