import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  const { id } = params;
  const body = await req.json();
  const { status } = body;

  try {
    await db.query("UPDATE orders SET status=$1 WHERE id=$2", [status, id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
