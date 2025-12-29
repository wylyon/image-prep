import React, { useState, ChangeEvent } from "react";

const ImageHandler: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("downloaded-image");

  // Handle image import/upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file); // Convert file to base64 string for display
    }
  };

  // Handle image download
  const handleDownload = () => {
    if (!imageSrc) return;
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = `copy-${fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Image Importer & Downloader</h2>

      {/* File Input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ marginBottom: "20px" }}
      />

      {/* Image Display */}
      {imageSrc && (
        <div style={{ marginTop: "20px" }}>
          <h3>Preview:</h3>
          <img
            src={imageSrc}
            alt="Uploaded Preview"
            style={{
              transform: "scale(1)",
              transformOrigin: "top left",
              marginBottom: "400px", // Add extra margin as scaling doesn't push other content down
            }}
          />
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={handleDownload}
              style={{ padding: "10px 20px", cursor: "pointer" }}
            >
              Download Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageHandler;
