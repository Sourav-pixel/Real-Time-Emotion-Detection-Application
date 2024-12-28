import React, { useState, useRef } from "react";
import { Camera, SwitchCamera, Settings2, Share2 } from "lucide-react";

const App = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [emotionMessage, setEmotionMessage] = useState(""); // Detected emotions message
  const videoRef = useRef(null);

  const speakEmotion = (emotions: string | null) => {
    const utterance = new SpeechSynthesisUtterance();
    if (emotions === "happy") {
      utterance.text = "You look happy! Keep smiling!";
    } else if (emotions === "sad") {
      utterance.text = "Why are you sad? Cheer up!";
    } else if (emotions === "surprise") {
      utterance.text = "You look surprised! What happened?";
    } else if (emotions === "fear") {
      utterance.text = "Why are you afraid?";
    } else if (emotions === "angry") {
      utterance.text = "Why are you angry?";
    } else {
      utterance.text = "I can't detect your emotion right now.";
    }
    window.speechSynthesis.speak(utterance);
  };

  const captureImage = async () => {
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.width || 640;
      canvas.height = video.height || 480;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.8)
      );

      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

      const response = await fetch("http://127.0.0.1:5000/detect_emotion", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch emotion data");
      }

      const result = await response.json();
      console.log("Emotions result:", result.emotions);

      if (Array.isArray(result.emotions)) {
        const emotionNames = result.emotions
          .map((emotions: any) =>
            typeof emotions === "object" ? emotions.emotion : emotions
          )
          .filter((e) => e); // Remove any undefined or null values

        if (emotionNames.length > 0) {
          setEmotionMessage(`Detected Emotions: ${emotionNames.join(", ")}`);
          speakEmotion(emotionNames[0]); // Speak the first detected emotion
        } else {
          setEmotionMessage("No emotions detected.");
          speakEmotion(null);
        }
      } else {
        setEmotionMessage("Invalid emotion data format received.");
        speakEmotion(null);
      }
    } catch (error) {
      console.error("Error detecting emotion:", error);
      setEmotionMessage("Failed to detect emotion. Please try again.");
      speakEmotion(null);
    }

    setIsCapturing(false);
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <Settings2 className="w-6 h-6" />
        <h1 className="text-lg font-semibold">Real-Time Emotion Detection</h1>
        <Share2 className="w-6 h-6" />
      </div>

      {/* Camera View */}
      <div className="relative">
        <div className="aspect-[3/4] w-full max-w-2xl mx-auto bg-gray-900 rounded-lg overflow-hidden">
          <img
            ref={videoRef}
            src="http://127.0.0.1:5000/video_feed"
            alt="Emotion Detection Video Feed"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>

        {/* Status Indicator */}
        <div className="absolute top-4 left-4 bg-black/50 rounded-lg px-3 py-1">
          <span className="text-sm">
            {isCapturing ? "Capturing..." : "Live Feed"}
          </span>
        </div>
      </div>

      {/* Emotion Message */}
      {emotionMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg">
          {emotionMessage}
        </div>
      )}

      {/* Camera Controls */}
      <div className="fixed bottom-0 left-0 right-0 pb-8 pt-4 bg-gradient-to-t from-black to-transparent">
        <div className="flex justify-center items-center gap-8">
          <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700">
            <SwitchCamera className="w-6 h-6" />
          </button>

          <button
            className="p-6 rounded-full bg-white hover:bg-gray-200 transition-colors"
            onClick={captureImage}
            disabled={isCapturing}
          >
            <Camera className="w-8 h-8 text-black" />
          </button>

          <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700">
            <Settings2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
