"use client";

import { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import axios from "axios";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "");

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    mediaBlob,
  } = useReactMediaRecorder({ audio: true });

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem("apiKey", newApiKey);
  };

  const handleUpload = async () => {
    if (!mediaBlob) {
      alert("Please record something first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", mediaBlob, "recording.wav");
    formData.append("apiKey", apiKey);

    try {
      const response = await axios.post("/api/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setTranscript(response.data.text);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Audio to Text Transcription</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter your OpenAI API Key"
          value={apiKey}
          onChange={handleApiKeyChange}
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <button onClick={startRecording} className="bg-blue-500 text-white p-2 mr-2">
          Start Recording
        </button>
        <button onClick={stopRecording} className="bg-red-500 text-white p-2">
          Stop Recording
        </button>
      </div>
      {mediaBlobUrl && (
        <div className="mb-4">
          <audio src={mediaBlobUrl} controls />
        </div>
      )}
      <button onClick={handleUpload} className="bg-green-500 text-white p-2">
        Upload and Transcribe
      </button>
      {transcript && (
        <div className="mt-4 p-4 border">
          <h2 className="text-lg font-bold">Transcript</h2>
          <p>{transcript}</p>
        </div>
      )}
      <p>Status: {status}</p>
    </div>
  );
}
