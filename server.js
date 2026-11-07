import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fal } from "@fal-ai/client";
import OpenAI from "openai";

const app = express();
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(root, "public")));

if (process.env.FAL_KEY) fal.config({ credentials: process.env.FAL_KEY });
const imageModel = process.env.FAL_IMAGE_MODEL || "fal-ai/flux/dev";
const videoModel = process.env.FAL_VIDEO_MODEL || "fal-ai/kling-video/v2.1/standard";
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.get("/api/health", (_req, res) => res.json({
  ok: true,
  imageConfigured: Boolean(process.env.FAL_KEY),
  videoConfigured: Boolean(process.env.FAL_KEY),
  assistantConfigured: Boolean(openai)
}));

app.post("/api/image", async (req, res) => {
  const prompt = String(req.body?.prompt || "").trim();
  if (!process.env.FAL_KEY) return res.status(503).json({ error: "Ajoutez FAL_KEY dans les variables Render." });
  if (prompt.length < 3 || prompt.length > 2000) return res.status(400).json({ error: "Le prompt doit contenir de 3 à 2000 caractères." });
  try {
    const result = await fal.subscribe(imageModel, { input: { prompt, image_size: "landscape_4_3", num_images: 1 } });
    return res.json({ ok: true, result });
  } catch (error) {
    console.error("Image generation:", error);
    return res.status(502).json({ error: error?.message || "Échec de génération d'image." });
  }
});

app.post("/api/video", async (req, res) => {
  const prompt = String(req.body?.prompt || "").trim();
  if (!process.env.FAL_KEY) return res.status(503).json({ error: "Ajoutez FAL_KEY dans les variables Render." });
  if (prompt.length < 3 || prompt.length > 2000) return res.status(400).json({ error: "Le prompt doit contenir de 3 à 2000 caractères." });
  try {
    const result = await fal.subscribe(videoModel, { input: { prompt, duration: "5" } });
    return res.json({ ok: true, result });
  } catch (error) {
    console.error("Video generation:", error);
    return res.status(502).json({ error: error?.message || "Échec de génération vidéo." });
  }
});

app.post("/api/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!openai) return res.status(503).json({ error: "Ajoutez OPENAI_API_KEY dans les variables Render." });
  if (!message || message.length > 8000) return res.status(400).json({ error: "Message vide ou trop long (maximum 8000 caractères)." });
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es Kamikaze IA, un assistant utile, clair et créatif. Réponds en français par défaut." },
        { role: "user", content: message }
      ],
      temperature: 0.7
    });
    return res.json({ ok: true, answer: completion.choices?.[0]?.message?.content || "Aucune réponse reçue." });
  } catch (error) {
    console.error("Assistant:", error);
    return res.status(502).json({ error: error?.message || "Échec de l'assistant." });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(root, "public", "index.html")));
app.listen(port, () => console.log(`Kamikaze IA prêt sur le port ${port}`));
