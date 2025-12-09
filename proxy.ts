import { type NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  return NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
}

export const config = {
  matcher: [
    // only proxy functionality, no auth protection
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
