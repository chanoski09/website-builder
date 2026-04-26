import { useEffect, useState, useCallback } from 'react';
import { auth as supaAuth } from '@/api/supabaseClient';

// Free-tier limits
export const FREE_LIMITS = {
  flashcards: 5,
  voice: 5,
  interview: 5,
  badges: 2,
};

// Pricing
export const PRICING = {
  monthly: { price: 5.97, label: '$5.97 / month' },
  yearly: { price: 64.95, label: '$64.95 / year', savings: 'Save ~9%' },
};

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await supaAuth.me();
        if (!cancelled) setIsPremium(!!user?.is_premium);
      } catch {
        if (!cancelled) setIsPremium(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { isPremium, loading };
}

// Counter helpers for free-tier usage (stored in localStorage)
export function getUsage(key) {
  return parseInt(localStorage.getItem(`civics_free_${key}`)) || 0;
}

export function incrementUsage(key) {
  const n = getUsage(key) + 1;
  localStorage.setItem(`civics_free_${key}`, String(n));
  return n;
}

export function resetUsage(key) {
  localStorage.removeItem(`civics_free_${key}`);
}

export function useFreeLimit(key) {
  const { isPremium, loading } = usePremium();
  const [count, setCount] = useState(() => getUsage(key));

  const bump = useCallback(() => {
    const n = incrementUsage(key);
    setCount(n);
    return n;
  }, [key]);

  const limit = FREE_LIMITS[key] ?? 5;
  const reached = !isPremium && count >= limit;

  return { isPremium, loading, count, limit, reached, bump };
}