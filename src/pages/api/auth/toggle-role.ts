import type { APIRoute } from "astro";
import pool from "../../../lib/db";

export const POST: APIRoute = async ({ cookies }) => {
  const userId = cookies.get("user_id")?.value;
  const currentRole = cookies.get("user_role")?.value;

  if (!userId) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const nextRole = currentRole === "DEVELOPER" ? "USER" : "DEVELOPER";

  await pool.query("UPDATE users SET role = $1 WHERE id = $2", [nextRole, userId]);
  cookies.set("user_role", nextRole, { path: "/" });

  return new Response(JSON.stringify({ role: nextRole }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
