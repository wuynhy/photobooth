import React, { useRef, useState, useEffect } from "react";
import frame1 from "./assets/frame1.png";
import frame2 from "./assets/frame2.png";
import frame3 from "./assets/frame3.png";

const frames = [frame1, frame2, frame3];

const max_photos = 4;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  const videoRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [shutter, setShutter] = useState(false);
  const [sessionRunning, setSessionRunning] = useState(false);
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
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  useEffect(() => {
    if (!streaming) {
      startCamera();
    }
  }, [streaming]);

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
      setShutter(true);
      await sleep(100);
      setShutter(false);
      await sleep(300);
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
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/png");
    setPhotos((prevPhotos) => [...prevPhotos, dataUrl]);
  };

  const downloadPhotos = async () => {
    if (photos.length !== max_photos) return;

    const frameImage = new Image();
    frameImage.src = frames[frame];
    await new Promise((resolve) => (frameImage.onload = resolve));

    const width = frameImage.width;
    const height = frameImage.height;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(frameImage, 0, 0, width, height);

    const slotWidth = width * 0.55 / 0.7;
    const slotHeight = height * 0.2;
    const slotX = width * 0.09;
    const slotYs = [height * 0.05, height * 0.265, height * 0.48, height * 0.7];
    
    for (let i = 0; i < max_photos; i++) {
      const photoImage = new Image();
      photoImage.src = photos[i];
      await new Promise((resolve) => (photoImage.onload = resolve));
      ctx.drawImage(photoImage, slotX, slotYs[i], slotWidth, slotHeight);
    }

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "photobooth.png";
    a.click();
  };

  return (
    <div className={"app-container"}>
      <div className={"animated"}>
        <h1>photobooth</h1>
      </div>
      <div className={"main-content"}>
      <div className="camera-container">
        <video ref={videoRef} style={{ transform: "scaleX(-1)" }} className="camera-video" />
        {countdown && (<div className="countdown-overlay">{countdown}</div>)}
        {shutter && (<div className="shutter-overlay" />)}
      <button disabled={sessionRunning} onClick={startCaptureSequence} className="capture-button">
        {sessionRunning ? "smile :)" : "Start Capture"}
      </button>
      </div>
      <canvas ref={captureCanvasRef} style={{ display: "none" }} />
      <div className={"buttons-container"}>
        <button onClick={changeFrame} className="change-frame-button">Change Frame</button>
        {photos.length === max_photos && (
          <button onClick={downloadPhotos} className="download-button">Download Photos</button>
        )}
      </div>
      <div className="photos-container">
      <div className="frame-container">
        <img src={frames[frame]} alt="Frame" className="frame-image" />
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className={`photo-slot photo-slot-${index}`}>
            {photos[index] && <img src={photos[index]} alt={`Photo ${index + 1}`} className="photo-image" />}
          </div>
        ))}
      </div>
      </div>
      </div>
    </div>
  );
}

export default App;
