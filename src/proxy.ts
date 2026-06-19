import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect the root dashboard route (/)
  if (pathname === "/") {
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!sessionCookie?.value) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware only to the root dashboard path
  matcher: ["/"],
};
