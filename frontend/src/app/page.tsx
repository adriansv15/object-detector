'use client'

import CameraStream from "./ui/CameraStream";
import ImageUploader from "./ui/ImageUploader";
import React, { useState } from "react";

export default function Home() {
  const [showCamera, setShowCamera] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <ImageUploader />

      {/* Toggle Button */}
      <button 
        onClick={() => setShowCamera(!showCamera)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {showCamera ? "Turn Camera Off" : "Turn Camera On"}
      </button>

      {/* Conditional Rendering */}
      {showCamera && (
        <div className="w-full max-w-md border-4 border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <CameraStream />
        </div>
      )}
    </main>
  );
}

