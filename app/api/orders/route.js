import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { customerName, paymentMethod, cart, total, orderNote } = body;

  // Hitung estimasi total waktu penyajian
  const estimated = cart.reduce(
    (total, item) => total + (item.estimated_time ?? 0) * item.qty,
    0
  );

  try {
    // Simpan pesanan ke tabel orders, termasuk estimated_time
    const orderResult = await db.query(
      `INSERT INTO orders 
        (customer_name, payment_method, total, status, estimated_time, note) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        customerName,
        paymentMethod,
        total,
        "Diproses",
        estimated,
        orderNote ?? null
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Simpan setiap item dari cart ke order_items
    for (const item of cart) {
      await db.query(
        `INSERT INTO order_items 
          (order_id, menu_id, name, qty, price, estimated_time) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          orderId,
          item.id,
          item.name,
          item.qty,
          item.price,
          item.estimated_time ?? 0
        ]
      );
    }

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    console.error("Order Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await db.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );

    const ordersWithItems = await Promise.all(
      orders.rows.map(async (order) => {
        const items = await db.query(
          "SELECT * FROM order_items WHERE order_id = $1",
          [order.id]
        );
        return { ...order, items: items.rows };
      })
    );

    return NextResponse.json(ordersWithItems);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
