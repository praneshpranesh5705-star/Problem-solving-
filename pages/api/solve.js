export const config = { api: { bodyParser: { sizeLimit: "12mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { image, question } = req.body || {};
  if (!image && !question) return res.status(400).json({ error: "Please upload an image or enter a question." });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "NOVA AI is not connected yet. Add OPENAI_API_KEY to the Vercel project Environment Variables, then redeploy."
    });
  }

  const instruction = `You are NOVA AI, a careful visual tutor created for this website.
Your priority is ACCURACY. Never guess information that is unreadable or absent from the image.

For every image:
1. Inspect the complete image before answering.
2. Transcribe the relevant question, numbers, symbols, labels, units and diagram relationships exactly.
3. State what you detected. If any important character, number, sign, graph or label is ambiguous, say so and ask for a clearer image instead of guessing.
4. Identify the subject and type of problem.
5. Solve maths/science problems step by step. Show the formula, substitution, arithmetic and units.
6. Independently check the final calculation and units before giving the final answer.
7. For diagrams, explain the visible components and relationships rather than inventing hidden information.
8. If multiple interpretations are possible, list them and explain what additional information is needed.
9. Give one clearly marked final answer only when the supplied information is sufficient.
10. Use simple student-friendly language.

Response format:
WHAT I SEE
WHAT IT MEANS
STEP-BY-STEP SOLUTION
CHECK
FINAL ANSWER

User request: ${question || "Read the uploaded image and solve/explain it."}`;

  const content = [{ type: "input_text", text: instruction }];
  if (image) content.push({ type: "input_image", image_url: image, detail: "high" });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-6-luna",
        input: [{ role: "user", content }],
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "NOVA could not reach the AI model."
      });
    }

    return res.status(200).json({
      answer: data.output_text || "NOVA could not produce an answer."
    });
  } catch {
    return res.status(500).json({
      error: "NOVA could not connect to the AI service. Please try again."
    });
  }
}