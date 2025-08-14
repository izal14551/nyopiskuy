"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const totalEstimatedMinutes = cart.reduce(
    (sum, item) => sum + (item.estimated_time ?? 0) * item.qty,
    0
  );

  const openPaymentModal = () => {
    setShowPaymentModal(true);
    setTimeout(() => setModalVisible(true), 10); // kecil delay agar transisi jalan
  };
  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setShowPaymentModal(false), 300);
  };

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));

    const storedName = localStorage.getItem("customerName");
    if (storedName) setCustomerName(storedName);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      alert("Nama pemesan wajib diisi.");
      return;
    }

    setIsPaying(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          paymentMethod: "default",
          cart,
          total
        })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("orderId", data.orderId); // ✅ DI SINI TEMPATNYA
        window.location.href = "/checkout/success";
      } else {
        alert("Gagal menyimpan pesanan.");
        setIsPaying(false);
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Terjadi kesalahan saat memproses pesanan.");
      setIsPaying(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <h2 className="text-lg font-bold mb-2">Nama Pemesan</h2>
      <p className="text-sm font-semibold mb-4">{customerName}</p>

      {cart.length === 0 ? (
        <p className="text-gray-600 text-sm">Keranjang kosong.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} x {item.qty}
              </span>
              <span>Rp. {(item.price * item.qty).toLocaleString("id-ID")}</span>
            </div>
          ))}

          <hr />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>Rp. {total.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-sm text-green-700">
            <span>Waktu Pembuatan Pesanan Anda</span>
            <span>± {totalEstimatedMinutes} menit</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isPaying}
            className={`w-full ${
              isPaying
                ? "bg-gray-300 text-gray-500 cursor-wait"
                : "bg-green-700 hover:bg-green-800 text-white"
            } py-3 rounded font-semibold`}
          >
            {isPaying ? "Memproses Pesanan..." : "Pesan Sekarang"}
          </button>
        </div>
      )}
    </div>
  );
}
