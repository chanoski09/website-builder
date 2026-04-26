import { useState, useEffect } from 'react';
import { Volume2, Loader2, Heart } from 'lucide-react';
import { speakText } from '@/lib/useSpeech';
import { useLanguage } from '@/lib/useLanguage';
import { useFavorites } from '@/lib/useFavorites';

export default function FlipCard({ question, answer, questionData, questionNum = 0, total = 0, onKnow, onDontKnow }) {
  const [flipped, setFlipped] = useState(false);
  const [translatedAnswer, setTranslatedAnswer] = useState(null);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const { translatedLang, getTranslatedAnswer } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = questionData ? isFavorite(questionData.number) : false;

  const handleFav = (e) => {
    e.stopPropagation();
    if (questionData) toggleFavorite(questionData.number);
  };

  const voiceGender = localStorage.getItem('civics_voice_gender') || 'male';
  const voiceSpeed = parseFloat(localStorage.getItem('civics_voice_speed')) || 1;

  useEffect(() => {
    setTranslatedAnswer(null);
    if (translatedLang !== 'en' && questionData) {
      setLoadingTranslation(true);
      getTranslatedAnswer(questionData).then(t => {
        setTranslatedAnswer(t);
        setLoadingTranslation(false);
      });
    }
  }, [questionData, translatedLang]);

  const speak = (text, e) => {
    e.stopPropagation();
    speakText(text, 'en', voiceGender, voiceSpeed);
  };

  const handleAction = (e, action) => {
    e.stopPropagation();
    action();
    setFlipped(false);
  };

  if (!question) return null;

  return (
    <div className="flex flex-col items-center gap-6 w-full px-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between w-full">
        <span className="text-sm text-muted-foreground font-medium">
          Question {questionNum} of {total}
        </span>
        <div className="flex gap-1">
          {total > 0 && Array.from({ length: Math.min(total, 10) }, (_, i) => i).map((i) => (
            <div
              key={i}
              className={`h-1.5 w-5 rounded-full transition-colors ${
                i < questionNum ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Flip Card */}
      <div
        className="flip-card w-full cursor-pointer select-none"
        style={{ height: translatedLang !== 'en' ? '360px' : '320px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <div className={`flip-card-inner w-full h-full ${flipped ? 'flipped' : ''}`}>
          {/* Front - Question */}
          <div className="flip-card-front w-full h-full">
            <div className="w-full h-full bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  Question
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleFav}
                    className={`p-2 rounded-full transition-colors ${favorited ? 'text-red-500 hover:bg-red-50' : 'text-muted-foreground hover:bg-muted hover:text-red-500'}`}
                    aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className="w-5 h-5" fill={favorited ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => speak(question, e)}
                    className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-xl font-bold text-foreground leading-relaxed text-center px-2">
                {question}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Tap to reveal answer
              </p>
            </div>
          </div>

          {/* Back - Answer */}
          <div className="flip-card-back w-full h-full">
            <div className="w-full h-full bg-primary/5 border-2 border-primary/20 rounded-2xl shadow-sm p-6 flex flex-col justify-between overflow-y-auto">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  Answer
                </span>
                <button
                  onClick={(e) => speak(answer, e)}
                  className="p-2 rounded-full hover:bg-primary/10 transition-colors text-primary"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-3">
                <p className="text-xl font-bold text-foreground leading-relaxed text-center px-2">
                  {answer}
                </p>
                {translatedLang !== 'en' && (
                  <div className="bg-white/60 dark:bg-white/10 rounded-xl px-3 py-2 text-center">
                    {loadingTranslation ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Translating...</span>
                      </div>
                    ) : translatedAnswer ? (
                      <p className="text-sm text-primary/80 italic">{translatedAnswer}</p>
                    ) : null}
                  </div>
                )}
              </div>
              <p className="text-xs text-primary/60 text-center">
                How did you do?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex gap-4 w-full transition-all duration-300 ${flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button
          onClick={(e) => handleAction(e, onDontKnow)}
          className="flex-1 py-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 font-bold text-base hover:bg-red-100 transition-all active:scale-95"
        >
          😅 Still learning
        </button>
        <button
          onClick={(e) => handleAction(e, onKnow)}
          className="flex-1 py-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-base hover:bg-emerald-100 transition-all active:scale-95"
        >
          ✅ Got it!
        </button>
      </div>
    </div>
  );
}