import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to get initialized GenAI instance safely
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Co-Pilot Chat Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { prompt, history = [], context = "" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();
    const systemInstruction = `You are Masterpiece Copilot, an elite AI assistant inside Masterpiece Studio.
You help designers, engineers, and creators build, optimize, and synthesize multi-faceted projects.
Active Project Context:
${context}

Be structured, concise, insightful, and practical. Use clean markdown formatting when helpful.`;

    const chatHistory = history.map((h: { role: string; content: string }) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        ...chatHistory,
        { role: "user", parts: [{ text: prompt }] },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI response" });
  }
});

// 2. AI Task Roadmap Generator
app.post("/api/gemini/task-gen", async (req, res) => {
  try {
    const { projectTitle, goal, currentPhase } = req.body;
    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Generate 4-6 actionable high-quality task items for project: "${projectTitle}".
Goal/Vision: ${goal || "Build a high-performance web application"}.
Current Phase: ${currentPhase || "Planning & Execution"}.

Return a JSON array of task objects with fields:
- title (short concise task summary)
- description (1-2 sentences)
- priority ("high", "medium", or "low")
- tags (array of 1-2 tag strings e.g. ["Frontend", "AI"])
- columnId ("todo", "in-progress", or "review")`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              columnId: { type: Type.STRING },
            },
            required: ["title", "description", "priority", "tags", "columnId"],
          },
        },
      },
    });

    const tasks = JSON.parse(response.text || "[]");
    res.json({ tasks });
  } catch (error: any) {
    console.error("Task Generator Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate tasks" });
  }
});

// 3. Smart Document Assistant
app.post("/api/gemini/doc-assist", async (req, res) => {
  try {
    const { docText, action } = req.body;
    const ai = getGenAI();

    let instruction = "Improve and refine the document text into professional markdown.";
    if (action === "expand") instruction = "Expand on this draft section with detailed, structured insights, code/architecture notes, and specs.";
    if (action === "summarize") instruction = "Provide a high-level Executive Summary with bullet points and key takeaways.";
    if (action === "outline") instruction = "Create a comprehensive project PRD outline with headings, user stories, and acceptance criteria.";
    if (action === "polish") instruction = "Polish grammar, tone, and professional clarity without losing core detail.";

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `${instruction}\n\nTarget Text / Context:\n${docText}`,
      config: {
        temperature: 0.6,
      },
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Doc Assist Error:", error);
    res.status(500).json({ error: error.message || "Failed to process document" });
  }
});

// 4. Code & Snippet Assistant
app.post("/api/gemini/code-gen", async (req, res) => {
  try {
    const { prompt, existingCode } = req.body;
    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are an expert web component developer.
Request: ${prompt}

Current Code:
\`\`\`html
${existingCode || ""}
\`\`\`

Return a self-contained HTML file (with inline CSS inside <style> and JS inside <script>) that renders a visually stunning, responsive component or feature. Return ONLY raw HTML code without markdown backticks.`,
    });

    let code = response.text || "";
    // Clean up code markdown blocks if present
    code = code.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();

    res.json({ code });
  } catch (error: any) {
    console.error("Code Assistant Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate code" });
  }
});

// 5. Image & Asset Generator
app.post("/api/gemini/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    let imageUrl = null;
    let caption = "";

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const mime = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mime};base64,${base64EncodeString}`;
        } else if (part.text) {
          caption += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: "No image generated from Gemini model" });
    }

    res.json({ imageUrl, caption });
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate asset" });
  }
});

// Boot Express Server & Mount Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Masterpiece Studio Server running on http://localhost:${PORT}`);
  });
}

startServer();
