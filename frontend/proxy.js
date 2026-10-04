import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
const protectedRoutes = ["/recipe", "/recipes", "/pantry", "/dashboard"];

const isProtectedRoute = (req) => {
  const { pathname } = req.nextUrl;
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
};

export default clerkMiddleware(async (auth, req) => {
  // Then apply Clerk authentication
  const { userId, redirectToSignIn } = await auth();

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
