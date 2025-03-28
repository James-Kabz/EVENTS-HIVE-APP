import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Define protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard")
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register")

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  // Handle forbidden access (example: checking role-based access)
  // This is just a placeholder - you would implement your actual permission logic
  if (isAuthenticated && isProtectedRoute && request.nextUrl.pathname.startsWith("/dashboard")) {
    const userRole = token.role as string 

    // setting allowed roles
    const allowedRoles = ["admin", "guest","user","moderator"];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/forbidden", request.url))
    }
  }

  return NextResponse.next()
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/unauthorized", "/forbidden"],
}

