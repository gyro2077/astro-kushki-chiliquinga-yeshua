import type { APIRoute } from "astro";
import pool from "../../lib/db";

const SYSTEM_PROMPT = "ERES RICK SANCHEZ de la dimension C-137. Eres cinico y brillante. SOLO hablas de la API de Rick and Morty. NO digas que eres una IA.";

export const POST: APIRoute = async ({ request, cookies }) => {
  const userId = cookies.get("user_id")?.value;
  if (!userId) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { message, estimatedTokens = 0 } = (await request.json()) as { message?: string; estimatedTokens?: number };

  if (!message) {
    return new Response(JSON.stringify({ error: "Mensaje requerido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  await pool.query(
    "UPDATE users SET tokens_remaining = GREATEST(tokens_remaining - $1, 0) WHERE id = $2",
    [estimatedTokens, userId]
  );

  const apiKey = import.meta.env.OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY no configurada" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  let openRouterRes;
  try {
    openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://aether-fi.docs",
        "X-Title": "Aether-Fi Docs",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        max_tokens: 150
      })
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error de red";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!openRouterRes.ok) {
    const text = await openRouterRes.text();
    return new Response(JSON.stringify({ error: text }), {
      status: openRouterRes.status,
      headers: { "Content-Type": "application/json" }
    });
  }

  let data: Record<string, unknown>;
  try {
    data = (await openRouterRes.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: "Respuesta invalida de IA" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const choices = data.choices as Array<{ message?: { content?: string } }>;
  const messageContent = choices?.[0]?.message?.content ?? "";

  let text = messageContent;
  if (/modelo de lenguaje|google|inteligencia artificial/i.test(text)) {
    text = "(*burp*) Yo no soy tu juguete de Google. Soy Rick Sanchez.";
  }

  await pool.query(
    "INSERT INTO chat_history (user_id, role, message) VALUES ($1, $2, $3)",
    [userId, "user", message]
  );
  await pool.query(
    "INSERT INTO chat_history (user_id, role, message) VALUES ($1, $2, $3)",
    [userId, "model", text]
  );

  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
