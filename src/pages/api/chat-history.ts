import type { APIRoute } from "astro";
import pool from "../../lib/db";

export const GET: APIRoute = async ({ cookies }) => {
  const userId = cookies.get("user_id")?.value;
  if (!userId) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  const result = await pool.query(
    "SELECT role, message FROM chat_history WHERE user_id = $1 ORDER BY created_at ASC",
    [userId]
  );

  return new Response(JSON.stringify(result.rows), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
