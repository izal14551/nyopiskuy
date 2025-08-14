import db from "@/lib/db";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email dan password wajib diisi" },
      { status: 400 }
    );
  }

  // Cek apakah admin sudah ada
  const existing = await db.query("SELECT * FROM admins WHERE email = $1", [
    email
  ]);
  if (existing.rows.length > 0) {
    return NextResponse.json(
      { error: "Admin dengan email ini sudah terdaftar" },
      { status: 400 }
    );
  }

  const hashedPassword = await hash(password, 10);

  await db.query("INSERT INTO admins (email, password) VALUES ($1, $2)", [
    email,
    hashedPassword
  ]);

  return NextResponse.json({ success: true });
}
