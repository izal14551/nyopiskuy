import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const orderId = parseInt(params.id);

  if (isNaN(orderId)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    // Ambil data pesanan target
    const orderRes = await db.query(
      `SELECT * FROM orders WHERE id = $1 AND status = 'Diproses'`,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan atau bukan status 'Diproses'" },
        { status: 404 }
      );
    }

    const createdAt = orderRes.rows[0].created_at;

    // 1. Hitung estimasi antrian dari pesanan sebelum ini
    const prevOrders = await db.query(
      `SELECT id FROM orders WHERE status = 'Diproses' AND created_at < $1`,
      [createdAt]
    );

    let estimateBefore = 0;

    for (const prev of prevOrders.rows) {
      const items = await db.query(
        `SELECT estimated_time, qty FROM order_items WHERE order_id = $1`,
        [prev.id]
      );
      estimateBefore += items.rows.reduce(
        (acc, item) => acc + (item.estimated_time ?? 0) * item.qty,
        0
      );
    }

    // 2. Hitung estimasi pesanan ini sendiri
    const currentItems = await db.query(
      `SELECT estimated_time, qty FROM order_items WHERE order_id = $1`,
      [orderId]
    );
    const estimateCurrent = currentItems.rows.reduce(
      (acc, item) => acc + (item.estimated_time ?? 0) * item.qty,
      0
    );

    const totalEstimate = estimateBefore + estimateCurrent;

    return NextResponse.json({ estimate: totalEstimate });
  } catch (err) {
    console.error("Estimasi error:", err);
    return NextResponse.json(
      { error: "Gagal menghitung estimasi" },
      { status: 500 }
    );
  }
}
