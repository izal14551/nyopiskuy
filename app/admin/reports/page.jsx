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
    return (!start || createdAt >= start) && (!end || createdAt <= end);
  });

  const total = filteredOrders.reduce((acc, curr) => acc + curr.total, 0);

  // Group & format data untuk chart
  const chartData = (() => {
    const grouped = {};
    filteredOrders.forEach((o) => {
      const date = new Date(o.created_at).toLocaleDateString("id-ID");
      grouped[date] = (grouped[date] || 0) + o.total;
    });

    const labels = Object.keys(grouped).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    return {
      labels,
      datasets: [
        {
          label: "Pendapatan Harian",
          data: labels.map((d) => grouped[d]),
          fill: false,
          borderColor: "#16a34a",
          backgroundColor: "#16a34a",
          tension: 0.3
        }
      ]
    };
  })();

  return (
    <div>
      {" "}
      <AdminSidebar />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Laporan Keuangan</h1>

        {/* Filter Tanggal Horizontal Seimbang */}
        <div className="mb-6 flex flex-row items-center gap-6 flex-wrap md:flex-nowrap">
          {/* Dari Tanggal */}
          <div className="flex flex-col w-full md:w-1/4">
            <label
              htmlFor="startDate"
              className="text-sm font-medium text-gray-600 mb-1"
            >
              Dari Tanggal
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-3 py-2 rounded-md text-sm"
            />
          </div>

          {/* Sampai Tanggal */}
          <div className="flex flex-col w-full md:w-1/4">
            <label
              htmlFor="endDate"
              className="text-sm font-medium text-gray-600 mb-1"
            >
              Sampai Tanggal
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-3 py-2 rounded-md text-sm"
            />
          </div>
        </div>

        {/* Total Pendapatan */}
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
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-bold mb-2">Grafik Pendapatan</h2>
          {chartData.labels.length > 0 ? (
            <Line data={chartData} />
          ) : (
            <p className="text-gray-400 text-sm">
              Belum ada pendapatan saat itu.
            </p>
          )}
        </div>

        {/* Daftar Transaksi */}
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
