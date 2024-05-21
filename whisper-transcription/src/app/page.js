"use client";

import { useState, useEffect } from 'react';

export default function Home() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordingIndicator, setRecordingIndicator] = useState(false);

    let audioChunks = [];

    useEffect(() => {
        const savedApiKey = localStorage.getItem('apiKey');
        if (savedApiKey) {
            setApiKey(savedApiKey);
        }
    }, []);

    const handleRecord = () => {
        if (!isRecording) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const recorder = new MediaRecorder(stream);
                    recorder.start();
                    setIsRecording(true);
                    setRecordingIndicator(true);
                    setMediaRecorder(recorder);

                    recorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };

                    recorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        const url = URL.createObjectURL(audioBlob);
                        setAudioUrl(url);
                        console.log('Audio Blob:', audioBlob); // Debugging statement
                        sendAudioToWhisper(audioBlob);
                        setIsRecording(false);
                        setRecordingIndicator(false);
                        audioChunks = []; // Reset audio chunks after recording is stopped
                    };
                });
        } else {
            mediaRecorder.stop();
        }
    };

    const sendAudioToWhisper = async (audioBlob) => {
        const formData = new FormData();
        formData.append('file', audioBlob);
        formData.append('model', 'whisper-1');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            body: formData
        });

        const data = await response.json();
        console.log('API Response:', data); // Debugging statement
        setTranscription(data.text);
    };

    const handleApiKeyChange = (e) => {
        const newApiKey = e.target.value;
        setApiKey(newApiKey);
        localStorage.setItem('apiKey', newApiKey);
    };

    return (
        <div className="container">
            <h1>Audio to Text Transcription</h1>
            <button onClick={handleRecord}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <input
                type="text"
                placeholder="Enter your OpenAI API Key"
                value={apiKey}
                onChange={handleApiKeyChange}
            />
            {recordingIndicator && <div className="recording-indicator">Recording...</div>}
            {audioUrl && <audio src={audioUrl} controls />}
            <p>{transcription}</p>
        </div>
    );
}
