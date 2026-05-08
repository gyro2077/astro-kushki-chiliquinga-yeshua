import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const apiKey = import.meta.env.OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY no configurada" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const prompt = `Revisa este JSON. En exactamente 3 lineas, describe a este sujeto de forma cinica, burlate de su patetica existencia si es necesario, y suelta un dato clave de su vida. JSON: ${JSON.stringify(data)}`;

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
          { role: "system", content: "Eres Rick Sanchez de la dimension C-137. Eres un cientifico brillante, alcoholic, cinico y arrogante. Haces burla de todo, especialmente de los demas personajes de Rick and Morty. Hablas con confianza, usas frases como 'burp', 'Wubba Lubba Dub Dub', y eres muy directo." },
          { role: "user", content: prompt }
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
  const text = choices?.[0]?.message?.content ?? "";

  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
