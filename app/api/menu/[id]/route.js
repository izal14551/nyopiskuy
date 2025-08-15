import db from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // penting jika project default ke edge

export async function GET(req, ctx) {
  const { id: idRaw } = await ctx.params;
  const id = Number.parseInt(idRaw, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    const result = await db.query(
      `SELECT id, name, description, price, category, estimated_time
       FROM menu
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function POST(req, ctx) {
  const { id: idRaw } = await ctx.params;
  const id = Number.parseInt(idRaw, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    const formData = await req.formData();

    const name = formData.get("name")?.toString().trim() ?? "";
    const description = formData.get("description")?.toString().trim() ?? "";
    const price = Number.parseInt(formData.get("price"), 10);
    const category = formData.get("category")?.toString().trim() ?? "";
    const estimated_time = Number.parseInt(formData.get("estimated_time"), 10);
    const imageFile = formData.get("image");

    if (!Number.isFinite(price) || !Number.isFinite(estimated_time)) {
      return NextResponse.json(
        { error: "Harga atau estimasi waktu tidak valid" },
        { status: 400 }
      );
    }

    // Jika ada file gambar yang benar-benar diunggah
    if (imageFile instanceof Blob && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await db.query(
        `UPDATE menu
         SET name=$1, description=$2, price=$3, category=$4, estimated_time=$5, image=$6
         WHERE id=$7`,
        [name, description, price, category, estimated_time, buffer, id]
      );
    } else {
      await db.query(
        `UPDATE menu
         SET name=$1, description=$2, price=$3, category=$4, estimated_time=$5
         WHERE id=$6`,
        [name, description, price, category, estimated_time, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal update menu" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, ctx) {
  const { id: idRaw } = await ctx.params;
  const id = Number.parseInt(idRaw, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    // Opsional: cek keberadaan data
    const result = await db.query("SELECT 1 FROM menu WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.query("DELETE FROM menu WHERE id = $1", [id]);
    return NextResponse.json({ message: "Menu berhasil dihapus" });
  } catch (err) {
    console.error("❌ Gagal hapus menu:", err);
    return NextResponse.json(
      { error: "Gagal menghapus menu" },
      { status: 500 }
    );
  }
}
