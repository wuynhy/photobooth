import React, { useRef, useState, useEffect } from "react";

const max_photos = 4;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  const videoRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [sessionRunning, setSessionRunning] = useState(false);
  const frames = ["/frame1.png", "frame2.png", "/frame3.png"];
  const [frame, setFrame] = useState(0);

  const changeFrame = () => {
    setFrame((prev) => (prev + 1) % frames.length);
  };

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

  const startCaptureSequence = async () => {
    if (sessionRunning) return;
    if (!streaming) await startCamera();
    await sleep(500);
    setSessionRunning(true);
    setPhotos([]);

    for (let i = 0; i < max_photos; i++) {
      for (let j = 3; j > 0; j--) {
        setCountdown(j);
        await sleep(1000);
      }
      setCountdown(null);
      capturePhoto();
      await sleep(500);
    }
    setSessionRunning(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/png");
    setPhotos((prevPhotos) => [...prevPhotos, dataUrl]);
  };

  return (
    <div className={"app-container"}>
      <h1>React Photobooth</h1>
      <div className="camera-container">
        <video ref={videoRef} className="camera-video" />
        {!streaming && (
          <button onClick={startCamera} className="start-camera-button">
            Start Camera
          </button>
        )}
          {countdown && (<div className="countdown-overlay">{countdown}</div>)}
      </div>
      <button disabled={sessionRunning} onClick={startCaptureSequence} className="capture-button">
        {sessionRunning ? "Capturing..." : "Start Capture"}
      </button>
      <canvas ref={captureCanvasRef} style={{ display: "none" }} />
      <div className="photos-container">
        {photos.map((photo, index) => (
          <div key={index} className="photo-wrapper">
            <img src={photo} className="captured-photo" alt={`Captured ${index + 1}`} />     
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
