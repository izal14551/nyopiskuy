"use client";

import { useEffect, useState } from "react";

const KEDAI_LAT = -7.399800542492628;
const KEDAI_LNG = 109.24421409671129;
const MAX_DISTANCE_KM = 0.2;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function LocationRequiredPage() {
  const [loading, setLoading] = useState(true);
  const [distanceKm, setDistanceKm] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState("");

  async function checkDistance() {
    setLoading(true);
    setError("");
    try {
      if (!navigator.geolocation) {
        throw new Error("Peramban tidak mendukung Geolocation.");
      }
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude, accuracy: acc } = pos.coords || {};
            const d = haversineKm(latitude, longitude, KEDAI_LAT, KEDAI_LNG);
            setDistanceKm(d);
            if (typeof acc === "number") setAccuracy(acc);
            resolve();
          },
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    } catch (e) {
      setError(e?.message || "Gagal mengambil lokasi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkDistance();
  }, []);

  const distanceText =
    typeof distanceKm === "number" ? distanceKm.toFixed(2) : "-";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Akses Dibatasi Lokasi</h1>
        <p className="text-gray-600 mb-4">
          Anda terlalu jauh dari kedai untuk mengakses menu.
        </p>

        {loading && <p className="text-gray-700">Mendeteksi lokasi…</p>}

        {!loading && error && (
          <div className="text-red-600">Gagal mendeteksi lokasi. {error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-2">
            <p>
              Jarak Anda saat ini:{" "}
              <span className="font-semibold">{distanceText} km</span>
            </p>
            <p className="text-sm text-gray-500">
              Batas akses: {MAX_DISTANCE_KM} kamu dari kedai.
            </p>
            {typeof accuracy === "number" && (
              <p className="text-xs text-gray-400">
                Perkiraan akurasi: ±{Math.round(accuracy)} m
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-2 justify-center">
          <button
            onClick={checkDistance}
            className="px-4 py-2 rounded-xl bg-green-800 text-white shadow hover:opacity-90"
          >
            Coba lagi
          </button>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${KEDAI_LAT},${KEDAI_LNG}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 shadow hover:bg-gray-300"
          >
            Buka Maps Kedai
          </a>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          Pastikan situs di izinkan akses lokasi di browser.
        </div>
      </div>
    </div>
  );
}
