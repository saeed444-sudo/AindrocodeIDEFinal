// Debugger system (stub - full implementation with breakpoints in Android APK)

export interface Breakpoint {
  id: string;
  line: number;
  condition?: string;
  enabled: boolean;
}

export interface DebugState {
  isPaused: boolean;
  currentLine: number;
  variables: Record<string, unknown>;
  callStack: string[];
}

export class Debugger {
  private breakpoints: Map<string, Breakpoint[]> = new Map();
  private debugState: DebugState = {
    isPaused: false,
    currentLine: 0,
    variables: {},
    callStack: [],
  };

  addBreakpoint(fileId: string, line: number, condition?: string): Breakpoint {
    const breakpoint: Breakpoint = {
      id: `bp-${Math.random()}`,
      line,
      condition,
      enabled: true,
    };

    if (!this.breakpoints.has(fileId)) {
      this.breakpoints.set(fileId, []);
    }
    this.breakpoints.get(fileId)!.push(breakpoint);

    console.log(`Breakpoint added at line ${line}`);
    return breakpoint;
  }

  removeBreakpoint(fileId: string, breakpointId: string): void {
    const bps = this.breakpoints.get(fileId);
    if (bps) {
      const index = bps.findIndex(bp => bp.id === breakpointId);
      if (index >= 0) {
        bps.splice(index, 1);
      }
    }
  }

  getBreakpoints(fileId: string): Breakpoint[] {
    return this.breakpoints.get(fileId) || [];
  }

  getDebugState(): DebugState {
    return this.debugState;
  }

  pause(line: number, variables: Record<string, unknown>): void {
    this.debugState.isPaused = true;
    this.debugState.currentLine = line;
    this.debugState.variables = variables;
    console.log(`Paused at line ${line}`, variables);
  }

  resume(): void {
    this.debugState.isPaused = false;
    console.log('Resumed execution');
  }

  stepOver(): void {
    console.log('Step over - next line');
  }

  stepInto(): void {
    console.log('Step into - enter function');
  }

  stepOut(): void {
    console.log('Step out - exit function');
  }
}

export const debugger = new Debugger();
