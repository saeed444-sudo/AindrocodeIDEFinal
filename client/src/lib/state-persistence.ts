import { storage } from "./storage";
import type { Snapshot } from "@shared/schema";
import { nanoid } from "nanoid";

export class StatePersistenceManager {
  private snapshotInterval: NodeJS.Timeout | null = null;
  private currentProjectId: string | null = null;

  async init(projectId: string) {
    this.currentProjectId = projectId;
    
    // Start periodic snapshots every 30 seconds
    this.startPeriodicSnapshots();
    
    // Setup beforeunload handler
    this.setupBeforeUnload();
    
    // Setup history API handling
    this.setupHistoryAPI();
  }

  private startPeriodicSnapshots() {
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
    }

    this.snapshotInterval = setInterval(() => {
      this.createSnapshot().catch(console.error);
    }, 30000); // Every 30 seconds
  }

  private setupBeforeUnload() {
    window.addEventListener("beforeunload", async (e) => {
      const hasUnsaved = this.checkUnsavedChanges();
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = "";
        
        // Try to save snapshot before unload
        await this.createSnapshot();
      }
    });
  }

  private setupHistoryAPI() {
    // Prevent losing state on back navigation
    window.addEventListener("popstate", (e) => {
      if (this.checkUnsavedChanges()) {
        const confirmLeave = window.confirm(
          "You have unsaved changes — are you sure you want to leave?"
        );
        if (!confirmLeave) {
          e.preventDefault();
          window.history.pushState(null, "", window.location.href);
        }
      }
    });

    // Push initial state
    window.history.pushState(null, "", window.location.href);
  }

  async createSnapshot(): Promise<Snapshot> {
    const snapshot: Snapshot = {
      id: nanoid(),
      timestamp: Date.now(),
      openTabs: this.getOpenTabs(),
      activeTabIndex: this.getActiveTabIndex(),
      terminalSessions: this.getTerminalSessions(),
      activeTerminalIndex: this.getActiveTerminalIndex(),
      editorState: this.getEditorState(),
    };

    await storage.createSnapshot(snapshot);
    
    // Cache the snapshot ID for quick recovery
    localStorage.setItem("lastSnapshotId", snapshot.id);
    
    return snapshot;
  }

  async restoreLatestSnapshot(): Promise<Snapshot | undefined> {
    const snapshot = await storage.getLatestSnapshot();
    if (snapshot) {
      this.applySnapshot(snapshot);
    }
    return snapshot;
  }

  async restoreSnapshot(snapshotId: string): Promise<void> {
    const snapshots = await storage.getAllSnapshots();
    const snapshot = snapshots.find((s) => s.id === snapshotId);
    if (snapshot) {
      this.applySnapshot(snapshot);
    }
  }

  private applySnapshot(snapshot: Snapshot) {
    // Store snapshot data for components to read
    sessionStorage.setItem("restoreSnapshot", JSON.stringify(snapshot));
    
    // Trigger a custom event to notify components
    window.dispatchEvent(new CustomEvent("restore-snapshot", { detail: snapshot }));
  }

  private getOpenTabs(): Snapshot["openTabs"] {
    // Read from session storage or component state
    try {
      const stored = sessionStorage.getItem("openTabs");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Failed to parse open tabs:", error);
      sessionStorage.removeItem("openTabs");
      return [];
    }
  }

  private getActiveTabIndex(): number {
    const stored = sessionStorage.getItem("activeTabIndex");
    return stored ? parseInt(stored, 10) : 0;
  }

  private getTerminalSessions(): string[] {
    try {
      const stored = sessionStorage.getItem("terminalSessions");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Failed to parse terminal sessions:", error);
      sessionStorage.removeItem("terminalSessions");
      return [];
    }
  }

  private getActiveTerminalIndex(): number {
    const stored = sessionStorage.getItem("activeTerminalIndex");
    return stored ? parseInt(stored, 10) : 0;
  }

  private getEditorState(): Record<string, any> {
    try {
      const stored = sessionStorage.getItem("editorState");
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn("Failed to parse editor state:", error);
      sessionStorage.removeItem("editorState");
      return {};
    }
  }

  private checkUnsavedChanges(): boolean {
    return localStorage.getItem("hasUnsavedChanges") === "true";
  }

  setUnsavedChanges(hasChanges: boolean) {
    localStorage.setItem("hasUnsavedChanges", hasChanges.toString());
  }

  cleanup() {
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
      this.snapshotInterval = null;
    }
  }
}

export const statePersistence = new StatePersistenceManager();
