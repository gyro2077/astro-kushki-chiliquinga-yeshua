import type { APIRoute } from "astro";
import pool from "../../../lib/db";

const MAX_TOKENS = 50;

export const POST: APIRoute = async ({ cookies }) => {
  const userId = cookies.get("user_id")?.value;
  if (!userId) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  await pool.query(
    "UPDATE users SET tokens_remaining = $1 WHERE id = $2",
    [MAX_TOKENS, userId]
  );

  return new Response(JSON.stringify({ tokensRemaining: MAX_TOKENS }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
