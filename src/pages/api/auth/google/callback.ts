import type { APIRoute } from "astro";
import pool from "../../../../lib/db";

type TokenResponse = {
  access_token: string;
  id_token: string;
};

type GoogleProfile = {
  email: string;
  name: string;
  picture?: string;
};

export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const clientId = import.meta.env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = import.meta.env.APP_URL ?? process.env.APP_URL ?? "http://localhost:4321";

  if (!code || !clientId || !clientSecret) {
    return new Response("Invalid OAuth request", { status: 400 });
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${appUrl}/api/auth/google/callback`,
      grant_type: "authorization_code"
    })
  });

  if (!tokenRes.ok) {
    return new Response("Failed to exchange token", { status: 400 });
  }

  const tokenData = (await tokenRes.json()) as TokenResponse;

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });

  if (!profileRes.ok) {
    return new Response("Failed to fetch profile", { status: 400 });
  }

  const profile = (await profileRes.json()) as GoogleProfile;

  const existing = await pool.query("SELECT id, role FROM users WHERE email = $1", [profile.email]);
  let userId = existing.rows[0]?.id;
  let role = existing.rows[0]?.role ?? "USER";

  if (!userId) {
    const insert = await pool.query(
      "INSERT INTO users (username, email, password_hash, role, is_verified, tokens_remaining) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, role",
      [profile.name, profile.email, "google-oauth", "USER", true, 1000]
    );
    userId = insert.rows[0].id;
    role = insert.rows[0].role;
  }

  cookies.set("user_id", String(userId), { path: "/" });
  cookies.set("user_role", String(role), { path: "/" });
  cookies.set("user_email", encodeURIComponent(profile.email), { path: "/" });

  return new Response(null, { status: 302, headers: { Location: "/" } });
};
