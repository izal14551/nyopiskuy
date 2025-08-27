import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { customerName, paymentMethod, cart, total, orderNote } = body;

  // Hitung estimasi total waktu penyajian
  const estimated = Array.isArray(cart)
    ? cart.reduce(
        (acc, item) =>
          acc + (Number(item?.estimated_time) || 0) * (Number(item?.qty) || 0),
        0
      )
    : 0;

  // Ambil id menu unik untuk ambil HPP dari tabel menu
  const menuIds = Array.isArray(cart)
    ? [...new Set(cart.map((it) => Number(it?.id)).filter(Boolean))]
    : [];

  try {
    // Ambil data HPP dari menu (id, name, hpp)
    let menuMap = new Map();
    if (menuIds.length > 0) {
      const { rows: menus } = await db.query(
        `SELECT id, name, hpp FROM menu WHERE id = ANY($1)`,
        [menuIds]
      );
      menuMap = new Map(menus.map((m) => [Number(m.id), m]));
    }

    // Simpan pesanan ke tabel orders
    const orderResult = await db.query(
      `INSERT INTO orders 
        (customer_name, payment_method, total, status, estimated_time, note) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        customerName ?? null,
        paymentMethod ?? null,
        Number(total) || 0,
        "Diproses",
        estimated,
        orderNote ?? null
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Simpan setiap item dari cart ke order_items (dengan cost/HPP)
    for (const item of cart || []) {
      const menuId = Number(item?.id) || null;
      const menuRef = menuId ? menuMap.get(menuId) : null;

      const qty = Number(item?.qty) || 0;
      const price = Number(item?.price) || 0;

      // Prioritas sumber HPP: item.cost/hpp -> menu.hpp -> 0
      const itemCost =
        Number(item?.cost ?? item?.hpp) || Number(menuRef?.hpp ?? 0);

      const name =
        item?.name ?? item?.menu_name ?? menuRef?.name ?? "Item Tanpa Nama";

      const est = Number(item?.estimated_time) || 0;

      await db.query(
        `INSERT INTO order_items 
          (order_id, menu_id, name, qty, price, estimated_time, cost) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, menuId, name, qty, price, est, itemCost]
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
