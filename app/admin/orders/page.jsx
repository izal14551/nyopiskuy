"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const res = await fetch("/api/orders", { cache: "no-store" });
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 3000); // refresh tiap 3 detik
    return () => clearInterval(interval);
  }, []);

  // helper rupiah
  const rp = (n = 0) => {
    try {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR"
      })
        .format(Number(n || 0))
        .replace(",00", "");
    } catch {
      return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
    }
  };

  // Bangun URL ke /checkout/receipt dari satu order
  const buildReceiptUrl = (order) => {
    // Normalisasi items ke {name, qty, price}
    const itemsClean = (order?.items || []).map((it, idx) => {
      const qty = Number(it.qty ?? it.quantity ?? 1);
      // harga per unit: coba ambil price/unit_price; jika hanya ada total & qty, turunkan
      const unitPrice =
        it.price ??
        it.unit_price ??
        (it.total && qty ? Number(it.total) / qty : 0);
      const name =
        it.name || it.menu_name || it.title || `Item ${it.menu_id ?? idx + 1}`;
      return { name, qty, price: Number(unitPrice || 0) };
    });

    // Total fallback bila order.total tidak ada
    const fallbackTotal = itemsClean.reduce(
      (s, it) => s + it.qty * it.price,
      0
    );

    const params = new URLSearchParams({
      store: "Nyopiskuy",
      orderId: String(order?.id ?? "-"),
      amount: String(order?.total ?? fallbackTotal),
      method: order?.payment_method || order?.paymentMethod || "QRIS",
      paidAt:
        order?.paid_at ||
        new Date(order?.created_at || Date.now()).toISOString(),
      print: "1",
      items: JSON.stringify(itemsClean) // dibaca di /checkout/receipt
    });

    return `/checkout/receipt?${params.toString()}`;
  };

  return (
    <div>
      <AdminSidebar />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Kelola Pesanan</h1>

        {orders.length === 0 && (
          <p className="text-gray-500 text-center">Belum ada pesanan.</p>
        )}

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-xl shadow p-4 bg-white"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg">#{order.id}</h2>
                <p className="text-sm text-gray-500">
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString("id-ID")
                    : "-"}
                </p>
              </div>

              <p className="mt-1 text-sm font-medium text-green-800">
                Pemesan: {order.customer_name}
              </p>

              <div className="mt-2 space-y-1 text-sm">
                {(order.items || []).map((item) => (
                  <div
                    key={item.id ?? `${item.name}-${item.menu_id ?? ""}`}
                    className="flex justify-between border-b pb-1"
                  >
                    <span>
                      {item.name || item.menu_name || item.title} x{" "}
                      {item.qty ?? item.quantity ?? 1}
                    </span>
                    <span>
                      {rp(
                        (item.price ?? item.unit_price ?? item.total) *
                          (item.qty ?? item.quantity ?? 1)
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-sm pb-1 flex flex-wrap items-start gap-x-3 gap-y-1">
                {/* NOTE – bisa wrap & aman untuk teks panjang */}
                <div className="min-w-0 flex-1">
                  <span className="font-medium">Note: </span>
                  <span className="whitespace-pre-wrap break-words">
                    {order.note?.trim() ? order.note : "—"}
                  </span>
                </div>

                {/* PAYMENT */}
                <div className="font-bold shrink-0">
                  Pembayaran Via: {order.payment_method}
                </div>
              </div>

              <div className="mt-2 text-right font-bold text-green-800">
                Total: {rp(order.total ?? 0)}
              </div>

              <div className="mt-3 flex flex-wrap gap-3 items-center justify-between">
                {/* Badge status */}
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    order.status === "Selesai"
                      ? "bg-green-100 text-green-700"
                      : order.status === "Dibatalkan"
                      ? "bg-red-100 text-red-700"
                      : order.status === "Belum Bayar"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.status}
                </span>

                <div className="flex gap-2 justify-between items-center">
                  {/* Tombol CETAK STRUK */}
                  <a
                    href={buildReceiptUrl(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center"
                    title="Cetak struk pesanan ini"
                  >
                    Cetak Struk
                  </a>

                  {/* Dropdown ubah status */}
                  <select
                    value={order.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;

                      await fetch(`/api/orders/${order.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: newStatus })
                      });

                      setOrders((prev) =>
                        prev.map((o) =>
                          o.id === order.id ? { ...o, status: newStatus } : o
                        )
                      );
                    }}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="Belum Bayar">Belum Bayar</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
