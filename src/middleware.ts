import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./app/api/auth/auth";

const protectedRoutes = ["/chat"];

export default async function middleware(request: NextRequest) {
  const session = await auth();

  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}