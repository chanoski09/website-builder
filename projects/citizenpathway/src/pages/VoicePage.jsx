import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import VoicePractice from '@/components/VoicePractice';
import { CIVICS_QUESTIONS } from '@/lib/questions-data';
import { useLanguage } from '@/lib/useLanguage';
import MobileSelect from '@/components/MobileSelect';

const MODES = [
{ value: 'weak', label: '📚 Focus on weak' },
{ value: 'all', label: '🌐 All questions' }];


const CATEGORIES = [
{ value: 'all', label: 'All' },
{ value: 'American Government', label: '🏛️ Government' },
{ value: 'American History', label: '📜 History' },
{ value: 'Integrated Civics', label: '🗽 Civics' }];


export default function VoicePage() {
  const { getQuestion, getAnswer } = useLanguage();

  // Persisted state
  const [mode, setMode] = useState(() => localStorage.getItem('civics_voice_mode') || 'weak');
  const [category, setCategory] = useState(() => localStorage.getItem('civics_voice_category') || 'all');
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = parseInt(localStorage.getItem('civics_voice_index'));
    return isNaN(saved) ? 0 : saved;
  });
  const [questions, setQuestions] = useState([]);
  const [showResume, setShowResume] = useState(() => {
    return parseInt(localStorage.getItem('civics_voice_index')) > 0;
  });

  useEffect(() => {
    const progress = JSON.parse(localStorage.getItem('civics_progress') || '{}');
    let filtered = CIVICS_QUESTIONS;
    if (mode === 'weak') {
      filtered = filtered.filter((q) => {
        const p = progress[q.number];
        return !p || p.status !== 'mastered';
      });
      if (filtered.length === 0) filtered = CIVICS_QUESTIONS;
    }
    if (category !== 'all') {
      filtered = filtered.filter((q) => q.category === category);
    }
    setQuestions(filtered);
  }, [mode, category]);

  // Persist position
  useEffect(() => {
    localStorage.setItem('civics_voice_index', String(currentIndex));
    localStorage.setItem('civics_voice_mode', mode);
    localStorage.setItem('civics_voice_category', category);
  }, [currentIndex, mode, category]);

  const current = questions[Math.min(currentIndex, Math.max(questions.length - 1, 0))];

  const handleNext = () => {
    setCurrentIndex((i) => (i + 1) % questions.length);
  };

  const startOver = () => {
    setCurrentIndex(0);
    setShowResume(false);
  };

  // Resume prompt
  if (showResume && questions.length > 0 && currentIndex > 0 && currentIndex < questions.length) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-6 text-center">
        <div className="text-5xl">🎤</div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Welcome back!</h2>
          <p className="text-muted-foreground mt-1 text-sm">You left off at question {currentIndex + 1} of {questions.length}.</p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button onClick={() => setShowResume(false)} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base active:scale-95 transition-all">
            Continue where I left off
          </button>
          <button onClick={startOver} className="w-full py-4 rounded-2xl bg-muted text-muted-foreground font-semibold active:scale-95 transition-all">
            Start over
          </button>
        </div>
      </div>);

  }

  if (!current) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>);

  }

  return (
    <div className="min-h-screen bg-background py-6 md:py-8 flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Link to="/" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h2 className="text-base md:text-lg font-bold text-foreground">Voice Practice</h2>
        <div className="w-9" />
      </div>

      {/* Filters */}
      <div className="px-4 md:px-8 flex flex-col md:flex-row gap-2 md:gap-3 w-full max-w-3xl md:max-w-full mx-auto">
        <div className="flex-1"><MobileSelect value={mode} onValueChange={(v) => {setMode(v);setCurrentIndex(0);}} options={MODES} title="Question Mode" /></div>
        <div className="flex-1"><MobileSelect value={category} onValueChange={(v) => {setCategory(v);setCurrentIndex(0);}} options={CATEGORIES} title="Category" /></div>
      </div>

      {/* Voice Practice Component */}
      <div className="w-full max-w-2xl mx-auto">
      <VoicePractice
          question={getQuestion(current)}
          answer={getAnswer(current)}
          questionNum={currentIndex + 1}
          total={questions.length}
          onNext={handleNext}
          language="en" />
        
      </div>

      {/* Instructions box */}
      



      
    </div>);

}