import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, RotateCcw, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CIVICS_QUESTIONS } from '@/lib/questions-data';
import { useLanguage } from '@/lib/useLanguage';
import { getRandomEncouragement } from '@/lib/encouragement';
import MobileSelect from '@/components/MobileSelect';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'American Government', label: '🏛️ Government' },
  { value: 'American History', label: '📜 History' },
  { value: 'Integrated Civics', label: '🗽 Civics' },
];

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Quiz() {
  const { getQuestion, getAnswer } = useLanguage();
  const [phase, setPhase] = useState('setup'); // setup | active | result
  const [category, setCategory] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // null | 'A' | 'B'
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState([]); // array of { question, correct }
  const [encouragement, setEncouragement] = useState('');
  const [choices, setChoices] = useState([]); // [{label, isCorrect}]

  const translatedLang = localStorage.getItem('civics_translate_lang') || 'en';

  const generateChoices = (question, pool) => {
    const correctAnswer = question.answer_en_alt?.length > 0
      ? question.answer_en_alt[Math.floor(Math.random() * question.answer_en_alt.length)]
      : question.answer_en;
    
    // Pick a wrong answer from another random question's answer
    const otherQuestions = pool.filter(q => q.number !== question.number);
    const wrongQ = otherQuestions[Math.floor(Math.random() * otherQuestions.length)];
    const wrongAnswer = wrongQ.answer_en_alt?.length > 0
      ? wrongQ.answer_en_alt[Math.floor(Math.random() * wrongQ.answer_en_alt.length)]
      : wrongQ.answer_en;

    // Randomize order
    const pair = [
      { label: correctAnswer, isCorrect: true },
      { label: wrongAnswer, isCorrect: false },
    ];
    return Math.random() > 0.5 ? pair : pair.reverse();
  };

  const startQuiz = () => {
    let pool = CIVICS_QUESTIONS;
    if (category !== 'all') {
      pool = pool.filter(q => q.category === category);
    }
    const shuffled = shuffleArray(pool).slice(0, 20);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setResults([]);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setChoices(generateChoices(shuffled[0], pool));
    setPhase('active');
  };

  const handleChoiceSelect = (index) => {
    if (showAnswer) return;
    setSelectedAnswer(index);
    setShowAnswer(true);

    const correct = choices[index].isCorrect;
    const current = questions[currentIndex];
    setResults(prev => [...prev, { question: current, correct }]);

    // Save progress
    const saved = JSON.parse(localStorage.getItem('civics_progress') || '{}');
    const existing = saved[current.number] || { correct_count: 0, attempt_count: 0, status: 'unseen' };
    const newCorrect = existing.correct_count + (correct ? 1 : 0);
    const newAttempts = existing.attempt_count + 1;
    saved[current.number] = {
      ...existing,
      correct_count: newCorrect,
      attempt_count: newAttempts,
      status: newCorrect >= 2 ? 'mastered' : 'learning',
      last_practiced: new Date().toISOString()
    };
    localStorage.setItem('civics_progress', JSON.stringify(saved));

    if (correct) {
      const streakData = JSON.parse(localStorage.getItem('civics_streak') || '{}');
      streakData.total_xp = (streakData.total_xp || 0) + 10;
      const today = new Date().toDateString();
      if (streakData.last_activity_date_prev !== today) {
        streakData.current_streak = (streakData.current_streak || 0) + 1;
        streakData.longest_streak = Math.max(streakData.longest_streak || 0, streakData.current_streak);
        streakData.last_activity_date_prev = today;
      }
      streakData.last_activity_date = today;
      localStorage.setItem('civics_streak', JSON.stringify(streakData));
    }
  };

  const goToNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setEncouragement(getRandomEncouragement(translatedLang));
      setPhase('result');
    } else {
      const nextIndex = currentIndex + 1;
      const pool = category !== 'all' ? CIVICS_QUESTIONS.filter(q => q.category === category) : CIVICS_QUESTIONS;
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setChoices(generateChoices(questions[nextIndex], pool));
    }
  };

  const current = questions[currentIndex];

  // Setup screen
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-6">
        <Link to="/" className="absolute top-6 left-4 p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-5xl">📝</div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-foreground">Quick Quiz</h1>
          <p className="text-muted-foreground mt-2 text-sm">Test yourself with 20 multiple-choice questions!</p>
        </div>

        <div className="w-full">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center">Choose a category</p>
          <MobileSelect value={category} onValueChange={setCategory} options={CATEGORIES} title="Category" />
        </div>

        <button
          onClick={startQuiz}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base active:scale-95 transition-all shadow-md"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  // Result screen
  if (phase === 'result') {
    const correctCount = results.filter(r => r.correct).length;
    const accuracy = Math.round((correctCount / results.length) * 100);
    const passed = correctCount >= 12;

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-5 text-center pb-24">
        <div className="text-6xl">{passed ? '🎉' : '💪'}</div>
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">{passed ? 'You Passed!' : 'Keep Practicing!'}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {correctCount} out of {results.length} correct ({accuracy}%)
          </p>
        </div>

        {/* Encouragement */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 w-full">
          <p className="text-base font-bold text-amber-800 dark:text-amber-300 text-center">
            {encouragement}
          </p>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p className="text-3xl font-extrabold text-emerald-600">{correctCount}</p>
            <p className="text-sm text-emerald-700">Correct</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-3xl font-extrabold text-red-500">{results.length - correctCount}</p>
            <p className="text-sm text-red-600">Incorrect</p>
          </div>
        </div>

        {/* Missed questions */}
        {results.filter(r => !r.correct).length > 0 && (
          <div className="w-full bg-card border border-border rounded-2xl p-4 text-left">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Questions to review</p>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {results.filter(r => !r.correct).map((r, i) => (
                <div key={i} className="text-xs">
                  <p className="font-semibold text-foreground">Q{r.question.number}: {r.question.question_en}</p>
                  <p className="text-primary">A: {r.question.answer_en}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          <button onClick={() => { setPhase('setup'); }} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold active:scale-95 transition-all">
            <RotateCcw className="w-5 h-5" /> Take Another Quiz
          </button>
          <Link to="/" className="flex items-center justify-center w-full py-4 rounded-2xl bg-muted text-muted-foreground font-semibold">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Active quiz
  return (
    <div className="min-h-screen bg-background py-6 md:py-8 flex flex-col gap-4 md:gap-5 pb-24 md:max-w-3xl md:mx-auto md:w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Link to="/" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h2 className="text-base md:text-lg font-bold text-foreground">Quiz</h2>
        <span className="text-xs font-semibold text-muted-foreground">{currentIndex + 1}/{questions.length}</span>
      </div>

      {/* Progress bar */}
      <div className="px-4 md:px-8">
        <div className="bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Score so far */}
      <div className="flex items-center justify-center gap-4 px-4 md:px-8">
        <span className="text-xs font-semibold text-emerald-600">✅ {results.filter(r => r.correct).length}</span>
        <span className="text-xs font-semibold text-red-500">❌ {results.filter(r => !r.correct).length}</span>
      </div>

      {/* Question */}
      <div className="mx-4 md:mx-8 bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3 inline-block">
          Q{current?.number}
        </span>
        <p className="text-lg font-bold text-foreground leading-relaxed mt-2">
          {current ? getQuestion(current) : ''}
        </p>
      </div>

      {/* Multiple Choice */}
      <div className="mx-4 md:mx-8 flex flex-col gap-3">
        {choices.map((choice, i) => {
          let style = 'bg-muted border border-transparent text-foreground hover:border-primary/30';
          if (showAnswer) {
            if (choice.isCorrect) {
              style = 'bg-emerald-50 border-2 border-emerald-400 text-emerald-800';
            } else if (selectedAnswer === i) {
              style = 'bg-red-50 border-2 border-red-400 text-red-700';
            } else {
              style = 'bg-muted border border-transparent text-muted-foreground opacity-60';
            }
          } else if (selectedAnswer === i) {
            style = 'bg-primary/10 border-2 border-primary text-primary';
          }
          return (
            <button
              key={i}
              onClick={() => handleChoiceSelect(i)}
              disabled={showAnswer}
              className={`w-full text-left px-4 py-4 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] flex items-center gap-3 ${style}`}
            >
              <span className="w-7 h-7 rounded-full bg-white/70 dark:bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0 border">
                {showAnswer && choice.isCorrect ? <Check className="w-4 h-4 text-emerald-600" /> : showAnswer && selectedAnswer === i && !choice.isCorrect ? <X className="w-4 h-4 text-red-500" /> : String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{choice.label}</span>
            </button>
          );
        })}

        {showAnswer && (
          <button
            onClick={goToNext}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm active:scale-95 transition-all mt-1"
          >
            {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}