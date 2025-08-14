"use client";

import Cropper from "react-easy-crop";
import { useCallback, useState } from "react";
import getCroppedImg from "../utils/cropImage";

export default function CropImageModal({ imageSrc, onClose, onCropDone }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCrop = async () => {
    const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropDone(cropped);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-lg">
        <h2 className="text-lg font-bold mb-2 text-center">Crop Gambar</h2>

        <div className="relative w-full h-64 bg-gray-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Batal
          </button>
          <button
            onClick={handleCrop}
            className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
