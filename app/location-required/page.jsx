// app/location-required/page.jsx
"use client";

import { useEffect, useState } from "react";

export default function LocationRequired() {
  const [kedaiLat, setKedaiLat] = useState(null);
  const [kedaiLng, setKedaiLng] = useState(null);

  // Ambil koordinat kedai dari API config (runtime, no-store)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/config", { cache: "no-store" });
        const { lat, lng } = await res.json();
        setKedaiLat(lat);
        setKedaiLng(lng);
      } catch (err) {
        console.error("Gagal ambil koordinat kedai:", err);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">
        Lokasi Tidak Sesuai
      </h1>
      <p className="text-gray-700 mb-6 max-w-md">
        Maaf, Anda berada di luar radius kedai. Untuk menggunakan aplikasi ini,
        silakan datang ke lokasi kedai.
      </p>

      {kedaiLat && kedaiLng && (
        <a
          href={`https://www.google.com/maps?q=${kedaiLat},${kedaiLng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg mb-3"
        >
          Buka Lokasi Kedai di Maps
        </a>
      )}

      <button
        onClick={() => (window.location.href = "/")} // balik ke halaman utama
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
      >
        Coba Lagi
      </button>
    </div>
  );
}
