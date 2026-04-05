import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'fundlens_watchlist';

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeStorage = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useWatchlist = () => {
  const [items, setItems] = useState(readStorage);

  const ids = useMemo(() => new Set(items.map((i) => i._id)), [items]);

  const isWatched = useCallback((id) => ids.has(id), [ids]);

  const toggle = useCallback((fund) => {
    setItems((prev) => {
      const exists = prev.some((i) => i._id === fund._id);
      const next = exists
        ? prev.filter((i) => i._id !== fund._id)
        : [
            ...prev,
            {
              _id: fund._id,
              fundname: fund.fundname || fund._name,
              ticker: fund.ticker,
              categoryname: fund.categoryname,
              securitytype: fund.securitytype,
              addedAt: Date.now(),
            },
          ];
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => {
      const next = prev.filter((i) => i._id !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    writeStorage([]);
    setItems([]);
  }, []);

  return { items, isWatched, toggle, remove, clear };
};

export default useWatchlist;
