import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent as instructed
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Chatbot Proxy Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, currentResume } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_ACTUAL_GEMINI_API_KEY_HERE" || apiKey.includes("YOUR_ACTUAL")) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured in the server environment. Please replace the placeholder value in your .env file with a valid Google AI Studio API key." 
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid 'messages' array provided." });
    }

    // Format previous conversation history for the model
    // Using simple format or System Instruction configuration
    const historyParts = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.text }]
    }));

    // Inject current resume context in prompt or system instruction
    const systemInstruction = `You are a friendly, human-like professional career coach and resume strategist.
You are helping the user optimize, rewrite, and refine their resume to land outstanding jobs.
The user is viewing their live interactive resume editor alongside your help chat.

Here is the user's CURRENT RESUME DATA in real-time format:
${JSON.stringify(currentResume, null, 2)}

CRITICAL TONE & CONVERSATIONAL RULES (STRICT COMPLIANCE REQUIRED):
1. **Plain Layman English ONLY**: Always speak in elegant, standard, highly professional everyday English that any layman/child can fully understand instantly. Do NOT use programming jargon, developer acronyms, system variables, database terms, or code syntax in your speech.
2. **NEVER Display JS/JSON Code in your Conversation**: Do NOT show raw JSON, Javascript snippets, curly braces {}, bracket structures, array indices, or variable keys in your normal message text to the user. Explain suggested enhancements descriptively like a wise human career writer would.
3. **Friendly, encouraging, and clear companion**: Keep your responses short, conversational, and structured with clean formatting or simple bullet points. Avoid overwhelming paragraphs.
4. **Interactive Merge System**: If the user requests to update, improve, restructure, or rewrite a section of their resume:
   - Provide your strategic explanation in plain, layman-friendly text.
   - Then, append a single valid JSON block containing ONLY the fields to update inside a markdown block tagged STRICTLY with \`\`\`json_apply and ending with \`\`\`.
   - The web app will automatically parse this JSON block and offer a friendly "✨ Apply Suggestions in 1-Click" button.
   - Example style for summary update:
     \`\`\`json_apply
     {
       "professionalSummary": "Highly analytical software professional with over 3 years of experience building resilient business ecosystems..."
     }
     \`\`\`
   - Never use invalid JSON. Never write comments or inline annotations inside the \`\`\`json_apply block.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: "Introduce yourself, briefly review my resume summary, and tell me how you can assist me today." }]
        },
        ...historyParts
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ 
      error: error?.message || "An error occurred while communicating with the AI Assistant." 
    });
  }
});

// Setup Vite & Static Handlers
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
};

startServer();
