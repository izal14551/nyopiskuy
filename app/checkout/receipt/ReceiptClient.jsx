"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function formatRupiah(n = 0) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    })
      .format(Number(n || 0))
      .replace(",00", "");
  } catch {
    return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
  }
}

function formatTanggal(d = new Date()) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

export default function ReceiptClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const storeName = sp.get("store") || "Nyopiskuy";
  const orderId = sp.get("orderId") || "-";
  const amount = Number(sp.get("amount") || 0);
  const method = sp.get("method") || "QRIS";
  const paidAt = sp.get("paidAt") ? new Date(sp.get("paidAt")) : new Date();
  const autoPrint = sp.get("print") === "1";

  const items = useMemo(() => {
    const j = sp.get("items");
    if (j) {
      try {
        return JSON.parse(j);
      } catch {
        /* ignore */
      }
    }
    return [];
  }, [sp, amount]);

  useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => window.print(), 300);
      return () => clearTimeout(t);
    }
  }, [autoPrint]);

  const subtotal = items.length
    ? items.reduce((s, it) => s + Number(it.price) * Number(it.qty || 1), 0)
    : amount;

  const service = 0;
  const discount = 0;
  const grandTotal = Math.max(0, subtotal + service - discount);

  return (
    <div className="page">
      <div className="ticket">
        <div className="center title">{storeName}</div>
        <div className="center small">
          Jl. Riyanto, Sumampir Wetan, Pabuaran, Kec. Purwokerto Utara,
          Kabupaten Banyumas
        </div>
        <div className="center small">IG: @nyopi_skuyy • 0851-7516-6575</div>

        <div className="sep" />

        <div className="row">
          <div className="label">Order ID</div>
          <div className="value">{orderId}</div>
        </div>
        <div className="row">
          <div className="label">Waktu</div>
          <div className="value">{formatTanggal(paidAt)}</div>
        </div>
        <div className="row">
          <div className="label">Pembayaran</div>
          <div className="value">{method}</div>
        </div>

        <div className="sep dotted" />

        {items.length > 0 ? (
          <div className="items">
            {items.map((it, idx) => (
              <div key={idx} className="item">
                <div className="name">{it.name}</div>
                <div className="qtyprice">
                  {it.qty || 1} x {formatRupiah(it.price)}
                </div>
                <div className="line total">
                  {formatRupiah((it.qty || 1) * it.price)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="item">
            <div className="name">Total Pembelian</div>
            <div className="line total">{formatRupiah(amount)}</div>
          </div>
        )}

        <div className="sep dotted" />

        <div className="row">
          <div className="label">Subtotal</div>
          <div className="value">{formatRupiah(subtotal)}</div>
        </div>
        {service ? (
          <div className="row">
            <div className="label">Service</div>
            <div className="value">{formatRupiah(service)}</div>
          </div>
        ) : null}
        {discount ? (
          <div className="row">
            <div className="label">Diskon</div>
            <div className="value">- {formatRupiah(discount)}</div>
          </div>
        ) : null}
        <div className="row grand">
          <div className="label">Total</div>
          <div className="value">{formatRupiah(grandTotal)}</div>
        </div>

        <div className="sep" />

        <div className="center small">
          Terima kasih! <br /> Simpan struk ini sebagai bukti pembayaran.
        </div>
      </div>
      <div className="actions no-print">
        <button onClick={() => window.print()} className="btn">
          Cetak Struk
        </button>
      </div>
      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: #f6f7f9;
        }
        .ticket {
          width: 80mm; /* cocok untuk thermal 80mm (juga works di 58mm, tinggal ganti) */
          background: #fff;
          color: #111;
          padding: 12px 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
          font-size: 12px;
          line-height: 1.35;
        }
        .title {
          font-weight: 700;
          font-size: 14px;
        }
        .center {
          text-align: center;
        }
        .small {
          color: #6b7280;
          font-size: 11px;
        }
        .sep {
          border-top: 1px solid #e5e7eb;
          margin: 8px 0;
        }
        .sep.dotted {
          border-top-style: dotted;
        }
        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin: 4px 0;
        }
        .row.grand {
          font-weight: 700;
        }
        .label {
          color: #374151;
        }
        .value {
          color: #111827;
        }
        .items {
          margin: 6px 0 2px;
        }
        .item {
          margin: 4px 0;
        }
        .item .name {
          font-weight: 600;
        }
        .qtyprice {
          color: #6b7280;
          font-size: 11px;
        }
        .line.total {
          text-align: right;
        }

        .actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .btn {
          height: 40px;
          padding: 0 14px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #fff;
          cursor: pointer;
        }
        .btn:hover {
          background: #f9fafb;
        }
        .btn.ghost {
          background: transparent;
        }

        /* Mode cetak */
        @media print {
          .page {
            background: #fff;
            padding: 0;
          }
          .ticket {
            width: 80mm;
            margin: 0;
            border: none;
            border-radius: 0;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 4mm; /* tipis agar muat di thermal */
          }
        }
      `}</style>
    </div>
  );
}
