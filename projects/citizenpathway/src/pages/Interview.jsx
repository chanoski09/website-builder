import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Mic, MicOff, Shield, RotateCcw, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { invokeProxy, supabase } from '@/api/supabaseClient';
import MessageBubble from '@/components/interview/MessageBubble';
import PaywallModal from '@/components/PaywallModal';
import { useFreeLimit } from '@/lib/usePremium';
import { speakText, cancelSpeech } from '@/lib/useSpeech';
import { useAudioRecorder } from '@/lib/useAudioRecorder';

export default function Interview() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [phase, setPhase] = useState('intro'); // intro | resume | active
  const [lastConvId, setLastConvId] = useState(() => localStorage.getItem('civics_interview_conv_id') || null);
  const { recording: listening, processing: transcribing, start: startRec, stopAndTranscribe, cancel: cancelRec } = useAudioRecorder();
  const bottomRef = useRef(null);
  const unsubRef = useRef(null);
  const spokenIdsRef = useRef(new Set());
  const [paywallOpen, setPaywallOpen] = useState(false);
  const { isPremium, count, limit, bump } = useFreeLimit('interview');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Speak the latest assistant message aloud (only once per message)
    const last = messages[messages.length - 1];
    if (last && last.role === 'assistant' && last.content) {
      const key = `${messages.length - 1}:${last.content.length}`;
      if (!spokenIdsRef.current.has(key)) {
        spokenIdsRef.current.add(key);
        const voiceGender = localStorage.getItem('civics_voice_gender') || 'male';
        const voiceSpeed = parseFloat(localStorage.getItem('civics_voice_speed')) || 1;
        // Strip markdown for cleaner speech
        const clean = last.content.replace(/[*_`#>]/g, '').replace(/\s+/g, ' ').trim();
        speakText(clean, 'en', voiceGender, voiceSpeed);
      }
    }
  }, [messages]);

  // Check for existing conversation
  useEffect(() => {
    if (lastConvId) {
      setPhase('resume');
    }
  }, []);

  const subscribeToConv = (conv) => {
    if (unsubRef.current) unsubRef.current();
    const channel = supabase
      .channel(`agent_conv_${conv.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agent_messages', filter: `conversation_id=eq.${conv.id}` },
        async () => {
          // Re-fetch the full conversation on each change
          try {
            const fresh = await invokeProxy('agent_get', { id: conv.id });
            setMessages(fresh?.messages || []);
          } catch {/* ignore */}
        },
      )
      .subscribe();
    unsubRef.current = () => supabase.removeChannel(channel);
  };

  const resumeInterview = async () => {
    setPhase('active');
    const conv = await invokeProxy('agent_get', { id: lastConvId });
    setConversation(conv);
    setMessages(conv?.messages || []);
    subscribeToConv(conv);
  };

  const startNewInterview = async () => {
    setPhase('active');
    const conv = await invokeProxy('agent_create', {
      agent_name: 'citizenship_interviewer',
      metadata: { name: 'Citizenship Interview' },
    });
    setConversation(conv);
    localStorage.setItem('civics_interview_conv_id', conv.id);
    setLastConvId(conv.id);
    subscribeToConv(conv);

    await invokeProxy('agent_add_message', {
      conversation_id: conv.id,
      message: { role: 'user', content: "I'm ready to begin my citizenship interview." },
    });
  };

  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
      cancelSpeech();
      cancelRec();
    };
  }, [cancelRec]);

  const sendMessage = async () => {
    if (!input.trim() || sending || !conversation) return;
    // Enforce free-tier limit
    if (!isPremium) {
      const n = bump();
      if (n > limit) {
        setPaywallOpen(true);
        return;
      }
    }
    const text = input.trim();
    setInput('');
    setSending(true);
    await invokeProxy('agent_add_message', {
      conversation_id: conversation.id,
      message: { role: 'user', content: text },
    });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startListening = async () => {
    // Stop any ongoing speech so mic can hear clearly
    cancelSpeech();
    try {
      await startRec();
    } catch (err) {
      if (err?.name === 'NotAllowedError' || /denied/i.test(err?.message || '')) {
        alert('Microphone permission denied. Please enable it in your device settings and try again.');
      } else {
        alert('Could not start the microphone. Please type your answer instead.');
      }
    }
  };

  const stopListening = async () => {
    const text = await stopAndTranscribe('en');
    if (text) setInput((prev) => prev ? `${prev} ${text}` : text);
  };

  // Intro screen
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-6">
        <Link to="/" className="absolute top-6 left-4 p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
          <Shield className="w-10 h-10 text-primary" />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-foreground">Mock Interview</h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Practice with AI Officer Rivera — a realistic USCIS naturalization interview simulation.
            Answer 12 out of 20 civics questions correctly to pass.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 w-full text-sm text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">What to expect</p>
          <div className="flex items-start gap-2"><span>🎯</span><span>20 civics questions drawn from the official 2025 USCIS test bank</span></div>
          <div className="flex items-start gap-2"><span>✅</span><span>Pass by answering 12 correctly</span></div>
          <div className="flex items-start gap-2"><span>🎤</span><span>Type or use your microphone to answer</span></div>
          <div className="flex items-start gap-2"><span>🤝</span><span>Realistic officer tone with immediate feedback</span></div>
        </div>

        <button
          onClick={startNewInterview}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:bg-primary/90 transition-all active:scale-95 shadow-md"
        >
          Begin Interview
        </button>
      </div>
    );
  }

  // Resume screen
  if (phase === 'resume') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-6 text-center">
        <Link to="/" className="absolute top-6 left-4 p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Interview in progress</h2>
          <p className="text-muted-foreground mt-1 text-sm">You have an unfinished interview. Would you like to continue?</p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button onClick={resumeInterview} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base active:scale-95 transition-all">
            Continue Interview
          </button>
          <button onClick={() => { localStorage.removeItem('civics_interview_conv_id'); setLastConvId(null); startNewInterview(); }} className="w-full py-4 rounded-2xl bg-muted text-muted-foreground font-semibold active:scale-95 transition-all flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Start New Interview
          </button>
        </div>
      </div>
    );
  }

  const visibleMessages = messages.filter(m => !(m.role === 'user' && m.content === "I'm ready to begin my citizenship interview."));

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-8 py-4 border-b border-border bg-card sticky top-0 z-10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Link to="/" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">Officer Rivera</p>
          <p className="text-xs text-muted-foreground">USCIS Interview Simulation</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 flex flex-col gap-4 md:gap-5 md:max-w-3xl md:mx-auto md:w-full"
        style={{ paddingBottom: 'calc(240px + env(safe-area-inset-bottom))' }}
      >
        {visibleMessages.length === 0 && (
          <div className="flex justify-center items-center h-32">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        {visibleMessages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Listening indicator banner */}
      {listening && (
        <div
          className="fixed left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-3xl lg:max-w-5xl px-4 md:px-8 z-20 pointer-events-none"
          style={{ bottom: 'calc(220px + env(safe-area-inset-bottom))' }}
        >
          <div className="bg-red-500 text-white rounded-xl px-4 py-2 shadow-lg flex items-center gap-2 justify-center animate-pulse">
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite] h-2" />
              <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.1s] h-4" />
              <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.2s] h-3" />
              <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.3s] h-4" />
              <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.4s] h-2" />
            </div>
            <span className="text-xs font-bold">Listening… speak now</span>
          </div>
        </div>
      )}

      {/* Free tier indicator */}
      {!isPremium && (
        <div
          className="fixed left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-3xl lg:max-w-5xl px-4 md:px-8 z-10 pointer-events-none"
          style={{ bottom: 'calc(220px + env(safe-area-inset-bottom))' }}
        >
          {!listening && (
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-1.5 text-center pointer-events-auto">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                Free tier: {Math.min(count, limit)} / {limit} messages · <button onClick={() => setPaywallOpen(true)} className="underline font-bold">Go Pro</button>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Input — sits above the bottom navigation bar */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-3xl lg:max-w-5xl bg-background border-t border-border px-4 md:px-8 py-3 md:py-4 space-y-2 z-30"
        style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))' }}
      >
        {/* Big Tap to Talk button */}
        <button
          onClick={listening ? stopListening : startListening}
          disabled={transcribing}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-70 ${
            listening
              ? 'bg-red-500 text-white mic-active'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {transcribing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Transcribing…
            </>
          ) : listening ? (
            <>
              <MicOff className="w-5 h-5" /> Tap to Stop
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" /> Tap to Talk
            </>
          )}
        </button>

        {/* Text input fallback */}
        <div className="flex gap-2 items-end md:max-w-3xl md:mx-auto md:w-full">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={listening ? 'Listening…' : 'Or type your answer...'}
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/30 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="p-3 rounded-xl bg-primary text-primary-foreground flex-shrink-0 disabled:opacity-40 hover:bg-primary/90 transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} trigger="limit" />
    </div>
  );
}