"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

export default function FinanceReportPage() {
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const isSameMonth = (date) => {
    const d = new Date(date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/orders");
      const data = await res.json();
      const completed = Array.isArray(data)
        ? data.filter((o) => o.status === "Selesai")
        : [];
      setOrders(completed);
    };
    fetchData();
  }, []);

  const filteredOrders = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return orders.filter((order) => {
      const createdAt = new Date(order.created_at);
      return (
        (!start || createdAt >= start) &&
        (!end || createdAt <= end) &&
        isSameMonth(createdAt)
      );
    });
  }, [orders, startDate, endDate]);

  const total = filteredOrders.reduce(
    (acc, curr) => acc + (curr.total || 0),
    0
  );

  // ===== Grafik: label tanggal 1..akhir bulan & total per hari
  const fullMonthLabels = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, i) =>
        new Date(currentYear, currentMonth, i + 1).toLocaleDateString("id-ID")
      ),
    [daysInMonth, currentMonth, currentYear]
  );

  const dailyTotalsMap = useMemo(() => {
    const map = {};
    filteredOrders.forEach((o) => {
      const d = new Date(o.created_at).toLocaleDateString("id-ID");
      map[d] = (map[d] || 0) + (o.total || 0);
    });
    return map;
  }, [filteredOrders]);

  const chartData = {
    labels: fullMonthLabels,
    datasets: [
      {
        label: "Pendapatan Harian",
        data: fullMonthLabels.map((date) => dailyTotalsMap[date] || 0),
        borderColor: "#16a34a",
        backgroundColor: "#16a34a",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 2,
        fill: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `Rp ${Number(ctx.parsed.y || 0).toLocaleString("id-ID", {
              maximumFractionDigits: 0
            })}`
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) =>
            `Rp ${Number(value).toLocaleString("id-ID", {
              maximumFractionDigits: 0
            })}`
        }
      },
      x: {
        ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }
      }
    }
  };

  // ===== RINGKASAN MENU (qty, pendapatan, HPP, laba)
  const menuSummary = useMemo(() => {
    const map = new Map();
    filteredOrders.forEach((o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      items.forEach((it) => {
        const name =
          it?.name ?? it?.menu_name ?? it?.title ?? "Item Tanpa Nama";
        const qty = Number(it?.qty ?? it?.quantity ?? 1) || 0;
        const price = Number(it?.price ?? it?.unit_price ?? 0) || 0;
        const cost = Number(it?.cost ?? it?.hpp ?? 0) || 0;

        if (!map.has(name)) {
          map.set(name, { qty: 0, revenue: 0, cogs: 0, profit: 0 });
        }
        const row = map.get(name);
        row.qty += qty;
        row.revenue += price * qty;
        row.cogs += cost * qty;
        row.profit += (price - cost) * qty;
      });
    });

    // urutkan by revenue desc
    const rows = Array.from(map.entries()).map(([name, v]) => ({
      name,
      ...v
    }));
    rows.sort((a, b) => b.revenue - a.revenue);

    const totals = rows.reduce(
      (acc, r) => {
        acc.qty += r.qty;
        acc.revenue += r.revenue;
        acc.cogs += r.cogs;
        acc.profit += r.profit;
        return acc;
      },
      { qty: 0, revenue: 0, cogs: 0, profit: 0 }
    );

    return { rows, totals };
  }, [filteredOrders]);

  const handlePrint = () => window.print();

  const fmtIDR = (n) =>
    `Rp ${Number(n || 0).toLocaleString("id-ID", {
      maximumFractionDigits: 0
    })}`;

  return (
    <div>
      <div className="no-print">
        <AdminSidebar />
      </div>

      <div className="p-4" id="print-report">
        {/* Header + tombol cetak */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
          <button
            onClick={handlePrint}
            className="no-print px-3 py-2 rounded bg-black text-white text-sm hover:opacity-90"
          >
            Cetak Laporan
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6 flex flex-row items-center gap-6 flex-wrap md:flex-nowrap no-print">
          <div className="flex flex-col w-full md:w-1/4">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-3 py-2 rounded-md text-sm"
            />
          </div>

          <div className="flex flex-col w-full md:w-1/4">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-3 py-2 rounded-md text-sm"
            />
          </div>
        </div>

        {/* Ringkasan total */}
        <div className="mb-4 bg-green-50 border border-green-200 p-4 rounded">
          <p className="text-gray-700">
            Total Pendapatan:{" "}
            <span className="font-bold text-green-700">{fmtIDR(total)}</span>
          </p>
          <p className="text-sm text-gray-500">
            Total Transaksi Selesai: {filteredOrders.length}
          </p>
        </div>

        {/* Grafik */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="font-bold mb-2">Grafik Pendapatan</h2>
          {chartData.labels.length > 0 ? (
            <div className="h-72">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              Belum ada pendapatan saat itu.
            </p>
          )}
        </div>

        {/* RINGKASAN PENJUALAN PER MENU (ikut tercetak) */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold">Ringkasan Penjualan per Menu</h2>
            <p className="text-xs text-gray-500">
              {new Date(currentYear, currentMonth).toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric"
              })}
            </p>
          </div>

          {menuSummary.rows.length === 0 ? (
            <p className="text-sm text-gray-500">
              Belum ada data item terjual.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-600">
                    <th className="py-2 px-3">Menu</th>
                    <th className="py-2 px-3">Qty</th>
                    <th className="py-2 px-3">Pendapatan</th>
                    <th className="py-2 px-3">HPP</th>
                    <th className="py-2 px-3">Laba</th>
                  </tr>
                </thead>
                <tbody>
                  {menuSummary.rows.map((r) => (
                    <tr
                      key={r.name}
                      className="even:bg-white odd:bg-gray-50/40"
                    >
                      <td className="py-2 px-3 font-medium">{r.name}</td>
                      <td className="py-2 px-3">{r.qty}</td>
                      <td className="py-2 px-3">{fmtIDR(r.revenue)}</td>
                      <td className="py-2 px-3">{fmtIDR(r.cogs)}</td>
                      <td className="py-2 px-3 font-semibold">
                        {fmtIDR(r.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-gray-50 font-semibold">
                    <td className="py-2 px-3">Total</td>
                    <td className="py-2 px-3">{menuSummary.totals.qty}</td>
                    <td className="py-2 px-3">
                      {fmtIDR(menuSummary.totals.revenue)}
                    </td>
                    <td className="py-2 px-3">
                      {fmtIDR(menuSummary.totals.cogs)}
                    </td>
                    <td className="py-2 px-3">
                      {fmtIDR(menuSummary.totals.profit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          <p className="text-[11px] text-gray-500 mt-2">
            *Jika HPP/cost item tidak tersedia, dianggap 0.
          </p>
        </div>

        {/* Dropdown Histori Pembelian (agar page tidak panjang) */}
        <details className="bg-white border rounded shadow">
          <summary className="cursor-pointer select-none list-none px-4 py-3 font-medium flex items-center justify-between">
            <span>Histori Pembelian</span>
            <svg
              className="ml-2 h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                clipRule="evenodd"
              />
            </svg>
          </summary>

          {filteredOrders.length === 0 ? (
            <p className="px-4 pb-4 text-sm text-gray-500">
              Tidak ada transaksi yang sesuai filter.
            </p>
          ) : (
            <div className="px-4 pb-4 space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 border rounded bg-white shadow-sm text-sm"
                >
                  <div className="flex justify-between">
                    <span>#{order.id}</span>
                    <span>
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <p className="mt-1">Nama: {order.customer_name || "-"}</p>
                  <p>Total: {fmtIDR(order.total)}</p>

                  {/* Optional: tampilkan item per order (ringkas) */}
                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
                      {order.items.map((it, idx) => {
                        const nm =
                          it?.name ??
                          it?.menu_name ??
                          it?.title ??
                          `Item ${idx + 1}`;
                        const q = Number(it?.qty ?? it?.quantity ?? 1) || 0;
                        const pr =
                          Number(it?.price ?? it?.unit_price ?? 0) || 0;
                        return (
                          <li key={idx}>
                            {nm} — {q} x {fmtIDR(pr)} = {fmtIDR(q * pr)}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </details>
      </div>

      {/* CSS khusus print */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          #print-report {
            padding: 0 !important;
          }
          /* Hilangkan shadow/border agar hemat tinta */
          .shadow,
          .shadow-sm,
          .border {
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>
    </div>
  );
}
