"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCamera } from "react-icons/fi";
import CropImageModal from "../../add/components/CropImageModal";
import { use } from "react";

export default function EditMenuPage(props) {
  const params = use(props.params);
  const { id } = params;
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: ""
  });

  const [croppedImage, setCroppedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState("");
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [message, setMessage] = useState("");

  const [categories, setCategories] = useState([]);
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          fetch(`/api/menu/${id}`),
          fetch("/api/menu/categories")
        ]);

        const menuData = await menuRes.json();
        const catData = await catRes.json();

        setForm({
          name: menuData.name ?? "",
          description: menuData.description ?? "",
          price: menuData.price ?? "",
          category: menuData.category ?? ""
        });
        setOriginalImage(menuData.image_url);
        setCroppedImage(menuData.image_url);
        setCategories(Array.isArray(catData) ? catData : []);

        console.log("✅ Kategori berhasil:", catData);
      } catch (err) {
        console.error("❌ Gagal fetch data:", err);
      }
    };

    fetchAll();
  }, [id]);

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

    const finalCategory =
      useNewCategory && newCategory.trim() ? newCategory.trim() : form.category;

    const finalForm = { ...form, category: finalCategory };

    const formData = new FormData();
    Object.entries(finalForm).forEach(([key, value]) =>
      formData.append(key, value)
    );

    if (croppedImage && croppedImage.startsWith("blob:")) {
      const blob = await fetch(croppedImage).then((res) => res.blob());
      const file = new File([blob], `${Date.now()}.jpg`, {
        type: "image/jpeg"
      });

      formData.append("image", file);
      formData.append("imageName", originalImage);
    } else {
      formData.append("imageName", originalImage);
    }

    const res = await fetch(`/api/menu/${id}`, {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      router.push("/admin/menu");
    } else {
      setMessage("Gagal update menu.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">Edit Menu</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-semibold block mb-1">Nama Produk</label>
          <input
            name="name"
            value={form.name ?? ""}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-100 rounded"
            required
          />
        </div>

        <div>
          <label className="font-semibold block mb-1">Deskripsi</label>
          <input
            name="description"
            value={form.description ?? ""}
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
            value={form.price ?? ""}
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

        {/* Upload Gambar */}
        <div>
          <label className="font-semibold block mb-1">Foto Produk</label>

          {!croppedImage && (
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
          )}

          {croppedImage && (
            <div className="mt-2">
              <img
                src={croppedImage}
                alt="Preview"
                className="rounded-lg w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setCroppedImage(null)}
                className="text-sm text-red-600 mt-2 underline"
              >
                Ganti Gambar
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 mt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/menu")}
            className="w-1/2 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-1/2 bg-green-800 text-white py-2 rounded hover:bg-green-700"
          >
            Update
          </button>
        </div>

        {message && (
          <p className="text-center text-sm mt-2 text-red-600">{message}</p>
        )}
      </form>

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
