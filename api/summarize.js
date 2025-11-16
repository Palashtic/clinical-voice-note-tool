import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { transcript } = req.body;

    if (!transcript || transcript.trim() === "") {
      return res.status(400).json({ error: "Transcript is empty" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a clinical documentation assistant.

Convert the following clinician's spoken transcript into a structured, concise medical note.

Include:
1. Summary of encounter
2. Relevant vitals (if stated)
3. Medications administered
4. Assessment & Plan
5. Handoff notes

Avoid PHI. Keep it short and clean.

Transcript:
${transcript}
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    console.log("OpenAI completion:", completion);

    const summary =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "Error: No summary returned from OpenAI";

    res.status(200).json({ summary });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
