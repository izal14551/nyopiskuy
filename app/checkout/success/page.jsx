"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SuccessPage() {
  const [totalEstimatedMinutes, setTotalEstimatedMinutes] = useState(0);

  useEffect(() => {
    const orderId = localStorage.getItem("orderId");
    if (!orderId) return;

    fetch(`/api/estimate/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.estimate) {
          setTotalEstimatedMinutes(data.estimate);
        } else {
          console.warn("Data estimasi tidak ditemukan:", data);
          setTotalEstimatedMinutes(0);
        }

        // Hapus data dari localStorage
        localStorage.removeItem("orderId");
        localStorage.removeItem("cart");
        localStorage.removeItem("customerName");
      })
      .catch((err) => {
        console.error("Gagal mengambil estimasi:", err);
        setTotalEstimatedMinutes(0);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-24 mb-4 text-green-700"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>

      <h1 className="text-2xl font-bold text-green-700 mb-2">
        Pesanan Berhasil!
      </h1>

      <p className="text-green-700 text-center font-medium mt-4">
        Pesanan Anda Akan diantar dalam ± {totalEstimatedMinutes} menit
      </p>

      <p className="text-gray-600 mb-6">
        Terima kasih atas pesanan nya jangan lupa order lagi ya
      </p>

      <Link
        href="/"
        className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800"
      >
        Kembali ke Menu
      </Link>
    </div>
  );
}
