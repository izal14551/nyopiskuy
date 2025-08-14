"use client";

import { useEffect, useState } from "react";

export default function BestSellerCard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchBestSeller = async () => {
      const res = await fetch("/api/bestseller");
      const json = await res.json();
      setData(json);
    };

    fetchBestSeller();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-bold mb-3">🔥 Menu Terlaris</h2>
      {data.length === 0 && (
        <p className="text-sm text-gray-500">Belum ada data.</p>
      )}
      <ul className="space-y-3">
        {data.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-12 h-12 rounded object-cover"
            />
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">Dibeli {item.total_beli}x</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
