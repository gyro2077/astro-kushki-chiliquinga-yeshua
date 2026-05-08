import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const clientId = import.meta.env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID;
  
  // Get the origin from the request or env variable
  let appUrl = import.meta.env.APP_URL ?? process.env.APP_URL;
  
  if (!appUrl) {
    // Auto-detect from request headers (works in both local and Vercel)
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:4321';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    appUrl = `${protocol}://${host}`;
  }

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
