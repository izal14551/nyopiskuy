"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function QrisPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const qOrderId = sp.get("orderId") || "";
    const qAmount = Number(sp.get("amount") || 0);

    const lsOrderId = qOrderId || localStorage.getItem("orderId") || "";
    let nominal = qAmount;
    if (!nominal) {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        nominal = cart.reduce((s, it) => s + it.price * it.qty, 0);
      } catch (_) {}
    }

    setOrderId(lsOrderId);
    setAmount(nominal);
  }, [sp]);

  const displayNominal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR"
  })
    .format(amount || 0)
    .replace(",00", "");

  const handleDownload = async () => {
    try {
      // Ambil PNG dari /public
      const res = await fetch("/logo.png");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qris-${orderId || "order"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengunduh QRIS.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Pembayaran QRIS</h1>
        </div>

        {/* Info order */}
        <div className="text-sm text-gray-700 space-y-1 mb-4">
          <div>
            <span className="text-gray-500">Order ID:</span>{" "}
            <span className="font-medium">{orderId || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">Nominal:</span>{" "}
            <span className="font-semibold text-green-700">
              {displayNominal}
            </span>
          </div>
        </div>

        {/* QRIS PNG dari /public/qris.png */}
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center">
          <img
            src="/logo.png"
            alt="QRIS"
            className="w-64 h-64 object-contain rounded"
          />
          <p className="text-xs text-gray-500 mt-2">
            Scan QR ini dengan aplikasi pembayaran yang mendukung QRIS.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            href="/logo.png"
            download={`qris-${orderId || "order"}.png`}
            className="h-11 rounded-xl bg-green-700 hover:bg-green-800 text-white flex items-center justify-center"
          >
            Download QRIS
          </a>
          <a
            href="/checkout/success"
            className="h-11 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
          >
            Selesai
          </a>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          Pastikan nominal sesuai sebelum menyelesaikan pembayaran.
        </div>
      </div>
    </div>
  );
}
