import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@deepgram/sdk";

// Needed for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // serve index.html etc

// Load your Deepgram API key manually
const DEEPGRAM_API_KEY = "YOUR_DEEPGRAM_API_KEY"; // <--- put new key here

// API Route
app.post("/api/summarize", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript?.trim()) return res.status(400).json({ error: "Transcript is empty" });

    const deepgram = createClient(DEEPGRAM_API_KEY);

    const response = await deepgram.ai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Summarize this clinical transcript concisely:\n${transcript}`,
        },
      ],
    });

    const summary = response.data?.choices?.[0]?.message?.content;

    if (!summary) return res.status(500).json({ error: "No summary returned." });

    res.json({ summary });
  } catch (err) {
    console.error("Deepgram Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
