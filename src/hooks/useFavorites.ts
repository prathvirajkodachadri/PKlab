/**
 * useFavorites — shared, localStorage-persisted favorites registry.
 * Any page template can pin/unpin calculators without prop threading.
 */
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pklab_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Hydrate once on mount (client-only storage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      /* corrupted cache → start empty */
    }
  }, []);

  const persist = useCallback((next: string[]) => {
    setFavorites(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggleFavorite = useCallback(
    (calcId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      persist(
        favorites.includes(calcId)
          ? favorites.filter((id) => id !== calcId)
          : [...favorites, calcId]
      );
    },
    [favorites, persist]
  );

  const isFavorite = useCallback((calcId: string) => favorites.includes(calcId), [favorites]);

  return { favorites, isFavorite, toggleFavorite };
}
