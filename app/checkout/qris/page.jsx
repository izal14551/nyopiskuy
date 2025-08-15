import { Suspense } from "react";
import QrisClient from "./QrisClient";

// Hindari prerender statis untuk halaman berbasis query string
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Memuat checkout…</div>}>
      <QrisClient />
    </Suspense>
  );
}
