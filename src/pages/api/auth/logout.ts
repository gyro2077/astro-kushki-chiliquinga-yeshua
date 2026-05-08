import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete("user_id", { path: "/" });
  cookies.delete("user_role", { path: "/" });
  return new Response(null, { status: 302, headers: { Location: "/" } });
};
