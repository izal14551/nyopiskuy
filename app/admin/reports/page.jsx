"use client";

import { useEffect, useState } from "react";
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

  const filteredOrders = orders.filter((order) => {
    const createdAt = new Date(order.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return (
      (!start || createdAt >= start) &&
      (!end || createdAt <= end) &&
      isSameMonth(createdAt)
    );
  });

  const total = filteredOrders.reduce((acc, curr) => acc + curr.total, 0);

  // Label tanggal (1..akhir bulan)
  const fullMonthLabels = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(currentYear, currentMonth, i + 1);
    return date.toLocaleDateString("id-ID");
  });

  // Total per tanggal
  const dailyTotals = {};
  filteredOrders.forEach((o) => {
    const date = new Date(o.created_at).toLocaleDateString("id-ID");
    dailyTotals[date] = (dailyTotals[date] || 0) + o.total;
  });

  // Grafik (versi baru, halus + tooltip rupiah)
  const chartData = {
    labels: fullMonthLabels,
    datasets: [
      {
        label: "Pendapatan Harian",
        data: fullMonthLabels.map((date) => dailyTotals[date] || 0),
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

  const handlePrint = () => window.print();

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

        {/* Ringkasan */}
        <div className="mb-4 bg-green-50 border border-green-200 p-4 rounded">
          <p className="text-gray-700">
            Total Pendapatan:{" "}
            <span className="font-bold text-green-700">
              Rp {total.toLocaleString("id-ID")}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Dari {filteredOrders.length} pesanan selesai
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

        {/* Dropdown / Accordion: Histori Pembelian */}
        <details className="bg-white border rounded shadow">
          <summary className="cursor-pointer select-none list-none px-4 py-3 font-medium flex items-center justify-between">
            <span>Histori Pembelian</span>
            <svg
              className="ml-2 h-4 w-4 transition-transform group-open:rotate-180"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
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
                  <p className="mt-1">Nama: {order.customer_name}</p>
                  <p>Total: Rp {order.total.toLocaleString("id-ID")}</p>
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
          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>
    </div>
  );
}
