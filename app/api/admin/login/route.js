import { serialize } from "cookie";
import db from "@/lib/db";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, password } = await req.json();

  const result = await db.query("SELECT * FROM admins WHERE email = $1", [
    email
  ]);

  if (result.rows.length === 0) {
    return NextResponse.json(
      { error: "Admin tidak ditemukan" },
      { status: 401 }
    );
  }

  const isValid = await compare(password, result.rows[0].password);
  if (!isValid) {
    return NextResponse.json(
      { success: false, message: "Password salah" },
      { status: 401 }
    );
  }

  const token = sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });

  const response = NextResponse.json({ success: true });

  response.headers.set(
    "Set-Cookie",
    serialize("admin_token", token, {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24
    })
  );

  return response;
}
