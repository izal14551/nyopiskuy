"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";

export default function ManageMenuPage() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  // Ambil semua menu
  const fetchMenus = async () => {
    const res = await fetch("/api/menu");
    if (!res.ok) {
      console.error("Gagal mengambil data menu");
      return;
    }
    const data = await res.json();
    setMenus(data);
  };

  // Ambil semua kategori unik dari API
  const fetchCategories = async () => {
    const res = await fetch("/api/menu/categories");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, []);

  const handleToggleSoldOut = async (id) => {
    setMenus((prev) =>
      prev.map((m) => (m.id === id ? { ...m, sold_out: !m.sold_out } : m))
    );
    try {
      const res = await fetch(`/api/menu/${id}/soldout`, {
        method: "PATCH",
        cache: "no-store"
      });
      if (!res.ok) {
        setMenus((prev) =>
          prev.map((m) => (m.id === id ? { ...m, sold_out: !m.sold_out } : m))
        );
        console.error("Gagal toggle sold out");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (typeof data.sold_out === "boolean") {
        setMenus((prev) =>
          prev.map((m) => (m.id === id ? { ...m, sold_out: data.sold_out } : m))
        );
      } else {
        fetchMenus();
      }
    } catch (e) {
      setMenus((prev) =>
        prev.map((m) => (m.id === id ? { ...m, sold_out: !m.sold_out } : m))
      );
      console.error("Error toggle sold out:", e);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus menu ini?")) {
      await fetch(`/api/menu/${id}`, { method: "DELETE" });
      fetchMenus(); // refresh
    }
  };

  const filteredMenus = activeCategory
    ? menus.filter((m) => m.category === activeCategory)
    : menus;

  return (
    <div>
      <AdminSidebar />

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 ">Edit Our Menu</h1>

        {/* Filter kategori */}
        <div className="bg-white sticky top-0 z-10 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm ${
                activeCategory === null
                  ? "bg-green-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-green-100"
              }`}
            >
              Semua
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
                className={`px-4 py-2 rounded-full text-sm ${
                  activeCategory === cat
                    ? "bg-green-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-green-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Daftar menu */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-lg shadow p-2 flex flex-col justify-between h-full"
            >
              <div>
                <div className="relative">
                  <img
                    src={`/api/menu/image/${menu.id}`}
                    alt={menu.name}
                    className={`rounded-lg w-full object-cover h-32 mb-2 ${
                      menu.sold_out ? "grayscale opacity-70" : ""
                    }`}
                  />
                  {menu.sold_out && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow flex items-center gap-1">
                        ⛔ Sold Out
                      </span>
                    </div>
                  )}
                </div>

                <h2 className="font-bold text-sm mb-1">{menu.name}</h2>
                <p className="text-xs text-gray-600 min-h-[2.5rem] mb-1">
                  {menu.description}
                </p>
                <p className="font-bold text-sm text-black mb-2">
                  Rp. {menu.price.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Tombol aksi */}
              <div className="grid grid-cols-3 gap-1 text-xs mt-auto">
                <Link href={`/admin/menu/edit/${menu.id}`}>
                  <button className="w-full h-10 bg-green-600 text-white py-1 rounded">
                    Edit
                  </button>
                </Link>
                <button
                  onClick={() => handleToggleSoldOut(menu.id)}
                  className={`w-full h-10 py-1 rounded ${
                    menu.sold_out
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {menu.sold_out ? "Aktifkan" : "Sold Out"}
                </button>
                <button
                  onClick={() => handleDelete(menu.id)}
                  className="w-full h-10 bg-red-600 text-white py-1 rounded"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tombol tambah menu */}
        <Link href="/admin/menu/add">
          <div className="fixed bottom-5 right-5 bg-green-800 w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-white text-2xl">
            +
          </div>
        </Link>
      </div>
    </div>
  );
}
