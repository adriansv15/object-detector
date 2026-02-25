"use client";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CameraStream() {
  const webcamRef = useRef<Webcam>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [processedImg, setProcessedImg] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initialize WebSocket
    const socket = new WebSocket(`ws://${API_URL}/ws`);
    socketRef.current = socket;

    socket.onopen = () => console.log("✅ WS Connected");
    socket.onmessage = (msg) => setProcessedImg(msg.data);
    socket.onclose = () => console.log("❌ WS Closed");

    // 2. Start the capture loop
    const captureFrame = () => {
      if (
        webcamRef.current && 
        socketRef.current?.readyState === WebSocket.OPEN
      ) {
        // .getScreenshot() only works if screenshotFormat is set on the component!
        const imageSrc = webcamRef.current.getScreenshot();
        
        if (imageSrc) {
          // If this logs, you WILL see green rows in the Network tab
          // console.log("Sending frame..."); 
          socketRef.current.send(imageSrc);
        }
      }
    };

    const intervalId = setInterval(captureFrame, 200); // 5 FPS

    return () => {
      clearInterval(intervalId);
      socket.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full">
        {/* HIDDEN RAW WEBCAM: Required for capturing frames but invisible to user */}
        <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
        <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ width: 640, height: 480 }}
        />
        </div>

        {/* VISIBLE AI OUTPUT: This is what the user actually sees */}
        <div className="w-full max-w-2xl border-gray-800 rounded-2xl overflow-hidden shadow-2xl bg-black">
        {processedImg ? (
            <img 
            src={processedImg} 
            alt="AI Object Detection" 
            className="w-full h-auto aspect-video object-cover rounded-xl shadow-2xl"  
            />
        ) : (
            <div className="flex items-center justify-center h-64 text-white animate-pulse">
            Initializing YOLO Detection...
            </div>
        )}
        </div>
    </div>
    );

}
