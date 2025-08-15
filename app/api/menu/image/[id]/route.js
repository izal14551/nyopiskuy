// app/api/menu/image/[id]/route.js
import db from "@/lib/db";

// Kirim binary pakai Node runtime (Buffer support)
export const runtime = "nodejs";

export async function GET(req, ctx) {
  // ⬇️ params sekarang Promise → harus di-await
  const { id: idRaw } = await ctx.params;
  const id = parseInt(idRaw, 10);
  if (isNaN(id)) return new Response("ID tidak valid", { status: 400 });

  try {
    const { rows } = await db.query("SELECT image FROM menu WHERE id = $1", [
      id
    ]);
    if (!rows.length || !rows[0].image) {
      return new Response("Gambar tidak ditemukan", { status: 404 });
    }

    const buf = rows[0].image; // bytea dari Postgres (Buffer)

    // Sniff sederhana (opsional) – kalau tidak mau, langsung pakai 'image/jpeg'
    const mime = sniffMime(buf) || "image/jpeg";

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (err) {
    console.error("Image GET error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

// --- helper opsional: tebak mime dari magic number ---
function sniffMime(buf) {
  if (!buf || buf.length < 10) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  )
    return "image/png";
  // GIF: "GIF8"
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38)
    return "image/gif";
  // WebP: "RIFF....WEBP"
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  )
    return "image/webp";
  return null;
}
