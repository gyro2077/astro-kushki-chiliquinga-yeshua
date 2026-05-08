import type { APIRoute } from "astro";
import { codeToHtml } from "shiki";

export const GET: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY no configurada" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(null, { status: 400 });
  }

  const rmRes = await fetch(`https://rickandmortyapi.com/api/character/${id}`);
  if (!rmRes.ok) {
    return new Response(null, { status: 404 });
  }
  const rmData = await rmRes.json();

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
          {
            role: "system",
            content:
              "Eres un analisis cinico. Devuelve SOLO un JSON con {clasificacion_amenaza, resumen_narrativo, probabilidad_supervivencia}."
          },
          { role: "user", content: `Analiza: ${JSON.stringify(rmData)}` }
        ],
        max_tokens: 100
      })
    });
  } catch {
    return new Response(JSON.stringify({ error: "IA temporalmente saturada" }), {
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

  let json: Record<string, unknown>;
  try {
    json = (await openRouterRes.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: "Respuesta invalida de IA" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const choices = json.choices as Array<{ message?: { content?: string } }>;
  const rawText = choices?.[0]?.message?.content ?? "";

  let aiData: Record<string, unknown> = {};
  try {
    const cleaned = rawText.replace(/```json\n?|```\n?/g, "").trim();
    aiData = JSON.parse(cleaned);
  } catch {
    aiData = {
      clasificacion_amenaza: "Desconocido",
      resumen_narrativo: rawText || "Sin datos.",
      probabilidad_supervivencia: 0
    };
  }

  let shikiHtml = "";
  try {
    shikiHtml = await codeToHtml(JSON.stringify(rmData, null, 2), {
      lang: "json",
      theme: "github-dark"
    });
  } catch {
    shikiHtml = `<pre>${JSON.stringify(rmData, null, 2)}</pre>`;
  }

  return new Response(JSON.stringify({ ...aiData, shikiHtml }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
