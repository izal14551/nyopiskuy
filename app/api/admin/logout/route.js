import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    serialize("admin_token", "", {
      path: "/",
      httpOnly: true,
      maxAge: 0 // delete
    })
  );
  return response;
}
