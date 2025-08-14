export default function getCroppedImg(imageSrc, pixelCrop) {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Gagal crop"));
        const croppedUrl = URL.createObjectURL(blob);
        resolve(croppedUrl);
      }, "image/jpeg");
    };

    image.onerror = () => reject(new Error("Gagal load gambar"));
  });
}
