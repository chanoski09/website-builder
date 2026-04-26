import { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import FlipCard from '@/components/FlipCard';
import { CIVICS_QUESTIONS } from '@/lib/questions-data';
import { useLanguage } from '@/lib/useLanguage';
import MobileSelect from '@/components/MobileSelect';
import PaywallModal from '@/components/PaywallModal';
import { useFreeLimit } from '@/lib/usePremium';
import { useFavorites } from '@/lib/useFavorites';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'American Government', label: '🏛️ Government' },
  { value: 'American History', label: '📜 History' },
  { value: 'Integrated Civics', label: '🗽 Civics' },
];

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'weak', label: '📚 To Learn' },
  { value: 'mastered', label: '✅ Mastered' },
  { value: 'favorites', label: '❤️ Favorites' },
];

export default function Flashcards() {
  const { getQuestion, getAnswer } = useLanguage();
  const [progress, setProgress] = useState({});
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [finished, setFinished] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const { isPremium, count, limit, bump } = useFreeLimit('flashcards');
  const { favorites } = useFavorites();

  // Persisted state
  const [filter, setFilter] = useState(() => localStorage.getItem('civics_flashcard_filter') || 'all');
  const [category, setCategory] = useState(() => localStorage.getItem('civics_flashcard_category') || 'all');
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = parseInt(localStorage.getItem('civics_flashcard_index'));
    return isNaN(saved) ? 0 : saved;
  });
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('civics_progress') || '{}');
    setProgress(saved);
    const savedIndex = parseInt(localStorage.getItem('civics_flashcard_index'));
    if (!isNaN(savedIndex) && savedIndex > 0) {
      setShowResume(true);
    }
  }, []);

  // Persist position
  useEffect(() => {
    localStorage.setItem('civics_flashcard_index', String(currentIndex));
    localStorage.setItem('civics_flashcard_filter', filter);
    localStorage.setItem('civics_flashcard_category', category);
  }, [currentIndex, filter, category]);

  const filteredQuestions = CIVICS_QUESTIONS.filter(q => {
    const p = progress[q.number];
    const filterMatch =
      filter === 'all' ? true :
      filter === 'weak' ? (!p || p.status !== 'mastered') :
      filter === 'favorites' ? favorites.includes(q.number) :
      p?.status === 'mastered';
    const catMatch = category === 'all' || q.category === category;
    return filterMatch && catMatch;
  });

  const safeIndex = filteredQuestions.length > 0 ? Math.min(currentIndex, filteredQuestions.length - 1) : 0;
  const current = filteredQuestions.length > 0 ? filteredQuestions[safeIndex] : null;

  const saveProgress = (questionNum, correct) => {
    const saved = JSON.parse(localStorage.getItem('civics_progress') || '{}');
    const existing = saved[questionNum] || { correct_count: 0, attempt_count: 0, status: 'unseen' };
    const newCorrect = existing.correct_count + (correct ? 1 : 0);
    const newAttempts = existing.attempt_count + 1;
    const newStatus = newCorrect >= 2 ? 'mastered' : newAttempts > 0 ? 'learning' : 'unseen';
    saved[questionNum] = {
      ...existing,
      correct_count: newCorrect,
      attempt_count: newAttempts,
      status: newStatus,
      last_practiced: new Date().toISOString()
    };
    localStorage.setItem('civics_progress', JSON.stringify(saved));
    setProgress(saved);

    if (correct) {
      const streakData = JSON.parse(localStorage.getItem('civics_streak') || '{}');
      streakData.total_xp = (streakData.total_xp || 0) + 10;
      streakData.last_activity_date = new Date().toDateString();
      const lastDate = streakData.last_activity_date_prev;
      const today = new Date().toDateString();
      if (lastDate !== today) {
        streakData.current_streak = (streakData.current_streak || 0) + 1;
        streakData.longest_streak = Math.max(streakData.longest_streak || 0, streakData.current_streak);
        streakData.last_activity_date_prev = today;
      }
      localStorage.setItem('civics_streak', JSON.stringify(streakData));
    }
  };

  const checkLimit = () => {
    if (!isPremium) {
      const n = bump();
      if (n >= limit) {
        setPaywallOpen(true);
        return true;
      }
    }
    return false;
  };

  const handleKnow = () => {
    if (!current) return;
    saveProgress(current.number, true);
    setSessionCorrect(c => c + 1);
    setSessionTotal(t => t + 1);
    if (checkLimit()) return;
    advance();
  };

  const handleDontKnow = () => {
    if (!current) return;
    saveProgress(current.number, false);
    setSessionTotal(t => t + 1);
    if (checkLimit()) return;
    advance();
  };

  const advance = () => {
    if (currentIndex + 1 >= filteredQuestions.length) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const startOver = () => {
    setCurrentIndex(0);
    setSessionCorrect(0);
    setSessionTotal(0);
    setFinished(false);
    setShowResume(false);
  };

  const handleResume = () => {
    setShowResume(false);
  };

  // Resume prompt
  if (showResume && filteredQuestions.length > 0 && currentIndex > 0 && currentIndex < filteredQuestions.length) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-6 text-center">
        <div className="text-5xl">📖</div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Welcome back!</h2>
          <p className="text-muted-foreground mt-1 text-sm">You left off at question {currentIndex + 1} of {filteredQuestions.length}.</p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button onClick={handleResume} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base active:scale-95 transition-all">
            Continue where I left off
          </button>
          <button onClick={startOver} className="w-full py-4 rounded-2xl bg-muted text-muted-foreground font-semibold active:scale-95 transition-all">
            Start over
          </button>
        </div>
      </div>
    );
  }

  if (!current && !finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="text-muted-foreground text-center">No questions found for this filter.</p>
        <button onClick={() => { setFilter('all'); setCategory('all'); setCurrentIndex(0); }} className="text-primary font-semibold">Show all questions</button>
      </div>
    );
  }

  if (finished) {
    const accuracy = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    const masteredTotal = Object.values(progress).filter(p => p.status === 'mastered').length;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
        <div className="text-6xl">{accuracy >= 70 ? '🎉' : '💪'}</div>
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Session Complete!</h2>
          <p className="text-muted-foreground mt-1">Great work today</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-3xl font-extrabold text-primary">{accuracy}%</p>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-3xl font-extrabold text-emerald-600">{sessionCorrect}</p>
            <p className="text-sm text-muted-foreground">Correct</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 col-span-2">
            <p className="text-3xl font-extrabold text-amber-600">{masteredTotal}</p>
            <p className="text-sm text-muted-foreground">Total questions mastered</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button onClick={startOver} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base active:scale-95 transition-all">
            <RotateCcw className="w-5 h-5" /> Study Again
          </button>
          <Link to="/" className="flex items-center justify-center w-full py-4 rounded-2xl bg-muted text-muted-foreground font-semibold transition-all">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 md:py-8 flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Link to="/" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h2 className="text-base md:text-lg font-bold text-foreground">Flashcards</h2>
        <div className="w-9" />
      </div>

      {/* Filters */}
      <div className="px-4 md:px-8 flex flex-col md:flex-row gap-2 md:gap-3 max-w-3xl md:max-w-full w-full mx-auto">
        <div className="flex-1">
          <MobileSelect
            value={filter}
            onValueChange={(val) => { setFilter(val); setCurrentIndex(0); setFinished(false); }}
            options={FILTERS}
            title="Filter Questions"
          />
        </div>
        <div className="flex-1">
          <MobileSelect
            value={category}
            onValueChange={(val) => { setCategory(val); setCurrentIndex(0); setFinished(false); }}
            options={CATEGORIES}
            title="Category"
          />
        </div>
      </div>

      {/* Session Stats */}
      <div className="flex items-center gap-3 px-4 md:px-8 max-w-3xl w-full mx-auto">
        <div className="flex-1 bg-muted rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: filteredQuestions.length > 0 ? `${(currentIndex / filteredQuestions.length) * 100}%` : '0%' }}
          />
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {sessionCorrect} ✅ {sessionTotal - sessionCorrect} ❌
        </span>
      </div>

      {/* Free tier indicator */}
      {!isPremium && (
        <div className="mx-4 md:mx-8 max-w-3xl w-full md:mx-auto bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2 text-center">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            Free tier: {Math.min(count, limit)} / {limit} questions · <button onClick={() => setPaywallOpen(true)} className="underline font-bold">Go Pro</button>
          </p>
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-2xl mx-auto">
      <FlipCard
        question={getQuestion(current)}
        answer={getAnswer(current)}
        questionData={current}
        questionNum={currentIndex + 1}
        total={filteredQuestions.length}
        onKnow={handleKnow}
        onDontKnow={handleDontKnow}
      />
      </div>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} trigger="limit" />
    </div>
  );
}