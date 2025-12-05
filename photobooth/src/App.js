import React, { use } from "react";
import { useRef, useState, useEffect } from "react";

const max_photos = 4;
const slot_aspect_ratio = 16 / 9;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  const videoRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);

  const startCamera = async () => {
    try { 
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div classname={"app-container"}>
      <h1>React Photobooth</h1>
      <div className="camera-container">
        <video ref={videoRef} className="camera-video" />
        {!streaming && (
          <button onClick={startCamera} className="start-camera-button">
            Start Camera
          </button>
        )}
        {streaming && (
          <button onClick={stopCamera} className="stop-camera-button">
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
