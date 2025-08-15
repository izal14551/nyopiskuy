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
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    const storedNote = localStorage.getItem("orderNote");
    if (storedNote) setOrderNote(storedNote);
  }, []);

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

  const handleCheckout = async (forcedMethod) => {
    const method = forcedMethod ?? paymentMethod;

    if (!customerName.trim()) {
      alert("Nama pemesan wajib diisi.");
      return;
    }
    if (!method) {
      // belum pilih metode → buka modal
      openPaymentModal();
      return;
    }

    setIsPaying(true);
    setStatusMessage("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          paymentMethod: method,
          orderNote,
          cart,
          total
        })
      });

      const data = await res.json();

      if (res.ok && data?.success) {
        localStorage.setItem("orderId", data.orderId);
        // Arahkan sesuai metode
        if (method === "QRIS") {
          window.location.href = `/checkout/qris?orderId=${encodeURIComponent(
            data.orderId
          )}&amount=${encodeURIComponent(total)}`;
        } else {
          router.push("/checkout/success");
        }
      } else {
        setStatusMessage(data?.message || "Gagal menyimpan pesanan.");
        alert(data?.message || "Gagal menyimpan pesanan.");
        setIsPaying(false);
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Terjadi kesalahan saat memproses pesanan.");
      setIsPaying(false);
    }
  };
  const labelMetode =
    paymentMethod === "QRIS"
      ? "QRIS"
      : paymentMethod === "Bayar di Tempat"
      ? "Bayar di Tempat"
      : "Belum dipilih";

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
          <h2 className="text-sm   mb-1">Catatan Pesanan</h2>
          <p className="text-sm text-gray-700 bg-gray-50 border rounded-xl px-4 py-3 whitespace-pre-line">
            {orderNote?.trim() ? orderNote : "—"}
          </p>

          {/* Metode Pembayaran */}
          <div className="mt-2">
            <label className="text-sm font-medium block mb-1">
              Metode Pembayaran
            </label>
            <button
              onClick={openPaymentModal}
              className="w-full flex items-center justify-between border rounded-xl px-4 py-3 text-sm hover:bg-gray-50"
            >
              <span
                className={`${paymentMethod ? "font-medium" : "text-gray-500"}`}
              >
                {paymentMethod ? labelMetode : "Pilih Metode Pembayaran"}
              </span>
              <span>▾</span>
            </button>
          </div>

          {/* Tombol Pesan */}
          <button
            onClick={() => handleCheckout()}
            disabled={isPaying}
            className={`w-full ${
              isPaying
                ? "bg-gray-300 text-gray-500 cursor-wait"
                : "bg-green-700 hover:bg-green-800 text-white"
            } py-3 rounded font-semibold`}
          >
            {isPaying
              ? "Memproses Pesanan..."
              : paymentMethod
              ? `Pesan Sekarang (${labelMetode})`
              : "Pesan Sekarang"}
          </button>

          {/* Info status (opsional) */}
          {statusMessage && (
            <p className="text-red-600 text-sm mt-2">{statusMessage}</p>
          )}
        </div>
      )}

      {/* ====== MODAL METODE PEMBAYARAN (bottom sheet) ====== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop gelap & blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={closeModal}
            aria-hidden="true"
          />
          {/* Sheet */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-md
              bg-white rounded-t-2xl shadow-xl p-5
              transform transition-all duration-300
              ${
                modalVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-full opacity-0"
              }`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold">Pilih Metode Pembayaran</h3>
              <button
                onClick={closeModal}
                className="px-2 py-1 rounded hover:bg-gray-100"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* QRIS */}
              <button
                type="button"
                onClick={() => setPaymentMethod("QRIS")}
                className={`w-full text-left p-4 rounded-xl border transition
                  ${
                    paymentMethod === "QRIS"
                      ? "border-green-700 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center
                    ${
                      paymentMethod === "QRIS"
                        ? " text-white"
                        : " text-gray-700"
                    }`}
                  >
                    <img src="/logo-qris.png" alt="" />
                  </div>
                  <div>
                    <div className="font-medium">QRIS</div>
                    <div className="text-sm text-gray-600">
                      Bayar via QRIS (QR akan ditampilkan di halaman berikutnya)
                    </div>
                  </div>
                </div>
              </button>

              {/* COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod("Bayar di Tempat")}
                className={`w-full text-left p-4 rounded-xl border transition
                  ${
                    paymentMethod === "Bayar di Tempat"
                      ? "border-green-700 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">Bayar di Tempat</div>
                    <div className="text-sm text-gray-600">
                      Bayar tunai saat pesanan diterima atau saat sudah selesai
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 h-11 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!paymentMethod) return;
                  // Tutup modal (animasi 300ms), lalu langsung proses
                  closeModal();
                  setTimeout(() => handleCheckout(paymentMethod), 320);
                }}
                disabled={!paymentMethod || isPaying}
                className={`flex-1 h-11 rounded-xl text-white ${
                  !paymentMethod || isPaying
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                }`}
              >
                Lanjutkan & Pesan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
