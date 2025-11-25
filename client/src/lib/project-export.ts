import JSZip from "jszip";
import { saveAs } from "file-saver";
import { storage } from "./storage";

export class ProjectExporter {
  async exportAsZip(projectId: string): Promise<void> {
    try {
      console.log("Starting export for project:", projectId);
      
      const { project, files } = await storage.exportProject(projectId);
      console.log("Exported project:", project);
      console.log("Exported files count:", files.length);
      
      if (!project) {
        throw new Error("Project not found");
      }
      
      const zip = new JSZip();
      
      // Add project metadata
      zip.file("project.json", JSON.stringify({
        name: project.name,
        description: project.description,
        exportedAt: Date.now(),
        version: "1.0.0",
      }, null, 2));
      
      // Add all files
      for (const file of files) {
        const relativePath = file.path.startsWith("/") ? file.path.slice(1) : file.path;
        zip.file(relativePath, file.content);
        console.log("Added file:", relativePath);
      }
      
      // Generate and download
      const blob = await zip.generateAsync({ type: "blob" });
      console.log("ZIP generated, size:", blob.size, "bytes");
      
      const filename = `${project.name.replace(/\s+/g, "-")}-${Date.now()}.zip`;
      saveAs(blob, filename);
      console.log("Export completed:", filename);
    } catch (error) {
      console.error("Export failed:", error);
      throw error;
    }
  }

  async importFromZip(file: File): Promise<{ name: string; description?: string }> {
    const zip = await JSZip.loadAsync(file);
    
    // Read project metadata
    const metadataFile = zip.file("project.json");
    if (!metadataFile) {
      throw new Error("Invalid project archive: missing project.json");
    }
    
    const metadata = JSON.parse(await metadataFile.async("text"));
    const files: { path: string; content: string; language: string }[] = [];
    
    // Read all files
    for (const [path, zipFile] of Object.entries(zip.files)) {
      if (path === "project.json" || zipFile.dir) continue;
      
      try {
        const content = await zipFile.async("text");
        const language = this.getLanguageFromPath(path);
        
        files.push({
          path: `/${path}`,
          content,
          language,
        });
        console.log("Extracted file:", path, "Language:", language, "Size:", content.length);
      } catch (error) {
        console.error("Failed to extract file:", path, error);
      }
    }
    
    console.log("Total files extracted:", files.length);
    
    // Import to storage
    const importedProject = await storage.importProject({
      project: {
        name: metadata.name,
        description: metadata.description,
      },
      files,
    });
    
    console.log("Project imported successfully with ID:", importedProject.id);
    
    // Store imported project ID in localStorage for reference
    localStorage.setItem("lastImportedProjectId", importedProject.id);
    
    return {
      name: metadata.name,
      description: metadata.description,
    };
  }

  async importIndividualFiles(fileList: File[], projectId: string): Promise<number> {
    try {
      let importedCount = 0;
      
      for (const file of fileList) {
        try {
          const content = await file.text();
          const language = this.getLanguageFromPath(file.name);
          
          await storage.createFile({
            projectId,
            path: `/${file.name}`,
            content,
            language,
          });
          
          importedCount++;
          console.log("Imported file:", file.name);
        } catch (error) {
          console.error(`Failed to import ${file.name}:`, error);
        }
      }
      
      return importedCount;
    } catch (error) {
      console.error("Import failed:", error);
      throw error;
    }
  }

  private getLanguageFromPath(path: string): string {
    const ext = path.split(".").pop()?.toLowerCase() || "";
    const langMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      rb: "ruby",
      go: "go",
      rs: "rust",
      c: "c",
      cpp: "cpp",
      java: "java",
      php: "php",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      sql: "sql",
      sh: "shell",
      lua: "lua",
    };
    return langMap[ext] || "plaintext";
  }
}

export const projectExporter = new ProjectExporter();
