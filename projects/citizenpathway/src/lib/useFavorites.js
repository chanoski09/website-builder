import { useCallback, useEffect, useState } from 'react';

const KEY = 'civics_favorites';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(read());

  useEffect(() => {
    const sync = () => setFavorites(read());
    window.addEventListener('storage', sync);
    window.addEventListener('civics_favorites_changed', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('civics_favorites_changed', sync);
    };
  }, []);

  const isFavorite = useCallback((num) => favorites.includes(num), [favorites]);

  const toggleFavorite = useCallback((num) => {
    const list = read();
    const next = list.includes(num) ? list.filter(n => n !== num) : [...list, num];
    localStorage.setItem(KEY, JSON.stringify(next));
    setFavorites(next);
    window.dispatchEvent(new Event('civics_favorites_changed'));
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}