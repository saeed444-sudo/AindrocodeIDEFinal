export class AIClient {
  public apiKey: string | null = null;

  init(apiKey: string) {
    this.apiKey = apiKey;
  }

  isInitialized(): boolean {
    return this.apiKey !== null;
  }

  async chat(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string> {
    if (!this.apiKey) {
      throw new Error("AI client not initialized. Please add your OpenAI API key in Settings.");
    }

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: this.apiKey,
          messages,
          model: "gpt-4o-mini",
          maxTokens: 2048,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.content || "";
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`AI request failed: ${error.message}`);
      }
      throw error;
    }
  }

  async generatePlan(userRequest: string, context: {
    files: Array<{ path: string; language: string }>;
    projectName: string;
  }): Promise<{
    title: string;
    steps: string[];
    fileChanges: Array<{ path: string; action: "create" | "modify" | "delete" }>;
  }> {
    if (!this.apiKey) {
      throw new Error("AI client not initialized.");
    }

    try {
      const response = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: this.apiKey,
          userRequest,
          context,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        title: result.title || "Untitled Plan",
        steps: result.steps || [],
        fileChanges: result.fileChanges || [],
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate plan: ${error.message}`);
      }
      throw error;
    }
  }

  async generateCode(prompt: string, language: string, context?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("AI client not initialized.");
    }

    try {
      const response = await fetch("/api/ai/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: this.apiKey,
          prompt,
          language,
          context,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.content || "";
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Code generation failed: ${error.message}`);
      }
      throw error;
    }
  }

  async debugCode(code: string, error: string, language: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("AI client not initialized.");
    }

    try {
      const response = await fetch("/api/ai/debug-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: this.apiKey,
          code,
          error,
          language,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.content || "";
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Debugging failed: ${error.message}`);
      }
      throw error;
    }
  }

  async explainCode(code: string, language: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("AI client not initialized.");
    }

    try {
      const response = await fetch("/api/ai/explain-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: this.apiKey,
          code,
          language,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.content || "";
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Code explanation failed: ${error.message}`);
      }
      throw error;
    }
  }
}

export const aiClient = new AIClient();
