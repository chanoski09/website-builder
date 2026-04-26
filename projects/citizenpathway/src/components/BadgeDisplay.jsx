import { useState } from 'react';
import { Lock } from 'lucide-react';
import { getBadgeStyle, getCurrentLevel, getNextLevel, LEVELS } from '@/lib/badges';
import { usePremium, FREE_LIMITS } from '@/lib/usePremium';
import PaywallModal from '@/components/PaywallModal';

export default function BadgeDisplay({ masteredCount, compact = false }) {
  const { isPremium } = usePremium();
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Cap level at free limit (2) for non-premium users
  const rawLevel = getCurrentLevel(masteredCount);
  const level = !isPremium && rawLevel.level > FREE_LIMITS.badges
    ? LEVELS[FREE_LIMITS.badges - 1]
    : rawLevel;
  const locked = !isPremium && rawLevel.level > FREE_LIMITS.badges;
  const nextLevel = getNextLevel(level);
  const progressToNext = nextLevel
    ? Math.round(((masteredCount - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-full"
          style={getBadgeStyle(level.level)}
        />
        <div>
          <p className={`text-xs font-extrabold ${level.color}`}>L{level.level} - {level.label}</p>
          <p className="text-[10px] text-muted-foreground">{masteredCount}/128 mastered</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${level.bgColor} border ${level.borderColor} rounded-2xl p-4 shadow-sm`}>
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-full flex-shrink-0"
            style={getBadgeStyle(level.level)}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Your Level</p>
            <p className={`text-lg font-extrabold ${level.color}`}>
              L{level.level} — {level.label}
            </p>
            <p className="text-sm text-muted-foreground">
              {masteredCount} of 128 mastered
            </p>
            <div className="w-full bg-white/60 dark:bg-white/10 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              />
            </div>
            {locked ? (
              <button
                onClick={() => setPaywallOpen(true)}
                className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                <Lock className="w-3 h-3" /> Upgrade to unlock higher badges
              </button>
            ) : nextLevel && (
              <p className="text-xs text-muted-foreground mt-1">
                {nextLevel.min - masteredCount} more to reach L{nextLevel.level}
              </p>
            )}
          </div>
        </div>
      </div>
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} trigger="limit" />
    </>
  );
}

export function BadgeGrid({ masteredCount }) {
  const { isPremium } = usePremium();
  const [paywallOpen, setPaywallOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-5 gap-2">
        {LEVELS.map((level) => {
          const earnedByProgress = masteredCount >= level.min;
          const premiumLocked = !isPremium && level.level > FREE_LIMITS.badges;
          const unlocked = earnedByProgress && !premiumLocked;
          return (
            <button
              key={level.level}
              onClick={() => { if (premiumLocked) setPaywallOpen(true); }}
              className="flex flex-col items-center gap-1 relative"
            >
              <div
                className={`w-14 h-14 rounded-full transition-all ${unlocked ? '' : 'grayscale opacity-30'}`}
                style={getBadgeStyle(level.level)}
              />
              {premiumLocked && (
                <div className="absolute top-0 right-0 w-5 h-5 rounded-full bg-amber-500 border-2 border-background flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
              )}
              <span className={`text-[10px] font-bold ${unlocked ? level.color : 'text-muted-foreground'}`}>
                L{level.level}
              </span>
            </button>
          );
        })}
      </div>
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} trigger="limit" />
    </>
  );
}