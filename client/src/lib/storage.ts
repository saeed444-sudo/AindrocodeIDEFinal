import { openDB, type IDBPDatabase } from "idb";
import type {
  Project,
  InsertProject,
  File,
  InsertFile,
  TerminalSession,
  InsertTerminalSession,
  AiChat,
  InsertAiChat,
  Snapshot,
  Settings,
} from "@shared/schema";
import { nanoid } from "nanoid";

const DB_NAME = "aindrocode-db";
const DB_VERSION = 1;

export class StorageManager {
  private db: IDBPDatabase | null = null;

  async init() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Projects store
        if (!db.objectStoreNames.contains("projects")) {
          db.createObjectStore("projects", { keyPath: "id" });
        }

        // Files store
        if (!db.objectStoreNames.contains("files")) {
          const filesStore = db.createObjectStore("files", { keyPath: "id" });
          filesStore.createIndex("projectId", "projectId");
        }

        // Terminal sessions store
        if (!db.objectStoreNames.contains("terminalSessions")) {
          const terminalStore = db.createObjectStore("terminalSessions", { keyPath: "id" });
          terminalStore.createIndex("projectId", "projectId");
        }

        // AI chats store
        if (!db.objectStoreNames.contains("aiChats")) {
          const aiChatsStore = db.createObjectStore("aiChats", { keyPath: "id" });
          aiChatsStore.createIndex("projectId", "projectId");
        }

        // Snapshots store
        if (!db.objectStoreNames.contains("snapshots")) {
          db.createObjectStore("snapshots", { keyPath: "id" });
        }

        // Settings store
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
      },
    });
  }

  // Project operations
  async createProject(data: InsertProject): Promise<Project> {
    if (!this.db) await this.init();
    const project: Project = {
      ...data,
      id: nanoid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await this.db!.put("projects", project);
    return project;
  }

  async getProject(id: string): Promise<Project | undefined> {
    if (!this.db) await this.init();
    return this.db!.get("projects", id);
  }

  async getAllProjects(): Promise<Project[]> {
    if (!this.db) await this.init();
    const projects = await this.db!.getAll("projects");
    return projects.sort((a, b) => (b.lastOpenedAt || b.updatedAt) - (a.lastOpenedAt || a.updatedAt));
  }

  async updateProject(id: string, data: Partial<Project>): Promise<void> {
    if (!this.db) await this.init();
    const project = await this.getProject(id);
    if (project) {
      const updated = { ...project, ...data, updatedAt: Date.now() };
      await this.db!.put("projects", updated);
    }
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete("projects", id);
    // Delete associated files
    const files = await this.getFilesByProject(id);
    for (const file of files) {
      await this.deleteFile(file.id);
    }
  }

  // File operations
  async createFile(data: InsertFile): Promise<File> {
    if (!this.db) await this.init();
    const file: File = {
      ...data,
      id: nanoid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await this.db!.put("files", file);
    return file;
  }

  async getFile(id: string): Promise<File | undefined> {
    if (!this.db) await this.init();
    return this.db!.get("files", id);
  }

  async getFilesByProject(projectId: string): Promise<File[]> {
    if (!this.db) await this.init();
    return this.db!.getAllFromIndex("files", "projectId", projectId);
  }

  async updateFile(id: string, data: Partial<File>): Promise<void> {
    if (!this.db) await this.init();
    const file = await this.getFile(id);
    if (file) {
      const updated = { ...file, ...data, updatedAt: Date.now() };
      await this.db!.put("files", updated);
    }
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete("files", id);
  }

  // Terminal session operations
  async createTerminalSession(data: InsertTerminalSession): Promise<TerminalSession> {
    if (!this.db) await this.init();
    const session: TerminalSession = {
      ...data,
      id: nanoid(),
      createdAt: Date.now(),
    };
    await this.db!.put("terminalSessions", session);
    return session;
  }

  async getTerminalSession(id: string): Promise<TerminalSession | undefined> {
    if (!this.db) await this.init();
    return this.db!.get("terminalSessions", id);
  }

  async getTerminalSessionsByProject(projectId: string): Promise<TerminalSession[]> {
    if (!this.db) await this.init();
    return this.db!.getAllFromIndex("terminalSessions", "projectId", projectId);
  }

  async updateTerminalSession(id: string, data: Partial<TerminalSession>): Promise<void> {
    if (!this.db) await this.init();
    const session = await this.getTerminalSession(id);
    if (session) {
      await this.db!.put("terminalSessions", { ...session, ...data });
    }
  }

  // AI chat operations
  async createAiChat(data: InsertAiChat): Promise<AiChat> {
    if (!this.db) await this.init();
    const chat: AiChat = {
      ...data,
      id: nanoid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await this.db!.put("aiChats", chat);
    return chat;
  }

  async getAiChat(id: string): Promise<AiChat | undefined> {
    if (!this.db) await this.init();
    return this.db!.get("aiChats", id);
  }

  async getAiChatsByProject(projectId: string): Promise<AiChat[]> {
    if (!this.db) await this.init();
    return this.db!.getAllFromIndex("aiChats", "projectId", projectId);
  }

  async updateAiChat(id: string, data: Partial<AiChat>): Promise<void> {
    if (!this.db) await this.init();
    const chat = await this.getAiChat(id);
    if (chat) {
      const updated = { ...chat, ...data, updatedAt: Date.now() };
      await this.db!.put("aiChats", updated);
    }
  }

  // Snapshot operations
  async createSnapshot(data: Snapshot): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put("snapshots", data);
    
    // Keep only last 10 snapshots
    const snapshots = await this.getAllSnapshots();
    if (snapshots.length > 10) {
      const toDelete = snapshots.slice(10);
      for (const snapshot of toDelete) {
        await this.db!.delete("snapshots", snapshot.id);
      }
    }
  }

  async getLatestSnapshot(): Promise<Snapshot | undefined> {
    if (!this.db) await this.init();
    const snapshots = await this.getAllSnapshots();
    return snapshots[0];
  }

  async getAllSnapshots(): Promise<Snapshot[]> {
    if (!this.db) await this.init();
    const snapshots = await this.db!.getAll("snapshots");
    return snapshots.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Settings operations
  async getSettings(): Promise<Settings> {
    if (!this.db) await this.init();
    const stored = await this.db!.get("settings", "app-settings");
    return stored?.value || {
      theme: "system" as const,
      editorTheme: "vs-dark" as const,
      fontSize: 14,
      tabSize: 2,
      keyBindings: "vscode" as const,
      aiEnabled: false,
    };
  }

  async updateSettings(settings: Settings): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put("settings", { key: "app-settings", value: settings });
  }

  // Export/Import
  async exportProject(projectId: string): Promise<{ project: Project; files: File[] }> {
    const project = await this.getProject(projectId);
    if (!project) throw new Error("Project not found");
    
    const files = await this.getFilesByProject(projectId);
    return { project, files };
  }

  async importProject(data: { project: Omit<Project, "id" | "createdAt" | "updatedAt">; files: Omit<File, "id" | "projectId" | "createdAt" | "updatedAt">[] }): Promise<Project> {
    const project = await this.createProject({
      name: data.project.name,
      description: data.project.description,
    });

    for (const fileData of data.files) {
      await this.createFile({
        projectId: project.id,
        path: fileData.path,
        content: fileData.content,
        language: fileData.language,
      });
    }

    return project;
  }
}

export const storage = new StorageManager();
