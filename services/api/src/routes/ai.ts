import { Router } from "express";
import type { Request, Response } from "express";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.2,
    });

    const message =
      completion.choices[0]?.message?.content ??
      "Lo siento, no pude generar respuesta.";
    res.json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI error" });
  }
});

export default router;
