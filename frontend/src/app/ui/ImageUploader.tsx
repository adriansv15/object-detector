import React, { useState, ChangeEvent, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ImageUploader: React.FC = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null); // Store actual file data
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (file && file.type.startsWith('image/')) {
      setRawFile(file); // Save for API upload
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    // 1. Stop the click from "bubbling up" to the label and reopening the dialog
    e.stopPropagation();
    e.preventDefault();

    if (preview) URL.revokeObjectURL(preview); 
    setPreview(null);

    // 2. Reset the input's internal value so the SAME file can be picked again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

   const uploadImage = async () => {
    if (!rawFile) return alert("Please select an image first!");

    const formData = new FormData();
    formData.append("file", rawFile); // Matches Python's expected key

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.status === "success") {
        // Replace the local preview with the YOLO-processed image from Python
        setPreview(result.image);
        console.log(`Detected ${result.count} objects.`);
      }
    } catch (error) {
      console.error("Error uploading:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-4">
      <label className="relative flex flex-col items-center justify-center w-full h-auto min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all overflow-hidden p-2">
        {preview ? (
          <div className="relative w-full flex justify-center">
            {/* Image scales naturally while keeping the container tight */}
            <img src={preview} alt="Preview" className="w-full h-auto rounded-lg shadow-md block" />
            <button 
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-md z-10"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mb-2 text-sm text-gray-500 font-semibold">Click to upload image</p>
          </div>
        )}
        <input 
          ref={fileInputRef} // 3. Ensure the ref is attached
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />
        {preview && (
        <button 
          onClick={uploadImage}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upload
        </button>
      )}
      </label>
    </div>
  );
};

export default ImageUploader;
