// Speech utility — uses ElevenLabs (via the secure-proxy Edge Function) for
// high-quality TTS. Falls back to browser speechSynthesis on failure.
import { invokeProxy } from '@/api/supabaseClient';

const langMap = { en: 'en-US', es: 'es-ES', vi: 'vi-VN' };

// Single shared audio element. Reusing one element improves mobile behavior
// and allows a new speakText call to replace the previous one cleanly.
let currentAudio = null;

function stopCurrentAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.removeAttribute('src');
      currentAudio.load();
    } catch (_) { /* ignore */ }
    currentAudio = null;
  }
}

// Simple in-memory cache keyed by text+gender so repeated lines don't re-hit the API.
const ttsCache = new Map();
function cacheKey(text, gender) {
  return `${gender}::${text}`;
}

async function fetchElevenLabsUrl(text, gender) {
  const key = cacheKey(text, gender);
  if (ttsCache.has(key)) return ttsCache.get(key);

  const data = await invokeProxy('eleven_tts', { text, gender });
  if (!data || !data.file_url) {
    throw new Error('TTS: no file_url in response');
  }
  ttsCache.set(key, data.file_url);
  // Cap cache size
  if (ttsCache.size > 50) {
    const firstKey = ttsCache.keys().next().value;
    ttsCache.delete(firstKey);
  }
  return data.file_url;
}

async function speakWithElevenLabs(text, gender, rate, onEnd) {
  const url = await fetchElevenLabsUrl(text, gender);

  // Create a fresh Audio element each time — simpler and reliable on mobile.
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = url;
  audio.playbackRate = rate || 1;
  currentAudio = audio;

  const cleanup = () => {
    if (currentAudio === audio) currentAudio = null;
    if (onEnd) onEnd();
  };
  audio.onended = cleanup;
  audio.onerror = cleanup;

  await audio.play();
}

function speakWithBrowser(text, lang, rate, onEnd) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langMap[lang] || 'en-US';
  utterance.rate = rate || 1;
  utterance.volume = 1;
  utterance.onend = () => { if (onEnd) onEnd(); };
  utterance.onerror = () => { if (onEnd) onEnd(); };
  window.speechSynthesis.speak(utterance);
}

export function speakText(text, lang = 'en', gender = 'male', rate = 1, onEnd = null) {
  if (!text || typeof text !== 'string') {
    if (onEnd) onEnd();
    return;
  }

  // Cancel any in-progress audio from previous calls
  stopCurrentAudio();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  speakWithElevenLabs(text, gender, rate, onEnd).catch((err) => {
    console.warn('ElevenLabs TTS failed, falling back to browser voice:', err?.message || err);
    speakWithBrowser(text, lang, rate, onEnd);
  });
}

export function cancelSpeech() {
  stopCurrentAudio();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}