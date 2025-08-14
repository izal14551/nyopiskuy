import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await db.query("SELECT DISTINCT category FROM menu");
    const categories = res.rows.map((row) => row.category);
    return NextResponse.json(categories);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil kategori" },
      { status: 500 }
    );
  }
}
