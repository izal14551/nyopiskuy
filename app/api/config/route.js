// app/api/config/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const lat = process.env.KEDAI_LAT ?? "-7.400004872608103";
  const lng = process.env.KEDAI_LNG ?? "109.2442127023531";

  return NextResponse.json(
    { lat: Number(lat), lng: Number(lng) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
