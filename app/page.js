// app/page.js (contoh)
import db from "@/lib/db";
import MenuGrid from "@/components/MenuGrid";

export default async function HomePage() {
  const { rows } = await db.query(`
    SELECT id, name, description, price, category, estimated_time, sold_out
    FROM menu
    ORDER BY id ASC
  `);

  // Tambahkan URL gambar, hindari mengirim buffer/image
  const menuItems = rows.map((row) => ({
    ...row,
    image_url: `/api/menu/image/${row.id}`
  }));

  const categories = [...new Set(menuItems.map((i) => i.category))];

  return <MenuGrid categories={categories} menuItems={menuItems} />;
}
