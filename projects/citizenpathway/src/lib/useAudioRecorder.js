import { useRef, useState, useCallback } from 'react';
import { uploadFile, invokeProxy } from '@/api/supabaseClient';

// Decode any recorded audio blob (webm/ogg/mp4) and re-encode as 16-bit PCM WAV.
// Needed because UploadFile only accepts common audio types like wav/mp3/m4a.
async function blobToWav(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
  ctx.close?.();

  const numChannels = 1; // mono is enough for speech
  const sampleRate = audioBuffer.sampleRate;
  const samples = audioBuffer.getChannelData(0);
  const length = samples.length;

  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);
  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Reliable cross-device audio recorder using MediaRecorder API.
 * Records → uploads → transcribes via backend function.
 * Works consistently on mobile WebViews where SpeechRecognition fails.
 */
export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone access is not supported on this device.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    // Pick the best supported format — webm/opus is widely supported; mp4 for iOS Safari.
    const mimeCandidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      ''
    ];
    const mimeType = mimeCandidates.find(m => !m || MediaRecorder.isTypeSupported(m)) || '';
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  }, []);

  const stopAndTranscribe = useCallback(async (language = 'en') => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return '';

    const blob = await new Promise((resolve) => {
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm';
        resolve(new Blob(chunksRef.current, { type }));
      };
      recorder.stop();
    });

    // Release mic
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setRecording(false);

    if (!blob || blob.size < 500) {
      // Too short / silent
      return '';
    }

    setProcessing(true);
    try {
      // Convert to WAV (UploadFile rejects webm/ogg) using Web Audio API
      const wavBlob = await blobToWav(blob);
      const file = new File([wavBlob], `recording.wav`, { type: 'audio/wav' });

      const { file_url } = await uploadFile({ file, bucket: 'uploads' });
      const data = await invokeProxy('transcribe_audio', { file_url, language });
      return (data?.transcript || '').trim();
    } finally {
      setProcessing(false);
    }
  }, []);

  const cancel = useCallback(() => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {}
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setRecording(false);
    setProcessing(false);
  }, []);

  return { recording, processing, start, stopAndTranscribe, cancel };
}