import { useState, useEffect } from 'react';
import { ArrowLeft, Flame, Trophy, BookOpen, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CIVICS_QUESTIONS } from '@/lib/questions-data';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import BadgeDisplay, { BadgeGrid } from '@/components/BadgeDisplay';
import TestReadiness from '@/components/gamification/TestReadiness';

export default function Progress() {
  const [progress, setProgress] = useState({});
  const [streak, setStreak] = useState({});

  useEffect(() => {
    setProgress(JSON.parse(localStorage.getItem('civics_progress') || '{}'));
    setStreak(JSON.parse(localStorage.getItem('civics_streak') || '{}'));
  }, []);

  const mastered = Object.values(progress).filter(p => p.status === 'mastered').length;
  const learning = Object.values(progress).filter(p => p.status === 'learning').length;
  const unseen = CIVICS_QUESTIONS.length - mastered - learning;
  const totalXP = streak.total_xp || 0;
  const currentStreak = streak.current_streak || 0;
  const longestStreak = streak.longest_streak || 0;

  const pieData = [
    { name: 'Mastered', value: mastered, fill: '#10b981' },
    { name: 'Learning', value: learning, fill: '#3b82f6' },
    { name: 'Unseen', value: Math.max(unseen, 0), fill: '#e2e8f0' },
  ];

  const categoryStats = ['American Government', 'American History', 'Integrated Civics'].map(cat => {
    const catQs = CIVICS_QUESTIONS.filter(q => q.category === cat);
    const catMastered = catQs.filter(q => progress[q.number]?.status === 'mastered').length;
    return {
      category: cat,
      total: catQs.length,
      mastered: catMastered,
      pct: catQs.length > 0 ? Math.round((catMastered / catQs.length) * 100) : 0
    };
  });

  const todayStr = new Date().toDateString();
  const practicedToday = Object.values(progress).filter(p => {
    if (!p.last_practiced) return false;
    return new Date(p.last_practiced).toDateString() === todayStr;
  }).length;

  return (
    <div className="min-h-screen bg-background py-6 md:py-8 flex flex-col gap-5 md:gap-6 pb-24 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Link to="/" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h2 className="text-base md:text-lg font-bold text-foreground">My Progress</h2>
        <div className="w-9" />
      </div>

      {/* Top Row: Test Readiness + Badge (2-col on tablet) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mx-4 md:mx-0">
        <TestReadiness progress={progress} />
        <BadgeDisplay masteredCount={mastered} />
      </div>

      {/* All Badges Grid */}
      <div className="mx-4 md:mx-0 bg-card border border-border rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">🏅 All Badges</h3>
        <BadgeGrid masteredCount={mastered} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 px-4 md:px-0">
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-xl font-extrabold text-foreground">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">Day streak</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-xl font-extrabold text-foreground">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">Best streak</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-extrabold text-foreground">{practicedToday}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </div>
      </div>

      {/* Pie Chart + Category (side-by-side on tablet) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mx-4 md:mx-0">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Overview
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-28 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={50} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {pieData.map(({ name, value, fill }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fill }} />
                  <span className="text-sm text-foreground">{name}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">By Category</h3>
        <div className="flex flex-col gap-3">
          {categoryStats.map(({ category, total, mastered: cm, pct }) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">{category}</span>
                <span className="text-xs text-muted-foreground">{cm}/{total}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Weak Questions Preview */}
      <div className="mx-4 md:mx-0 bg-card border border-border rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">📚 Needs Practice</h3>
        <div className="flex flex-col gap-2">
          {CIVICS_QUESTIONS
            .filter(q => {
              const p = progress[q.number];
              return !p || p.status !== 'mastered';
            })
            .slice(0, 5)
            .map(q => (
              <div key={q.number} className="flex items-start gap-3 p-2 rounded-xl bg-muted/50">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full min-w-[28px] text-center">
                  Q{q.number}
                </span>
                <p className="text-xs text-foreground flex-1">{q.question_en}</p>
              </div>
            ))}
          {CIVICS_QUESTIONS.filter(q => !progress[q.number] || progress[q.number].status !== 'mastered').length === 0 && (
            <p className="text-sm text-emerald-600 font-semibold text-center py-2">🎉 All questions mastered!</p>
          )}
        </div>
      </div>

      {/* Reset button */}
      <div className="mx-4 md:mx-0 md:max-w-sm">
        <button
          onClick={() => {
            if (window.confirm('Reset all progress? This cannot be undone.')) {
              localStorage.removeItem('civics_progress');
              localStorage.removeItem('civics_streak');
              setProgress({});
              setStreak({});
            }
          }}
          className="w-full py-3 rounded-2xl border border-border text-muted-foreground text-sm font-semibold hover:bg-muted transition-all"
        >
          Reset Progress
        </button>
      </div>
    </div>
  );
}