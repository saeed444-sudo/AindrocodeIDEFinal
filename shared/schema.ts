import { z } from "zod";

// Project Schema
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastOpenedAt: z.number().optional(),
});

export const insertProjectSchema = projectSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type Project = z.infer<typeof projectSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;

// File Schema
export const fileSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  path: z.string(),
  content: z.string(),
  language: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const insertFileSchema = fileSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type File = z.infer<typeof fileSchema>;
export type InsertFile = z.infer<typeof insertFileSchema>;

// Terminal Session Schema
export const terminalSessionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  output: z.array(z.object({
    type: z.enum(["stdout", "stderr", "stdin"]),
    content: z.string(),
    timestamp: z.number(),
  })),
  lastCommand: z.string().optional(),
  createdAt: z.number(),
});

export const insertTerminalSessionSchema = terminalSessionSchema.omit({ id: true, createdAt: true });

export type TerminalSession = z.infer<typeof terminalSessionSchema>;
export type InsertTerminalSession = z.infer<typeof insertTerminalSessionSchema>;

// AI Chat Schema
export const aiChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.number(),
  fileChanges: z.array(z.object({
    path: z.string(),
    oldContent: z.string().optional(),
    newContent: z.string(),
    action: z.enum(["create", "modify", "delete"]),
  })).optional(),
});

export const aiChatSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  messages: z.array(aiChatMessageSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const insertAiChatSchema = aiChatSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;
export type AiChat = z.infer<typeof aiChatSchema>;
export type InsertAiChat = z.infer<typeof insertAiChatSchema>;

// Snapshot Schema (for state persistence)
export const snapshotSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  openTabs: z.array(z.object({
    fileId: z.string(),
    filePath: z.string(),
    scrollPosition: z.number().optional(),
  })),
  activeTabIndex: z.number().optional(),
  terminalSessions: z.array(z.string()),
  activeTerminalIndex: z.number().optional(),
  editorState: z.record(z.string(), z.any()).optional(),
});

export type Snapshot = z.infer<typeof snapshotSchema>;

// Runner Configuration Schema
export const runnerConfigSchema = z.object({
  extension: z.string(),
  name: z.string(),
  command: z.string(),
  supportsPackages: z.boolean(),
  supportsNetwork: z.boolean(),
  supportsFS: z.boolean(),
  runtime: z.enum(["native", "wasm", "interpreter", "limited"]),
});

export type RunnerConfig = z.infer<typeof runnerConfigSchema>;

// Settings Schema
export const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  editorTheme: z.enum(["vs-dark", "vs-light"]),
  fontSize: z.number(),
  tabSize: z.number(),
  keyBindings: z.enum(["vscode", "vim"]),
  openaiApiKey: z.string().optional(),
  aiEnabled: z.boolean(),
});

export type Settings = z.infer<typeof settingsSchema>;
