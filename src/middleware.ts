import { type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Let next-intl produce the response (handles locale prefixing/redirects).
  const response = intlMiddleware(request);

  // 2. Skip Supabase auth refresh on RSC prefetch requests AND on RSC data
  //    requests for soft navigations. Next.js issues these aggressively (link
  //    hover, viewport prefetch, soft navigation). Each auth.getUser() is a
  //    real network round trip to the (self-hosted) Supabase auth server. RSC
  //    handlers still validate auth themselves via getUser() (cached with
  //    React.cache per request), so the middleware call is redundant.
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose")?.includes("prefetch");
  const isRscRequest = request.headers.get("rsc") === "1";

  if (!isPrefetch && !isRscRequest) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|auth/callback|_next|_vercel|.*\\..*).*)"],
};
