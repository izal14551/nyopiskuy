import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();

  const name = formData.get("name");
  const description = formData.get("description");
  const price = parseInt(formData.get("price"));
  const category = formData.get("category");
  const estimated_time = parseInt(formData.get("estimated_time"));
  const file = formData.get("image");

  try {
    // Konversi file ke buffer (untuk BYTEA PostgreSQL)
    const buffer = Buffer.from(await file.arrayBuffer());

    await db.query(
      `INSERT INTO menu (name, description, price, category, estimated_time, image)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, description, price, category, estimated_time, buffer]
    );

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (err) {
    console.error("Upload Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await db.query(
      "SELECT id, name, description, price, category, estimated_time FROM menu ORDER BY id DESC"
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil menu" },
      { status: 500 }
    );
  }
}
