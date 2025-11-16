import { createClient } from "@deepgram/sdk";

export default async function handler(req, res) {
  console.log("🔥 summarize API HIT", req.method);

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { transcript } = req.body;

    if (!transcript || transcript.trim() === "") {
      return res.status(400).json({ error: "Transcript is empty" });
    }

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    // CORRECT Deepgram v3.5.0 endpoint
    const { data, error } = await deepgram.ai.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
Summarize the following clinical transcript into a structured medical note:
- Encounter summary
- Relevant vitals
- Medications mentioned
- Assessment & Plan
- Handoff notes
Keep it concise.

Transcript:
${transcript}
          `,
        },
      ],
      max_tokens: 300,
      temperature: 0.2,
    });

    if (error) {
      console.error("Deepgram Chat Error:", error);
      return res.status(500).json({ error: "Deepgram chat error" });
    }

    const summary = data?.choices?.[0]?.message?.content;

    if (!summary) {
      return res.status(500).json({ error: "No summary returned." });
    }

    return res.status(200).json({ summary });

  } catch (err) {
    console.error("Deepgram Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
