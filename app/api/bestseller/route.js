import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await db.query(`
    SELECT DISTINCT ON (m.category)
      m.id, m.name, m.category,
      SUM(oi.qty) AS total_beli
    FROM order_items oi
    JOIN menu m ON m.id = oi.menu_id
    GROUP BY m.id, m.name, m.category
    ORDER BY m.category, total_beli DESC
  `);

    const rowsWithUrl = result.rows.map((r) => ({
      ...r,
      image_url: `/api/menu/image/${r.id}`
    }));

    return NextResponse.json(rowsWithUrl);
  } catch (error) {
    console.error("Best seller error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data best seller" },
      { status: 500 }
    );
  }
}
