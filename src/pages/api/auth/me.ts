import type { APIRoute } from "astro";
import pool from "../../../lib/db";

export const GET: APIRoute = async ({ cookies }) => {
  const userId = cookies.get("user_id")?.value;
  if (!userId) {
    return new Response(JSON.stringify({ tokensRemaining: 0, role: "GUEST" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  const result = await pool.query(
    "SELECT tokens_remaining, role, email FROM users WHERE id = $1",
    [userId]
  );

  if (result.rowCount === 0) {
    return new Response(JSON.stringify({ tokensRemaining: 0, role: "GUEST" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  const row = result.rows[0];
  return new Response(
    JSON.stringify({
      tokensRemaining: row.tokens_remaining ?? 0,
      role: row.role ?? "USER",
      email: row.email ?? null
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};
