import { Deepgram } from "@deepgram/sdk";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { transcript } = req.body;

    if (!transcript || transcript.trim() === "") {
      return res.status(400).json({ error: "Transcript is empty" });
    }

    // Initialize Deepgram client
    const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

    // Deepgram Summarization
    const response = await deepgram.summarize.transcript({
      model: "nova-2",
      text: transcript,
      summary: {
        type: "bullets",
        length: "medium",
      },
    });

    const summary = response?.output_text;

    if (!summary) {
      return res.status(500).json({ error: "No summary returned." });
    }

    return res.status(200).json({ summary });

  } catch (err) {
    console.error("Deepgram Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
