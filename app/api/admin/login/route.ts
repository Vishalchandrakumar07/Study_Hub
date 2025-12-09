import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Validate with .env credentials
  if (
    email === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
    password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
  ) {
    const res = NextResponse.json({ success: true });

    // Create admin-auth cookie
    res.cookies.set("admin-auth", "true", {
      path: "/",
      httpOnly: false, // client-side login
    });

    return res;
  }

  return NextResponse.json(
    { error: "Invalid credentials" },
    { status: 401 }
  );
}
