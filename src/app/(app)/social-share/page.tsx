"use client";
import React, { useEffect, useRef, useState } from "react";
import { CldImage } from "next-cloudinary";

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
};

type SocialFormat = keyof typeof socialFormats;

function SocialShare() {
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [selectedFormate, setSelectedFormate] = useState<SocialFormat>(
    "Instagram Square (1:1)"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const imgageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (uploadImage) {
      setIsTransforming(true);
    }
  }, [selectedFormate, uploadImage]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData(); // Corrected typo here
    formData.append("file", file); // Use formData
    try {
      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData, // Corrected typo here
      });
      // console.log("bhai ye response h",response)
      if (!response.ok) {
        throw new Error("Error uploading image");
      }
      const data = await response.json();
      console.log("data", data);
      console.log("dataid", data.public_id);
      setUploadImage(data.public_id);
    } catch (error) {
      console.error("Error uploading image", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!imgageRef.current) {
      return;
    }

    fetch(imgageRef.current.src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${selectedFormate.replace(
          /\s+/g,
          "_".toLowerCase()
        )}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      });
  };
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Social Media Image Creator
      </h1>

      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload an Image</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Choose an image file</span>
            </label>
            <input
              type="file"
              onChange={handleImageUpload}
              className="file-input file-input-bordered file-input-primary w-full"
            />
          </div>

          {isUploading && (
            <div className="mt-4">
              <progress className="progress progress-primary w-full"></progress>
            </div>
          )}

          {uploadImage && (
            <div className="mt-6">
              <h2 className="card-title mb-4">Select Social Media Format</h2>
              <div className="form-control">
                <select
                  className="select select-bordered w-full"
                  value={selectedFormate}
                  onChange={(e) =>
                    setSelectedFormate(e.target.value as SocialFormat)
                  }
                >
                  {Object.keys(socialFormats).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 relative">
                <h3 className="text-lg font-semibold mb-2">Preview:</h3>
                <div className="flex justify-center">
                  {isTransforming && (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  )}
                  <CldImage
                    width={socialFormats[selectedFormate].width}
                    height={socialFormats[selectedFormate].height}
                    src={uploadImage}
                    sizes="100vw"
                    alt="transformed image"
                    crop="fill"
                    aspectRatio={socialFormats[selectedFormate].aspectRatio}
                    gravity="auto"
                    ref={imgageRef}
                    onLoad={() => setIsTransforming(false)}
                  />
                </div>
              </div>
              <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary" onClick={handleDownload}>
                  Download for {selectedFormate}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SocialShare;
