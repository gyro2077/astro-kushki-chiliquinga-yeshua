import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const clientId = import.meta.env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID;
  const appUrl = import.meta.env.APP_URL ?? process.env.APP_URL ?? "https://astro-kushki-chiliquinga-yeshua.vercel.app";

  if (!clientId) {
    return new Response("GOOGLE_CLIENT_ID is not defined", { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account"
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    }
  });
};
