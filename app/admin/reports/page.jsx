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
      const completed = data.filter((o) => o.status === "Selesai");
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

  // Buat label tanggal dari tanggal 1 sampai akhir bulan
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

  const chartData = {
    labels: fullMonthLabels,
    datasets: [
      {
        label: "Pendapatan Harian",
        data: fullMonthLabels.map((date) => dailyTotals[date] || 0),
        fill: false,
        borderColor: "#16a34a",
        backgroundColor: "#16a34a",
        tension: 0.3
      }
    ]
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 100000,
        ticks: {
          callback: (value) =>
            `Rp ${value.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`
        }
      }
    }
  };

  return (
    <div>
      <AdminSidebar />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Laporan Keuangan</h1>

        <div className="mb-6 flex flex-row items-center gap-6 flex-wrap md:flex-nowrap">
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

        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-bold mb-2">Grafik Pendapatan</h2>
          {chartData.labels.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p className="text-gray-400 text-sm">
              Belum ada pendapatan saat itu.
            </p>
          )}
        </div>

        <div className="space-y-3">
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
      </div>
    </div>
  );
}
