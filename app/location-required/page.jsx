"use client";

import { useEffect, useMemo, useState } from "react";

// Haversine untuk jarak (km)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function LocationRequired() {
  const [kedaiLat, setKedaiLat] = useState(null);
  const [kedaiLng, setKedaiLng] = useState(null);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [locErr, setLocErr] = useState("");
  const [loading, setLoading] = useState(true);

  // 1) Ambil koordinat kedai secara runtime (no-cache)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/api/config", { cache: "no-store" });
        const { lat, lng } = await res.json();
        if (!ignore) {
          setKedaiLat(Number(lat));
          setKedaiLng(Number(lng));
        }
      } catch (e) {
        setLocErr("Gagal memuat lokasi kedai.");
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // 2) Minta lokasi pengguna
  const requestLocation = () => {
    setLoading(true);
    setLocErr("");
    if (!("geolocation" in navigator)) {
      setLocErr("Peramban tidak mendukung geolokasi.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLoading(false);
      },
      (err) => {
        setLocErr(
          err.code === err.PERMISSION_DENIED
            ? "Akses lokasi ditolak. Aktifkan izin lokasi lalu coba lagi."
            : "Gagal mengambil lokasi. Pastikan GPS aktif dan koneksi stabil."
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // 3) Hitung jarak jika data lengkap
  const distanceKm = useMemo(() => {
    if (
      kedaiLat == null ||
      kedaiLng == null ||
      userLat == null ||
      userLng == null
    )
      return null;
    return getDistanceKm(userLat, userLng, kedaiLat, kedaiLng);
  }, [kedaiLat, kedaiLng, userLat, userLng]);

  const distanceLabel = useMemo(() => {
    if (distanceKm == null) return "-";
    // tampilkan meter jika < 1 km, selain itu km dengan 2 desimal
    if (distanceKm < 1) {
      const meters = Math.round(distanceKm * 1000);
      return `${meters} m`;
    }
    return `${distanceKm.toFixed(2)} km`;
  }, [distanceKm]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-2">
        Lokasi Tidak Sesuai
      </h1>
      <p className="text-gray-700 mb-4 max-w-md">
        Anda berada di luar radius kedai untuk menggunakan aplikasi ini.
      </p>

      {/* Kartu ringkasan jarak */}
      <div className="w-full max-w-md border rounded-xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-sm text-gray-500">Jarak ke kedai</p>
            <p className="text-2xl font-bold">
              {loading ? "Mengukur…" : distanceLabel}
            </p>
          </div>
          {kedaiLat != null && kedaiLng != null && (
            <a
              href={`https://www.google.com/maps?q=${kedaiLat},${kedaiLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-lg text-sm"
            >
              Buka Maps
            </a>
          )}
        </div>

        {/* Detail koordinat (opsional untuk debugging) */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="p-2 bg-gray-50 rounded">
            <div className="font-semibold">Lokasi Anda</div>
            <div>Lat: {userLat ?? "-"}</div>
            <div>Lng: {userLng ?? "-"}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="font-semibold">Lokasi Kedai</div>
            <div>Lat: {kedaiLat ?? "-"}</div>
            <div>Lng: {kedaiLng ?? "-"}</div>
          </div>
        </div>
      </div>

      {locErr && <p className="text-sm text-red-600 mb-3 max-w-md">{locErr}</p>}

      <div className="flex gap-2">
        <button
          onClick={requestLocation}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
        >
          Coba Mengukur Ulang
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg"
        >
          Kembali ke Beranda
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Tips: aktifkan GPS & izinkan akses lokasi pada browser Anda.
      </p>
    </div>
  );
}
