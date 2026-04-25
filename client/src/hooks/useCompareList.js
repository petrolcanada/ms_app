import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'fundlens_compare_ids';

const readStoredIds = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

const writeStoredIds = (ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota / private mode */
  }
};

const uniqueIds = (ids) => [...new Set((ids || []).filter(Boolean))];

export const useCompareList = (maxFunds, initialIds = []) => {
  const [ids, setIds] = useState(() => {
    const seeded = initialIds.length ? initialIds : readStoredIds();
    return uniqueIds(seeded).slice(0, maxFunds);
  });

  useEffect(() => {
    setIds((prev) => {
      const next = prev.slice(0, maxFunds);
      if (next.length !== prev.length) writeStoredIds(next);
      return next;
    });
  }, [maxFunds]);

  useEffect(() => {
    writeStoredIds(ids);
  }, [ids]);

  const idSet = useMemo(() => new Set(ids), [ids]);
  const isCompared = useCallback((id) => idSet.has(id), [idSet]);

  const add = useCallback(
    (id) => {
      if (!id || idSet.has(id) || ids.length >= maxFunds) return false;
      const next = [...ids, id];
      setIds(next);
      writeStoredIds(next);
      return true;
    },
    [idSet, ids, maxFunds],
  );

  const remove = useCallback(
    (id) => {
      if (!idSet.has(id)) return false;
      const next = ids.filter((item) => item !== id);
      setIds(next);
      writeStoredIds(next);
      return true;
    },
    [idSet, ids],
  );

  const clear = useCallback(() => {
    setIds([]);
    writeStoredIds([]);
  }, []);

  return { ids, isCompared, add, remove, clear };
};

export default useCompareList;
