const $ = (id) => document.getElementById(id);
document.querySelectorAll("[data-panel]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".panel").forEach((panel) => panel.hidden = panel.id !== button.dataset.panel);
}));
async function post(path, body) {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Erreur du serveur");
  return data;
}
function mediaUrl(value, depth = 0) {
  if (!value || depth > 8) return null;
  if (typeof value === "string" && /^https?:\/\//i.test(value) && /\.(png|jpe?g|webp|gif|mp4|webm)(\?|$)/i.test(value)) return value;
  if (Array.isArray(value)) { for (const item of value) { const found = mediaUrl(item, depth + 1); if (found) return found; } }
  if (typeof value === "object") {
    for (const [key, item] of Object.entries(value)) if (["url", "video_url", "image_url"].includes(key) && typeof item === "string" && /^https?:\/\//i.test(item)) return item;
    for (const item of Object.values(value)) { const found = mediaUrl(item, depth + 1); if (found) return found; }
  }
  return null;
}
async function generate(kind) {
  const prompt = $(kind + "Prompt").value.trim(), target = $(kind + "Result"), button = $("make" + (kind === "image" ? "Image" : "Video"));
  if (!prompt) { target.textContent = "Écris une description avant de générer."; return; }
  button.disabled = true; target.textContent = "Génération en cours…";
  try {
    const data = await post("/api/" + kind, { prompt }), url = mediaUrl(data.result);
    if (!url) { target.textContent = "Le moteur a répondu, mais aucun lien média reconnu."; return; }
    target.replaceChildren();
    const el = document.createElement(kind === "image" ? "img" : "video"); el.src = url; el.alt = "Résultat Kamikaze IA";
    if (kind === "video") { el.controls = true; el.playsInline = true; }
    target.append(el);
  } catch (error) { target.textContent = error.message; }
  finally { button.disabled = false; }
}
$("makeImage").addEventListener("click", () => generate("image"));
$("makeVideo").addEventListener("click", () => generate("video"));
$("sendChat").addEventListener("click", async () => {
  const target = $("chatResult"), message = $("chatPrompt").value.trim();
  if (!message) { target.textContent = "Écris un message."; return; }
  target.textContent = "L'assistant réfléchit…";
  try { const data = await post("/api/chat", { message }); target.textContent = data.answer || "Aucune réponse reçue."; }
  catch (error) { target.textContent = error.message; }
});
fetch("/api/health").then((r) => r.json()).then((s) => {
  $("status").textContent = [s.imageConfigured && s.videoConfigured ? "fal.ai configuré" : "fal.ai à configurer", s.assistantConfigured ? "assistant configuré" : "assistant à configurer"].join(" · ");
}).catch(() => $("status").textContent = "Serveur non connecté");
