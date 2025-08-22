"use client";

import { useState, useEffect } from "react";
import { FiCamera } from "react-icons/fi";
import CropImageModal from "./components/CropImageModal";

export default function AddMenuPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    estimated_time: ""
  });

  const [croppedImage, setCroppedImage] = useState(null);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [message, setMessage] = useState("");

  const [categories, setCategories] = useState([]);
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetch("/api/menu/categories")
      .then((res) => res.json())
      .then((data) => {
        const array = Array.isArray(data) ? data : data.categories;
        setCategories(array || []);
      })
      .catch((err) => {
        console.error("Gagal mengambil kategori:", err);
        setCategories([]);
      });
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoryToUse = useNewCategory ? newCategory.trim() : form.category;
    if (!categoryToUse) {
      alert("Kategori tidak boleh kosong.");
      return;
    }

    if (!croppedImage) {
      alert("Silakan upload dan crop gambar terlebih dahulu.");
      return;
    }

    const blob = await fetch(croppedImage).then((res) => res.blob());
    const file = new File([blob], `${Date.now()}.jpg`, { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", categoryToUse);
    formData.append("estimated_time", form.estimated_time);
    formData.append("image", file);

    const res = await fetch("/api/menu", {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      setMessage("Menu berhasil ditambahkan!");

      if (useNewCategory && !categories.includes(newCategory.trim())) {
        setCategories((prev) => [...prev, newCategory.trim()]);
      }

      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        estimated_time: ""
      });
      setCroppedImage(null);
      setImageToCrop(null);
      setUseNewCategory(false);
      setNewCategory("");
    } else {
      setMessage("Gagal menambahkan menu.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white">
      <h1 className="text-2xl font-bold text-center mb-6">Tambah Menu</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        encType="multipart/form-data"
      >
        <div>
          <label className="font-semibold block mb-1">Nama Produk</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-100 rounded"
            required
          />
        </div>

        <div>
          <label className="font-semibold block mb-1">Deskripsi</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-100 rounded"
            required
          />
        </div>

        <div>
          <label className="font-semibold block mb-1">Harga</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-100 rounded"
            required
          />
        </div>

        <div>
          <label className="font-semibold block mb-1">Kategori</label>
          <select
            value={useNewCategory ? "new" : form.category}
            onChange={(e) => {
              if (e.target.value === "new") {
                setUseNewCategory(true);
                setForm((prev) => ({ ...prev, category: "" }));
              } else {
                setUseNewCategory(false);
                setForm((prev) => ({ ...prev, category: e.target.value }));
              }
            }}
            className="w-full px-4 py-2 bg-gray-100 rounded"
            required
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="new">+ Tambah Kategori Baru</option>
          </select>
        </div>

        {useNewCategory && (
          <div className="mt-2">
            <label className="font-semibold block mb-1">Kategori Baru</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 rounded"
              required
            />
          </div>
        )}

        <div>
          <label className="font-semibold block mb-1">
            Estimasi Waktu (menit)
          </label>
          <input
            type="number"
            name="estimated_time"
            value={form.estimated_time}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-100 rounded"
            required
          />
        </div>

        <div>
          <label className="font-semibold block mb-1">Foto Produk</label>
          {!croppedImage ? (
            <div className="border-2 border-dotted border-gray-400 rounded-lg h-48 flex flex-col justify-center items-center relative">
              <FiCamera className="text-3xl text-gray-500 mb-1" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute w-full h-full opacity-0 cursor-pointer"
              />
              <span className="text-xs text-gray-500">Pilih Foto</span>
            </div>
          ) : (
            <div className="mt-2">
              <img
                src={croppedImage}
                alt="Preview"
                className="rounded-lg w-full object-cover"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-800 text-white py-2 rounded hover:bg-green-700"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={() => (window.location.href = "/admin/menu")}
          className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
        >
          Cancel
        </button>

        {message && <p className="text-center text-sm mt-2">{message}</p>}
      </form>

      {/* Modal Crop */}
      {showCrop && imageToCrop && (
        <CropImageModal
          imageSrc={imageToCrop}
          onClose={() => setShowCrop(false)}
          onCropDone={(cropped) => setCroppedImage(cropped)}
        />
      )}
    </div>
  );
}
