import db from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();

  const name = formData.get("name");
  const description = formData.get("description");
  const price = parseInt(formData.get("price"));
  const category = formData.get("category");
  const file = formData.get("image");

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = path.join(process.cwd(), "public", "images", fileName);
  const estimated_time = parseInt(formData.get("estimated_time"));

  try {
    await writeFile(filePath, buffer);

    await db.query(
      "INSERT INTO menu (name, description, price, category, image_url, estimated_time) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        name,
        description,
        price,
        category,
        `/images/${fileName}`,
        estimated_time
      ]
    );

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const result = await db.query("SELECT * FROM menu ORDER BY id DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil menu" },
      { status: 500 }
    );
  }
}
