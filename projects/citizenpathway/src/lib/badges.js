// Badge/Level system - now based on 128 questions
// Self-hosted placeholder — replace /public/badge.png with the real asset if desired.
const BADGE_IMAGE = '/badge.png';

export const LEVELS = [
  { level: 1,  min: 0,   label: 'Civic Initiate',  tier: 'bronze',  color: 'text-amber-700',  bgColor: 'bg-amber-100 dark:bg-amber-900/30', borderColor: 'border-amber-300 dark:border-amber-700' },
  { level: 2,  min: 13,  label: 'Civic Initiate',  tier: 'bronze',  color: 'text-amber-700 dark:text-amber-400',  bgColor: 'bg-amber-100 dark:bg-amber-900/30', borderColor: 'border-amber-300 dark:border-amber-700' },
  { level: 3,  min: 26,  label: 'Civic Adept',     tier: 'silver',  color: 'text-slate-500 dark:text-slate-300',   bgColor: 'bg-slate-100 dark:bg-slate-800/50', borderColor: 'border-slate-300 dark:border-slate-600' },
  { level: 4,  min: 38,  label: 'Civic Adept',     tier: 'silver',  color: 'text-slate-500 dark:text-slate-300',   bgColor: 'bg-slate-100 dark:bg-slate-800/50', borderColor: 'border-slate-300 dark:border-slate-600' },
  { level: 5,  min: 51,  label: 'Civic Master',    tier: 'gold',    color: 'text-yellow-600 dark:text-yellow-400',  bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-300 dark:border-yellow-700' },
  { level: 6,  min: 64,  label: 'Civic Master',    tier: 'gold',    color: 'text-yellow-600 dark:text-yellow-400',  bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-300 dark:border-yellow-700' },
  { level: 7,  min: 77,  label: 'Civic Elite',     tier: 'platinum',color: 'text-blue-600 dark:text-blue-400',    bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-300 dark:border-blue-700' },
  { level: 8,  min: 90,  label: 'Civic Elite',     tier: 'platinum',color: 'text-blue-600 dark:text-blue-400',    bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-300 dark:border-blue-700' },
  { level: 9,  min: 108, label: 'Civic Luminary',  tier: 'diamond', color: 'text-indigo-600 dark:text-indigo-400',  bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', borderColor: 'border-indigo-300 dark:border-indigo-700' },
  { level: 10, min: 128, label: 'Civic Luminary',  tier: 'diamond', color: 'text-indigo-600 dark:text-indigo-400',  bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', borderColor: 'border-indigo-300 dark:border-indigo-700' },
];

// Badge sprite positions (each badge is ~1/5 width, 1/2 height of image)
const BADGE_POSITIONS = [
  { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 }, { col: 4, row: 0 },
  { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 4, row: 1 },
];

export function getCurrentLevel(masteredCount) {
  return [...LEVELS].reverse().find(l => masteredCount >= l.min) || LEVELS[0];
}

export function getNextLevel(currentLevel) {
  const idx = LEVELS.findIndex(l => l.level === currentLevel.level);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getBadgeStyle(levelNum) {
  const idx = levelNum - 1;
  const pos = BADGE_POSITIONS[idx] || BADGE_POSITIONS[0];
  return {
    backgroundImage: `url(${BADGE_IMAGE})`,
    backgroundSize: '500% 200%',
    backgroundPosition: `${pos.col * 25}% ${pos.row * 100}%`,
    backgroundRepeat: 'no-repeat',
  };
}

export { BADGE_IMAGE };