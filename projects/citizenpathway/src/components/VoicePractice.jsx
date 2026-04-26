import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, RotateCcw, ChevronRight, Loader2 } from 'lucide-react';
import { invokeProxy } from '@/api/supabaseClient';
import { speakText, cancelSpeech } from '@/lib/useSpeech';
import { useAudioRecorder } from '@/lib/useAudioRecorder';

export default function VoicePractice({ question, answer, questionNum = 0, total = 0, onNext, language = 'en' }) {
  const [phase, setPhase] = useState('ready');
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null);
  const { recording, processing, start, stopAndTranscribe, cancel } = useAudioRecorder();

  const voiceGender = localStorage.getItem('civics_voice_gender') || 'male';
  const voiceSpeed = parseFloat(localStorage.getItem('civics_voice_speed')) || 1;

  const speak = (text, onEnd) => {
    speakText(text, language, voiceGender, voiceSpeed, onEnd);
  };

  const startListening = async () => {
    // Stop ongoing speech so mic can hear clearly
    cancelSpeech();
    try {
      setTranscript('');
      setFeedback(null);
      await start();
      setPhase('listening');
    } catch (err) {
      setPhase('ready');
      if (err?.name === 'NotAllowedError' || /denied/i.test(err?.message || '')) {
        alert('Microphone permission denied. Please enable it in your device settings and try again.');
      } else {
        alert('Could not start the microphone. Please try again.');
      }
    }
  };

  const stopListening = async () => {
    setPhase('evaluating');
    const text = await stopAndTranscribe(language);
    setTranscript(text);
    if (!text) {
      setPhase('ready');
      alert("I didn't catch that. Please try again and speak clearly.");
      return;
    }
    evaluateAnswer(text);
  };

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  const evaluateAnswer = async (userAnswer) => {
    const prompt = `You are evaluating a U.S. citizenship test answer. 
      
Question: "${question}"
Correct answer: "${answer}"
User's spoken answer: "${userAnswer}"

Evaluate if the user's answer is correct or acceptable. Be lenient - partial answers, different word order, or synonyms should be accepted. 
For names, the last name alone is acceptable.

Respond in JSON with:
- correct: true or false
- message: a detailed, encouraging message (2-3 sentences) that explains WHY the answer is correct or incorrect
- hint: if incorrect, provide a memorable tip or mnemonic to help remember the correct answer
- pronunciation_tip: if the spoken answer had any unclear or mispronounced words, provide a brief pronunciation suggestion (otherwise null)
- deeper_context: a one-sentence interesting historical or civic fact related to this question to deepen understanding`;

    const schema = {
      type: "object",
      properties: {
        correct: { type: "boolean" },
        message: { type: "string" },
        hint: { type: "string" },
        pronunciation_tip: { type: "string" },
        deeper_context: { type: "string" }
      }
    };

    const result = await invokeProxy('invoke_llm', {
      prompt,
      response_json_schema: schema,
      model: 'claude_sonnet_4_6'
    });

    setFeedback(result);
    setPhase('result');

    setTimeout(() => {
      speak(result.message, () => {
        if (!result.correct) {
          setTimeout(() => speak(answer), 500);
        }
      });
    }, 300);
  };

  const handleReadQuestion = () => {
    speak(question);
  };

  const retry = () => {
    setPhase('ready');
    setTranscript('');
    setFeedback(null);
  };

  if (!question) return null;

  return (
    <div className="flex flex-col gap-5 w-full px-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">
          Question {questionNum} of {total}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(total || 0, 10) }).map((_, i) => (
            <div key={i} className={`h-1.5 w-5 rounded-full transition-colors ${i < questionNum ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-bold text-foreground leading-relaxed flex-1">{question}</p>
          <button
            onClick={handleReadQuestion}
            className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mic Area */}
      <div className="flex flex-col items-center gap-4 py-4">
        {phase === 'ready' && (
          <>
            <p className="text-sm text-muted-foreground text-center">
              Listen to the question, then tap the mic and speak your answer
            </p>
            <button
              onClick={startListening}
              className="w-20 h-20 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center active:scale-95"
            >
              <Mic className="w-8 h-8" />
            </button>
            <p className="text-xs text-muted-foreground">Tap to speak</p>
          </>
        )}

        {phase === 'listening' && (
          <>
            <p className="text-sm font-semibold text-primary text-center animate-pulse">
              🎤 Listening...
            </p>
            <button
              onClick={stopListening}
              className="w-20 h-20 rounded-full bg-red-500 text-white shadow-lg mic-active flex items-center justify-center active:scale-95"
            >
              <MicOff className="w-8 h-8" />
            </button>
            <p className="text-xs text-muted-foreground">Tap to stop</p>
            {transcript && (
              <div className="bg-muted rounded-xl p-3 w-full text-center">
                <p className="text-sm text-foreground italic">"{transcript}"</p>
              </div>
            )}
          </>
        )}

        {phase === 'evaluating' && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">
              {processing ? 'Transcribing your answer…' : 'Evaluating your answer…'}
            </p>
          </div>
        )}

        {phase === 'result' && feedback && (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Result Badge */}
            <div className={`w-full rounded-2xl p-4 text-center ${feedback.correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-3xl mb-2">{feedback.correct ? '🎉' : '😅'}</p>
              <p className={`font-bold text-base ${feedback.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                {feedback.message}
              </p>
            </div>

            {/* User's answer */}
            {transcript && (
              <div className="bg-muted rounded-xl p-3 w-full">
                <p className="text-xs text-muted-foreground mb-1">You said:</p>
                <p className="text-sm text-foreground italic">"{transcript}"</p>
              </div>
            )}

            {/* Correct answer */}
            {!feedback.correct && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 w-full">
                <p className="text-xs text-primary/70 mb-1">Correct answer:</p>
                <p className="text-sm font-semibold text-foreground">{answer}</p>
                <button
                  onClick={() => speak(answer)}
                  className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Listen again
                </button>
              </div>
            )}

            {/* Premium AI extras */}
            {feedback.pronunciation_tip && (
              <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-3 w-full">
                <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-1">🎙️ Pronunciation Tip</p>
                <p className="text-xs text-violet-600 dark:text-violet-400">{feedback.pronunciation_tip}</p>
              </div>
            )}
            {feedback.deeper_context && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3 w-full">
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">📖 Did You Know?</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">{feedback.deeper_context}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={retry}
                className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-xl bg-muted text-muted-foreground font-semibold hover:bg-muted/70 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> Try again
              </button>
              <button
                onClick={onNext}
                className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all active:scale-95"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}