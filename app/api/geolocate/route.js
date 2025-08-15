import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Server missing GOOGLE_MAPS_API_KEY" },
      { status: 500 }
    );
  }
  try {
    const resp = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ considerIp: true })
      }
    );
    const data = await resp.json();
    if (!resp.ok) {
      const msg = data?.error?.message || "Google Geolocation API error";
      return NextResponse.json({ error: msg }, { status: 502 });
    }
    const { location, accuracy } = data || {};
    if (
      !location ||
      typeof location.lat !== "number" ||
      typeof location.lng !== "number"
    ) {
      return NextResponse.json(
        { error: "Lokasi tidak tersedia" },
        { status: 502 }
      );
    }
    return NextResponse.json({
      lat: location.lat,
      lng: location.lng,
      accuracy
    });
  } catch (err) {
    console.error("Geolocate proxy error:", err);
    return NextResponse.json(
      { error: "Gagal mendapatkan lokasi" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}
