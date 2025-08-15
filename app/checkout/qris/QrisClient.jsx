"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function QrisClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState(0);
  const [receiptHref, setReceiptHref] = useState("#");

  useEffect(() => {
    const qOrderId = sp.get("orderId") || "";
    const qAmount = Number(sp.get("amount") || 0);

    if (!qOrderId && typeof window !== "undefined") {
      const lsOrderId = localStorage.getItem("orderId") || "";
      const lsAmount = Number(localStorage.getItem("amount") || 0);
      setOrderId(lsOrderId);
      setAmount(lsAmount);
    } else {
      setOrderId(qOrderId);
      setAmount(qAmount);
    }
  }, [sp]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let items = [];
      try {
        items = JSON.parse(localStorage.getItem("cart") || "[]");
        items = items.map((it) => ({
          name: it.name,
          qty: it.qty,
          price: it.price
        }));
      } catch (_) {}

      const params = new URLSearchParams({
        store: "Nyopiskuy",
        orderId: orderId || "-",
        amount: String(amount),
        method: "QRIS",
        paidAt: new Date().toISOString(),
        print: "1",
        items: JSON.stringify(items)
      });

      setReceiptHref(`/checkout/receipt?${params.toString()}`);
    }
  }, [orderId, amount]);

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

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId || "");
      alert("Order ID disalin.");
    } catch {
      alert("Gagal menyalin Order ID.");
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch("/qr-bayar.jpg");
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "qr-bayar.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Gagal mengunduh QR.");
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

        {/* QR Placeholder */}
        <div className="rounded-xl border p-4 mb-3 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm font-medium mb-1">NYOPI SKUYY</div>
            <div className="text-xs text-gray-500 mb-3">
              NMID : ID1025384676637
            </div>
            <div className="w-40 h-40 mx-auto rounded-lg border flex items-center justify-center">
              <Image
                src="/qr-bayar.png"
                alt="QR Code"
                width={150}
                height={150}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <a
            href="/checkout/success"
            className="h-11 rounded-xl border border-gray-200 hover:bg-green-900 flex items-center justify-center bg-green-800 text-white"
          >
            Selesai
          </a>
          <a
            href={receiptHref}
            className="h-11 rounded-xl border border-black hover:bg-gray-100 flex items-center justify-center"
          >
            Cetak Struk
          </a>
        </div>

        {/* Tombol download QR */}
        <button
          onClick={handleDownloadQR}
          className="mt-3 w-full h-11 rounded-xl border border-green-600 hover:bg-green-50 text-green-600 font-medium"
        >
          Download QR
        </button>

        <div className="text-xs text-gray-500 mt-4">
          Pastikan nominal sesuai sebelum menyelesaikan pembayaran.
        </div>
      </div>
    </div>
  );
}
