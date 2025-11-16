import { createClient } from "@deepgram/sdk";

export default async function handler(req, res) {
  console.log("🔥 summarize API HIT", req.method);

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { transcript } = req.body;
    if (!transcript?.trim()) {
      return res.status(400).json({ error: "Transcript is empty" });
    }

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    // WORKS ONLY IN SDK 3.6+
    const { data, error } = await deepgram.ai.chat.completions.create({
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
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Deepgram chat error" });
    }

    const summary = data?.choices?.[0]?.message?.content;
    if (!summary) return res.status(500).json({ error: "No summary returned." });

    return res.status(200).json({ summary });

  } catch (err) {
    console.error("Deepgram Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
