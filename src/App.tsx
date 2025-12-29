import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "";
const genAI = new GoogleGenerativeAI(API_KEY);

const FloorplanCleaner: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Helper to convert File to Base64 for the API
  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const handleProcessImage = async () => {
    if (!selectedImage) return;
    setIsLoading(true);

    try {
      // Use a model that supports image output (e.g., gemini-2.5-flash-image)
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      });

      const imagePart = await fileToGenerativePart(selectedImage);
      const prompt =
        "Create a high-quality, professional 2D floor plan that mimics your house layout but without any of the vacuum app clutter.";

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;

      // Extract the image part from the response
      const imagePartRes = response.candidates?.[0].content.parts.find(
        (p) => p.inlineData
      );

      if (imagePartRes?.inlineData) {
        const base64Data = imagePartRes.inlineData.data;
        const mimeType = imagePartRes.inlineData.mimeType;
        setResultImageUrl(`data:${mimeType};base64,${base64Data}`);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      alert(
        "Failed to process image. Ensure your API key supports multimodal output."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gemini Floorplan Cleaner</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {previewUrl && (
          <div>
            <h3>Original</h3>
            <img src={previewUrl} alt="Original" width="400" />
            <br />
            <button
              onClick={handleProcessImage}
              disabled={!selectedImage || isLoading}
            >
              {isLoading ? "Processing..." : "Clean Floorplan"}
            </button>
          </div>
        )}

        {resultImageUrl && (
          <div style={{ marginTop: "20px" }}>
            <h3>Resulting Floorplan:</h3>
            <img
              src={resultImageUrl}
              alt="Cleaned Floorplan"
              style={{ maxWidth: "100%" }}
            />
            <br />
            <a href={resultImageUrl} download="cleaned-floorplan.png">
              <button style={{ marginTop: "10px" }}>Download Image</button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorplanCleaner;
