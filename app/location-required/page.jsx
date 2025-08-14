"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LocationRequiredPage() {
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  const handleRetryLocation = () => {
    if (!navigator.geolocation) {
      alert("Peramban tidak mendukung Geolocation.");
      return;
    }

    setChecking(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // ✅ Berhasil dapat lokasi
        router.push("/menu");
      },
      (error) => {
        console.error("Gagal mendapatkan lokasi:", error);
        alert(
          "Izin lokasi masih belum aktif.\n\nSilakan aktifkan lokasi di pengaturan browser, lalu klik tombol ini lagi."
        );
        setChecking(false);
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white text-center">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-red-700">
          Akses Lokasi Diperlukan
        </h1>
        <p className="mb-4 text-gray-700">
          Untuk mengakses menu, izinkan aplikasi ini mengakses lokasi Anda.
        </p>

        <ul className="text-sm text-left text-gray-600 mb-4 list-disc pl-5">
          <li>
            Jika muncul popup izin lokasi, klik <b>Izinkan</b>.
          </li>
          <li>
            Jika tidak muncul, buka pengaturan browser &gt; Privasi &gt; Lokasi.
          </li>
          <li>
            Setelah mengaktifkan, klik tombol di bawah untuk mencoba ulang.
          </li>
        </ul>

        <button
          onClick={handleRetryLocation}
          disabled={checking}
          className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800 transition"
        >
          {checking ? "Memeriksa lokasi..." : "Aktifkan Lokasi Sekarang"}
        </button>
      </div>
    </div>
  );
}
