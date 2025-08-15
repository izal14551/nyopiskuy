import { Suspense } from "react";
import ReceiptClient from "./ReceiptClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Menyiapkan struk…</div>}>
      <ReceiptClient />
    </Suspense>
  );
}
