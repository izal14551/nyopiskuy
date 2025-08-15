"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function QrisClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState(0);

  // Ambil nilai dari query string, dengan fallback localStorage (jika kamu butuh)
  useEffect(() => {
    const qOrderId = sp.get("orderId") || "";
    const qAmount = Number(sp.get("amount") || 0);

    // fallback opsional dari localStorage, kalau sebelumnya kamu simpan di sana
    if (!qOrderId && typeof window !== "undefined") {
      const lsOrderId = localStorage.getItem("orderId") || "";
      const lsAmount = Number(localStorage.getItem("amount") || 0);
      setOrderId(lsOrderId);
      setAmount(lsAmount);
      return;
    }

    setOrderId(qOrderId);
    setAmount(qAmount);
  }, [sp]);

  const displayNominal = useMemo(() => {
    try {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR"
      })
        .format(amount || 0)
        .replace(",00", "");
    } catch {
      return `Rp ${amount?.toLocaleString("id-ID")}`;
    }
  }, [amount]);

  // Contoh handler jika kamu butuh aksi (silakan sesuaikan)
  const handleDownload = async () => {
    try {
      // TODO: ganti ke proses download struk/QR di app kamu
      alert("Contoh: lakukan download QR/struk di sini.");
    } catch (e) {
      console.error(e);
      alert("Gagal mengunduh file.");
    }
  };

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId || "");
      alert("Order ID disalin.");
    } catch {
      alert("Gagal menyalin Order ID.");
    }
  };

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h1 className="text-xl font-semibold">Checkout QRIS</h1>
          <p className="text-sm text-gray-500">
            Selesaikan pembayaran Anda dengan QRIS.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border p-3">
            <div className="text-xs text-gray-500">Order ID</div>
            <div className="font-medium break-all">{orderId || "-"}</div>
          </div>
          <div className="rounded-xl border p-3">
            <div className="text-xs text-gray-500">Nominal</div>
            <div className="font-medium">{displayNominal}</div>
          </div>
        </div>

        {/* Placeholder QR—ganti sesuai implementasi kamu (misal img src dari API QRIS) */}
        <div className="rounded-xl border p-4 mb-3 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm font-medium mb-1">QR Code Pembayaran</div>
            <div className="text-xs text-gray-500 mb-3">
              Tampilkan QR ini di aplikasi pembayaran Anda.
            </div>
            <div className="w-40 h-40 mx-auto rounded-lg border flex items-center justify-center">
              <span className="text-xs text-gray-400">[ QR Placeholder ]</span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <a
            href="/checkout/success"
            className="h-11 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
          >
            Selesai
          </a>
          <a
            href={(() => {
              // Ambil cart dari localStorage (hanya bisa di client)
              let items = [];
              if (typeof window !== "undefined") {
                try {
                  items = JSON.parse(localStorage.getItem("cart") || "[]");
                  // Hanya ambil properti penting untuk struk
                  items = items.map((it) => ({
                    name: it.name,
                    qty: it.qty,
                    price: it.price
                  }));
                } catch (_) {}
              }

              // Encode ke URL
              const params = new URLSearchParams({
                store: "Nyopiskuy",
                orderId: orderId || "-",
                amount: String(amount),
                method: "QRIS",
                paidAt: new Date().toISOString(),
                print: "1",
                items: JSON.stringify(items) // akan di-decode di receipt page
              });

              return `/checkout/receipt?${params.toString()}`;
            })()}
            className="h-11 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
          >
            Cetak Struk
          </a>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          Pastikan nominal sesuai sebelum menyelesaikan pembayaran.
        </div>
      </div>
    </div>
  );
}
