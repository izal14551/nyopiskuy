import { NextResponse } from "next/server";
import db from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

// GET: ambil data menu berdasarkan ID
export async function GET(req, context) {
  const { id } = await context.params;

  try {
    const result = await db.query("SELECT * FROM menu WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Gagal ambil menu" }, { status: 500 });
  }
}

// POST: update data + optional image
export async function POST(req, context) {
  const { id } = await context.params;
  const formData = await req.formData();

  const name = formData.get("name");
  const description = formData.get("description");
  const price = parseInt(formData.get("price"));
  const category = formData.get("category");
  const image = formData.get("image"); // file
  const imageName = formData.get("imageName"); // fallback

  let imageUrl = imageName || null;

  // Jika upload baru
  if (image && typeof image === "object") {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${image.name}`;
    const filePath = path.join(process.cwd(), "public", "images", fileName);

    await writeFile(filePath, buffer);

    imageUrl = `/images/${fileName}`;
  }
  console.log("imageName dari formData:", imageName);

  if (imageName) {
    const cleanName = imageName.replace("/images/", "").trim();
    const oldFilePath = path.join(process.cwd(), "public", "images", cleanName);

    console.log("🧹 Mencoba menghapus file:");
    console.log("- imageName:", imageName);
    console.log("- cleanName:", cleanName);
    console.log("- path:", oldFilePath);

    try {
      await fs.promises.unlink(oldFilePath);
      console.log("✅ File berhasil dihapus:", cleanName);
    } catch (err) {
      console.warn("⚠️ Gagal menghapus file:", cleanName);
      console.warn("Alasan:", err.message);
    }
  }

  try {
    await db.query(
      "UPDATE menu SET name=$1, description=$2, price=$3, category=$4, image_url=$5 WHERE id=$6",
      [name, description, price, category, imageUrl, id]
    );

    return NextResponse.json({ message: "Menu berhasil diupdate" });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Gagal update menu" }, { status: 500 });
  }
}
export async function DELETE(_, context) {
  const { id } = await context.params;

  try {
    // Ambil data menu terlebih dahulu untuk tahu nama gambar
    const result = await db.query("SELECT image_url FROM menu WHERE id = $1", [
      id
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }

    const imageUrl = result.rows[0].image_url;
    const fileName = imageUrl?.replace("/images/", "");

    // Hapus dari database
    await db.query("DELETE FROM menu WHERE id = $1", [id]);

    // Hapus file dari /public/images/
    if (fileName) {
      const imagePath = path.join(process.cwd(), "public", "images", fileName);
      try {
        await fs.promises.unlink(imagePath);
        console.log("🗑️ Gambar dihapus:", imagePath);
      } catch (err) {
        console.warn("⚠️ Gagal menghapus gambar:", err.message);
      }
    }

    return NextResponse.json({ message: "Menu berhasil dihapus" });
  } catch (err) {
    console.error("❌ Gagal hapus menu:", err.message);
    return NextResponse.json(
      { error: "Gagal menghapus menu" },
      { status: 500 }
    );
  }
}
