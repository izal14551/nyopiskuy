// app/api/config/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const lat = process.env.KEDAI_LAT ?? "-7.438599562810362";
  const lng = process.env.KEDAI_LNG ?? "109.26562492968277";

  return NextResponse.json(
    { lat: Number(lat), lng: Number(lng) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
