import { NextRequest, NextResponse } from "next/server";
import { getAuthCookie, getSessionFromToken } from "./lib/auth";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return true;
  }
  // Static assets
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/sounds/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/favicon")
  ) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    // If already logged in and hitting /login, redirect to home
    if (request.nextUrl.pathname === "/login") {
      const token = getAuthCookie(request);
      if (token) {
        const session = await getSessionFromToken(token);
        if (session) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    }
    return NextResponse.next();
  }

  const token = getAuthCookie(request);
  if (!token) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await getSessionFromToken(token);
  if (!session) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("mothership_session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - api/auth (login API)
     */
    "/((?!_next/static|_next/image|api/auth).*)",
  ],
};
