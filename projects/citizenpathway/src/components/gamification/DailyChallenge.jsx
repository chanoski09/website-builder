import { useState, useEffect } from 'react';
import { Target, Zap, CheckCircle2 } from 'lucide-react';

const CHALLENGES = [
  { id: 'master5', label: 'Master 5 new questions', target: 5, type: 'master' },
  { id: 'practice10', label: 'Practice 10 questions', target: 10, type: 'practice' },
  { id: 'streak', label: 'Keep your streak alive', target: 1, type: 'streak' },
];

function getTodayChallenge() {
  const day = Math.floor(Date.now() / 86400000);
  return CHALLENGES[day % CHALLENGES.length];
}

function getChallengeProgress(challenge) {
  const progress = JSON.parse(localStorage.getItem('civics_progress') || '{}');
  const todayStr = new Date().toDateString();

  if (challenge.type === 'master') {
    return Object.values(progress).filter(
      p => p.status === 'mastered' && p.last_practiced && new Date(p.last_practiced).toDateString() === todayStr
    ).length;
  }
  if (challenge.type === 'practice') {
    return Object.values(progress).filter(
      p => p.last_practiced && new Date(p.last_practiced).toDateString() === todayStr
    ).length;
  }
  if (challenge.type === 'streak') {
    const streak = JSON.parse(localStorage.getItem('civics_streak') || '{}');
    return streak.last_activity_date === todayStr ? 1 : 0;
  }
  return 0;
}

export default function DailyChallenge() {
  const [challenge] = useState(getTodayChallenge);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(getChallengeProgress(challenge));
    const interval = setInterval(() => setCurrent(getChallengeProgress(challenge)), 3000);
    return () => clearInterval(interval);
  }, [challenge]);

  const completed = current >= challenge.target;
  const pct = Math.min((current / challenge.target) * 100, 100);

  return (
    <div className={`border rounded-2xl p-4 shadow-sm ${completed ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-card border-border'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${completed ? 'bg-emerald-100 dark:bg-emerald-800/40' : 'bg-primary/10'}`}>
          {completed ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <Target className="w-5 h-5 text-primary" />}
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Daily Challenge</p>
          <p className={`text-sm font-bold ${completed ? 'text-emerald-700 dark:text-emerald-300' : 'text-foreground'}`}>
            {challenge.label}
          </p>
        </div>
        {completed && <Zap className="w-5 h-5 text-amber-500" />}
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ${completed ? 'bg-emerald-500' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 text-right">
        {current}/{challenge.target} {completed ? '— Complete! +25 XP 🎉' : ''}
      </p>
    </div>
  );
}