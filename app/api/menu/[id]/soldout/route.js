import { NextResponse } from "next/server";
import db from "@/lib/db";

// PATCH: Toggle sold_out
export async function PATCH(_, context) {
  const { id: idRaw } = await context.params;
  const id = Number.parseInt(idRaw, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }
  try {
    // Ambil status saat ini
    const result = await db.query("SELECT sold_out FROM menu WHERE id = $1", [
      id
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }

    const currentStatus = result.rows[0].sold_out;
    const newStatus = !currentStatus;

    await db.query("UPDATE menu SET sold_out = $1 WHERE id = $2", [
      newStatus,
      id
    ]);

    return NextResponse.json({
      message: "Status berhasil diubah",
      sold_out: newStatus
    });
  } catch (err) {
    console.error("Toggle sold_out error:", err.message);
    return NextResponse.json({ error: "Gagal toggle status" }, { status: 500 });
  }
}
