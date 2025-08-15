"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    };
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 3000); // 5000 ms = 5 detik
    return () => clearInterval(interval); // bersihkan saat unmount
  }, []);

  return (
    <div>
      {" "}
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
                  {new Date(order.created_at).toLocaleString("id-ID")}
                </p>
              </div>

              <p className="mt-1 text-sm font-medium text-green-800">
                Pemesan: {order.customer_name}
              </p>

              <div className="mt-2 space-y-1 text-sm">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border-b pb-1"
                  >
                    <span>
                      {item.name} x {item.qty}
                    </span>
                    <span>
                      Rp {(item.price * item.qty).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm pb-1 flex flex-wrap items-start gap-x-3 gap-y-1">
                {/* NOTE – biar bisa wrap & aman untuk teks panjang */}
                <div className="min-w-0 flex-1">
                  <span className="font-medium">Note: </span>
                  <span className="whitespace-pre-wrap break-words">
                    {order.note?.trim() ? order.note : "—"}
                  </span>
                </div>

                {/* PAYMENT – tidak menyusut, pindah ke baris bawah kalau ruang sempit */}
                <div className="font-bold shrink-0">
                  Pembayaran Via: {order.payment_method}
                </div>
              </div>
              <div className="mt-2 text-right font-bold text-green-800">
                Total: Rp {order.total.toLocaleString("id-ID")}
              </div>

              <div className="mt-3 flex justify-between items-center">
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
          ))}
        </div>
      </div>
    </div>
  );
}
