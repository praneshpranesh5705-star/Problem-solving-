export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { image, question } = req.body || {};
  if (!image && !question) return res.status(400).json({ error: "Add a question or image." });
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "AI is not connected. Add OPENAI_API_KEY in Vercel Environment Variables." });
  }

  const content = [
    {
      type: "input_text",
      text: `You are NOVA AI, a careful visual tutor and problem solver. Analyze the user's request accurately.
If an image is provided, first identify exactly what it contains and transcribe the important visible text, equations, labels, units, diagrams, tables or objects. Then explain what the image means.
For maths and science problems, solve step by step, show formulas, substitutions, calculations and final answer with units where appropriate. Check the result before answering.
If the image is unclear, say exactly which part is unclear instead of inventing details.
Use simple student-friendly language and headings: "What I see", "What it means", "Solution", "Final answer". If it is not a problem, explain the image clearly.
User question: ${question || "Explain and solve what is shown in the image."}`
    }
  ];
  if (image) content.push({ type: "input_image", image_url: image, detail: "high" });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5.6-luna", input: [{ role: "user", content }] })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || "AI request failed." });
    return res.status(200).json({ answer: data.output_text || "I could not produce an answer." });
  } catch (error) {
    return res.status(500).json({ error: "Could not reach the AI service. Please try again." });
  }
}