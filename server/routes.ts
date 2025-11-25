import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Proxy Endpoint - handles OpenAI requests from browser
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { apiKey, messages, model = "gpt-4o-mini", maxTokens = 8192 } = req.body;

      if (!apiKey || !messages) {
        return res.status(400).json({ error: "apiKey and messages are required" });
      }

      // Debug logging
      const keyPreview = apiKey.length > 8 ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}` : "***";
      console.log(`[AI Chat] Using API key: ${keyPreview}, Model: ${model}, Messages: ${messages.length}`);

      const client = new OpenAI({ 
        apiKey,
        defaultHeaders: {
          "User-Agent": "AindroCode/1.0"
        }
      });

      const response = await client.chat.completions.create({
        model,
        messages,
        max_completion_tokens: maxTokens,
      });

      const content = response.choices[0].message.content || "";
      console.log(`[AI Chat] Success! Response length: ${content.length}`);
      res.json({ content });
    } catch (error: any) {
      console.error("[AI Proxy] Error Status:", error.status);
      console.error("[AI Proxy] Error Message:", error.message);
      console.error("[AI Proxy] Error Type:", error.type);
      
      // Pass through OpenAI errors directly
      if (error.status) {
        return res.status(error.status).json({ 
          error: error.message,
          type: error.type 
        });
      }

      res.status(500).json({ error: error.message || "AI request failed" });
    }
  });

  // AI Plan Generation Endpoint
  app.post("/api/ai/generate-plan", async (req, res) => {
    try {
      const { apiKey, userRequest, context } = req.body;

      if (!apiKey || !userRequest || !context) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const systemPrompt = `You are AindroCode AI Agent — a senior full-stack engineer and technical architect.
You write clean, safe, production-quality code in all major programming languages.
You can read, modify, create, and delete any files in the user's project.
You always think step-by-step and never apply changes without presenting a clear plan.
You fix bugs, refactor code, scaffold new features, and help the user build complete apps.
Use orchestration: Plan → Ask → Execute → Verify.
Do not hallucinate capabilities outside browser limitations.
Always respect project structure and user instructions.

Current project: ${context.projectName}
Existing files: ${context.files?.map((f: any) => `${f.path} (${f.language})`).join(", ") || "none"}

User request: ${userRequest}

Create a detailed plan with:
1. A clear title for what you'll implement
2. Step-by-step execution plan
3. List of files to create/modify/delete

Respond in JSON format:
{
  "title": "string",
  "steps": ["step1", "step2", ...],
  "fileChanges": [{"path": "/path/to/file", "action": "create|modify|delete"}]
}`;

      const client = new OpenAI({ apiKey });

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userRequest },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2048,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("[AI Generate Plan] Error:", error.message);
      if (error.status) {
        return res.status(error.status).json({ 
          error: error.message,
          type: error.type 
        });
      }
      res.status(500).json({ error: error.message || "Plan generation failed" });
    }
  });

  // AI Code Generation Endpoint
  app.post("/api/ai/generate-code", async (req, res) => {
    try {
      const { apiKey, prompt, language, context } = req.body;

      if (!apiKey || !prompt || !language) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const systemPrompt = `You are a code generation expert. Generate clean, well-commented ${language} code based on the user's request.${context ? `\n\nContext:\n${context}` : ""}`;

      const client = new OpenAI({ apiKey });

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 2048,
      });

      res.json({ content: response.choices[0].message.content || "" });
    } catch (error: any) {
      console.error("[AI Generate Code] Error:", error.message);
      if (error.status) {
        return res.status(error.status).json({ 
          error: error.message,
          type: error.type 
        });
      }
      res.status(500).json({ error: error.message || "Code generation failed" });
    }
  });

  // AI Debug Code Endpoint
  app.post("/api/ai/debug-code", async (req, res) => {
    try {
      const { apiKey, code, error: errorMsg, language } = req.body;

      if (!apiKey || !code || !errorMsg || !language) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const systemPrompt = `You are a debugging expert. Analyze the ${language} code and error, then provide a clear explanation and fix.`;

      const client = new OpenAI({ apiKey });

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Code:\n${code}\n\nError:\n${errorMsg}\n\nPlease explain the issue and provide a fix.` },
        ],
        max_completion_tokens: 2048,
      });

      res.json({ content: response.choices[0].message.content || "" });
    } catch (error: any) {
      console.error("[AI Debug Code] Error:", error.message);
      if (error.status) {
        return res.status(error.status).json({ 
          error: error.message,
          type: error.type 
        });
      }
      res.status(500).json({ error: error.message || "Debugging failed" });
    }
  });

  // AI Explain Code Endpoint
  app.post("/api/ai/explain-code", async (req, res) => {
    try {
      const { apiKey, code, language } = req.body;

      if (!apiKey || !code || !language) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const client = new OpenAI({ apiKey });

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a code explanation expert. Explain code clearly and concisely." },
          { role: "user", content: `Explain this ${language} code:\n\n${code}` },
        ],
        max_completion_tokens: 2048,
      });

      res.json({ content: response.choices[0].message.content || "" });
    } catch (error: any) {
      console.error("[AI Explain Code] Error:", error.message);
      if (error.status) {
        return res.status(error.status).json({ 
          error: error.message,
          type: error.type 
        });
      }
      res.status(500).json({ error: error.message || "Explanation failed" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
