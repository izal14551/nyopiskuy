"use client";

import { useState, useEffect } from "react";
import BestSellerCard from "./BestSellerCard";
import Image from "next/image";
const KEDAI_LAT = -7.400004872608103;
const KEDAI_LNG = 109.2442127023531;
const MAX_DISTANCE_KM = 0.2;

export default function MenuGrid({ categories, menuItems }) {
  const [activeCategory, setActiveCategory] = useState("");
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const distance = getDistanceFromLatLonInKm(
            userLat,
            userLng,
            KEDAI_LAT,
            KEDAI_LNG
          );

          if (distance > MAX_DISTANCE_KM) {
            window.location.href = "/location-required";
          }
        },
        (err) => {
          console.error("Lokasi gagal diambil:", err);
          window.location.href = "/location-required";
        }
      );
    } else {
      alert("Peramban tidak mendukung Geolocation.");
      window.location.href = "/location-required";
    }
  }, []);

  const [selectedItem, setSelectedItem] = useState(null);
  const closeModal = () => setSelectedItem(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("customerName", customerName);
  }, [customerName]);

  useEffect(() => {
    const storedNote = localStorage.getItem("orderNote");
    if (storedNote) setOrderNote(storedNote);
  }, []);

  useEffect(() => {
    localStorage.setItem("orderNote", orderNote);
  }, [orderNote]);

  const [bestSellerIds, setBestSellerIds] = useState([]);

  useEffect(() => {
    const fetchBestSellers = async () => {
      const res = await fetch("/api/bestseller");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const ids = list.map((m) => m.id);
      setBestSellerIds(ids);
    };
    fetchBestSellers();
  }, []);

  const filteredItems =
    activeCategory === ""
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  const addToCart = (menuItem, temperature, sweetness) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === menuItem.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [
          ...prev,
          {
            ...menuItem,
            qty: 1,

            estimated_time: menuItem.estimated_time || 5
          }
        ];
      }
    });
    setAnimateCart(true);
    setTimeout(() => setAnimateCart(false), 300);
    closeModal();
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    const item = cart.find((item) => item.id === id);

    if (item.qty === 1) {
      setRemovingItemId(id);
      setTimeout(() => {
        setCart((prev) => prev.filter((item) => item.id !== id));
        setRemovingItemId(null);
      }, 300);
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        )
      );
    }
  };

  const handleAddClick = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Navbar */}
      <div className="w-full grid grid-cols-3 items-center px-4 py-3 shadow-md sticky top-0 bg-green-800 z-50">
        <div />

        <h1 className="text-xl font-bold tracking-wide text-center text-white">
          NYOPISKUY
        </h1>

        <div className="justify-self-end">
          <Image src="/logo-putih.png" alt="Logo" width={32} height={32} />
        </div>
      </div>

      {/* Kategori */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
          <button
            onClick={() => setActiveCategory("")}
            className={`px-4 py-2 rounded-full text-sm ${
              activeCategory === ""
                ? "bg-green-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-green-100"
            }`}
          >
            Semua
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm  ${
                activeCategory === cat
                  ? "bg-green-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-green-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Menu */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow p-2 flex flex-col justify-between h-full"
          >
            <div>
              <div className="relative">
                <img
                  src={item.image_url ?? `/api/menu/image/${item.id}`}
                  alt={item.name}
                  className={`rounded-md w-full h-28 object-cover ${
                    item.sold_out ? "grayscale opacity-70" : ""
                  }`}
                  onClick={() => setSelectedItem(item)}
                />
                {/* ⭐ Best Seller Badge */}
                {bestSellerIds.includes(item.id) && (
                  <div className="absolute top-1 right-1 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full shadow font-semibold">
                    ⭐ Best Seller
                  </div>
                )}
                {item.sold_out && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow flex items-center gap-1">
                      ⛔ Sold Out
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 px-1">
                <h3 className="font-semibold text-black text-sm">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 min-h-[2.5rem]">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Harga + Tombol */}
            <div className="mt-auto px-1">
              <div className="flex justify-between items-center mt-1">
                <p className="text-green-700 font-bold text-sm">
                  {new Intl.NumberFormat("id-ID")
                    .format(item.price)
                    .replace(",", ".")}
                </p>
                <div className="flex items-center gap-1">
                  {cart.find((i) => i.id === item.id) ? (
                    <>
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="w-6 h-6 rounded bg-gray-200 text-black hover:bg-gray-300 text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold">
                        {cart.find((i) => i.id === item.id)?.qty}
                      </span>
                      <button
                        onClick={() => increaseQty(item.id)}
                        className="w-6 h-6 rounded bg-green-800 text-white hover:bg-green-700 text-sm"
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.sold_out}
                      className={`w-6 h-6 rounded flex items-center justify-center text-lg ${
                        item.sold_out
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-800 text-white hover:bg-green-700"
                      }`}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setShowCart(true)}
        className={`fixed z-50 bottom-5 right-5 bg-green-800 text-white p-4 rounded-full shadow-lg  transition-transform duration-300 ${
          animateCart ? "scale-110" : "scale-100"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </svg>

        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {cart.reduce((total, item) => total + item.qty, 0)}
          </span>
        )}
      </button>

      {selectedItem && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-sm relative transition-all duration-300 transform scale-95 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 hover:text-red-600 rounded-full w-8 h-8 flex items-center justify-center shadow"
            >
              ❌
            </button>

            <img
              src={
                selectedItem.image_url ?? `/api/menu/image/${selectedItem.id}`
              }
              alt={selectedItem.name}
              className="w-full h-60 object-cover rounded mb-2"
            />

            <h2 className="text-xl font-bold mb-1">{selectedItem.name}</h2>
            <p className="text-sm text-gray-600 mb-2">
              {selectedItem.description}
            </p>

            {selectedItem.sold_out ? (
              <p className="text-red-600 font-semibold text-sm mb-2">
                ⛔ Sold Out
              </p>
            ) : (
              <p className="text-green-700 font-bold text-lg mb-2">
                Rp. {selectedItem.price.toLocaleString()}
              </p>
            )}

            <button
              onClick={() => addToCart(selectedItem)}
              disabled={selectedItem.sold_out}
              className={`w-full rounded py-2 text-sm ${
                selectedItem.sold_out
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-700 text-white hover:bg-green-800"
              }`}
            >
              Tambah ke Keranjang
            </button>
          </div>
        </div>
      )}
      {showCart && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-sm rounded-lg p-4 relative transition-all duration-300 transform scale-95 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
            {/* Close button */}
            <button
              onClick={() => setShowCart(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-lg"
            >
              ❌
            </button>

            <h2 className="text-xl font-bold mb-3">Keranjang</h2>
            <div className="mt-2 mb-4">
              <label className="text-sm font-medium block mb-1">
                Nama Pemesan
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama"
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-gray-600">Keranjang kosong.</p>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center text-sm border-b py-2 transition-all duration-300 ${
                      removingItemId === item.id
                        ? "opacity-0 translate-x-10"
                        : "opacity-100"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => decreaseQty(item.id)}
                          className="bg-gray-200 px-2 rounded text-sm"
                        >
                          -
                        </button>
                        <span>{item.qty}</span>
                        <button
                          onClick={() => increaseQty(item.id)}
                          className="bg-gray-200 px-2 rounded text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="font-semibold">
                      Rp. {(item.price * item.qty).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="mt-4">
                <hr className="mb-2" />
                <div className="flex justify-between font-bold text-sm">
                  <span>Total</span>
                  <span>
                    Rp.{" "}
                    {cart
                      .reduce((total, item) => total + item.price * item.qty, 0)
                      .toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="mt-2 ">
                  <label className="text-sm font-medium block mb-1">
                    Catatan Pesanan (opsional)
                  </label>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Catatan untuk seluruh pesanan (mis: less sugar semua, tanpa sedotan)"
                    className="w-full border rounded px-3 py-2 text-sm resize-y  placeholder:text-gray-400"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!customerName.trim()) {
                      alert("Nama pemesan wajib diisi.");
                      return;
                    }
                    setShowCart(false);
                    window.location.href = "/checkout";
                  }}
                  className="w-full bg-green-800 text-white py-2 rounded mt-3"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
