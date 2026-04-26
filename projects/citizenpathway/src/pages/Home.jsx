import { Link } from 'react-router-dom';
import { BookOpen, Mic, BarChart2, Star, Flame, Trophy, Shield, Settings, ClipboardList, FileText, Landmark, Crown } from 'lucide-react';
import { CIVICS_QUESTIONS } from '@/lib/questions-data';
import { useEffect, useState, useCallback } from 'react';
import BadgeDisplay from '@/components/BadgeDisplay';
import DailyChallenge from '@/components/gamification/DailyChallenge';
import PullToRefresh from '@/components/PullToRefresh';
import { useTheme } from '@/lib/useTheme';
import WelcomeModal from '@/components/WelcomeModal';

export default function Home() {
  useTheme(); // initialize theme on app load
  const [masteredCount, setMasteredCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('civics_welcome_seen'));

  const loadData = useCallback(() => {
    const progress = JSON.parse(localStorage.getItem('civics_progress') || '{}');
    const mastered = Object.values(progress).filter(p => p.status === 'mastered').length;
    setMasteredCount(mastered);

    const streakData = JSON.parse(localStorage.getItem('civics_streak') || '{}');
    setStreak(streakData.current_streak || 0);
    setTotalXP(streakData.total_xp || 0);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    await new Promise(r => setTimeout(r, 400));
    loadData();
  }, [loadData]);

  const totalQ = CIVICS_QUESTIONS.length;

  const dismissWelcome = () => {
    localStorage.setItem('civics_welcome_seen', 'true');
    setShowWelcome(false);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-background px-4 md:px-8 pt-2 pb-2 flex flex-col gap-3 md:gap-5">
      <WelcomeModal open={showWelcome} onClose={dismissWelcome} />
      {/* Header */}
      <div className="flex items-center justify-between" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Citizen Pathway
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Ready to study today?</p>
        </div>
        <Link to="/settings" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-foreground">{streak}</p>
          <p className="text-xs text-muted-foreground">Day streak</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <Star className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-foreground">{totalXP}</p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <Trophy className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-foreground">{masteredCount}</p>
          <p className="text-xs text-muted-foreground">Mastered</p>
        </div>
      </div>

      {/* Daily Challenge */}
      <div className="px-0">
        <DailyChallenge />
      </div>

      {/* Badge Level Card */}
      <BadgeDisplay masteredCount={masteredCount} />

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Link to="/flashcards" className="block">
          <div className="bg-primary text-primary-foreground rounded-2xl p-5 shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">Study Mode</p>
              <p className="text-xl font-extrabold">Flashcards</p>
              <p className="text-sm opacity-80 mt-0.5">Flip through all {totalQ} civics questions</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
          </div>
        </Link>

        <Link to="/voice" className="block">
          <div className="bg-card border-2 border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Practice Mode</p>
              <p className="text-xl font-extrabold text-foreground">Voice Practice</p>
              <p className="text-sm text-muted-foreground mt-0.5">Speak & get AI feedback</p>
            </div>
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
              <Mic className="w-7 h-7 text-primary" />
            </div>
          </div>
        </Link>

        <Link to="/interview" className="block">
          <div className="bg-card border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-5 hover:border-amber-400 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Simulate</p>
              <p className="text-xl font-extrabold text-foreground">Mock Interview</p>
              <p className="text-sm text-muted-foreground mt-0.5">Practice with AI Officer Rivera</p>
            </div>
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Link>

        <Link to="/quiz" className="block">
          <div className="bg-card border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 hover:border-emerald-400 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Test Yourself</p>
              <p className="text-xl font-extrabold text-foreground">Quick Quiz</p>
              <p className="text-sm text-muted-foreground mt-0.5">20 randomized questions</p>
            </div>
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Link>

        <Link to="/n400" className="block">
          <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Prepare</p>
              <p className="text-xl font-extrabold text-foreground">N-400 Form</p>
              <p className="text-sm text-muted-foreground mt-0.5">Personalize your mock interview</p>
            </div>
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary" />
            </div>
          </div>
        </Link>

        <Link to="/politicians" className="block">
          <div className="bg-card border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-5 hover:border-amber-400 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Pro
              </p>
              <p className="text-xl font-extrabold text-foreground">Politicians</p>
              <p className="text-sm text-muted-foreground mt-0.5">Current officials for your state</p>
            </div>
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Landmark className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Link>

        <Link to="/progress" className="block">
          <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Track</p>
              <p className="text-xl font-extrabold text-foreground">My Progress</p>
              <p className="text-sm text-muted-foreground mt-0.5">{masteredCount} of {totalQ} mastered</p>
            </div>
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-7 h-7 text-primary" />
            </div>
          </div>
        </Link>
      </div>

    </PullToRefresh>
  );
}