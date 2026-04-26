import { CIVICS_QUESTIONS } from '@/lib/questions-data';
import { Shield, TrendingUp } from 'lucide-react';

function calculateReadiness(progress) {
  const total = CIVICS_QUESTIONS.length;
  const entries = Object.values(progress);
  if (entries.length === 0) return { score: 0, label: 'Not Started', color: 'text-muted-foreground' };

  const mastered = entries.filter(p => p.status === 'mastered').length;
  const learning = entries.filter(p => p.status === 'learning').length;

  // Weighted score: mastered questions worth full, learning worth partial
  const masteredWeight = mastered / total;
  const learningWeight = (learning * 0.3) / total;
  const coverageScore = masteredWeight + learningWeight;

  // Accuracy factor
  const totalAttempts = entries.reduce((s, p) => s + (p.attempt_count || 0), 0);
  const totalCorrect = entries.reduce((s, p) => s + (p.correct_count || 0), 0);
  const accuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

  // Category balance — penalize if any category is very weak
  const categories = ['American Government', 'American History', 'Integrated Civics'];
  const catScores = categories.map(cat => {
    const catQs = CIVICS_QUESTIONS.filter(q => q.category === cat);
    const catMastered = catQs.filter(q => progress[q.number]?.status === 'mastered').length;
    return catQs.length > 0 ? catMastered / catQs.length : 0;
  });
  const balanceFactor = Math.min(...catScores) > 0.3 ? 1 : 0.85;

  // Final score (0-100)
  const raw = (coverageScore * 60 + accuracy * 40) * balanceFactor;
  const score = Math.min(Math.round(raw * 100), 100);

  let label, color;
  if (score >= 85) { label = 'Highly Ready'; color = 'text-emerald-600 dark:text-emerald-400'; }
  else if (score >= 65) { label = 'Likely to Pass'; color = 'text-primary'; }
  else if (score >= 40) { label = 'Getting There'; color = 'text-amber-600 dark:text-amber-400'; }
  else { label = 'Keep Studying'; color = 'text-red-500'; }

  return { score, label, color };
}

export default function TestReadiness({ progress }) {
  const { score, label, color } = calculateReadiness(progress);

  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" /> Test Readiness
      </h3>
      <div className="flex items-center gap-5">
        {/* Circular progress */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="42" fill="none" strokeWidth="6" className="stroke-muted" />
            <circle
              cx="48" cy="48" r="42" fill="none" strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="stroke-primary transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-foreground">{score}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className={`text-base font-extrabold ${color}`}>{label}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {score >= 85
              ? 'You\'re well-prepared. Consider scheduling your test!'
              : score >= 65
              ? 'Good progress! Focus on weak areas to improve.'
              : score >= 40
              ? 'You\'re building knowledge. Keep practicing daily.'
              : 'Practice regularly to build your confidence.'}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Based on mastery, accuracy & category balance</span>
          </div>
        </div>
      </div>
    </div>
  );
}