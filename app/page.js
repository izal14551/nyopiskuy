import db from "@/lib/db";
import MenuGrid from "../components/MenuGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const res = await db.query("SELECT * FROM menu ORDER BY id ASC");
  const menuItems = res.rows;
  const categories = [...new Set(menuItems.map((item) => item.category))];

  return <MenuGrid categories={categories} menuItems={menuItems} />;
}
