import { useState, useCallback, useMemo, useEffect } from 'react';
import { watchlistApiService } from '../services/api';

const STORAGE_KEY = 'fundlens_watchlist';
const SYNCED_KEY = 'fundlens_watchlist_synced';

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

export const useWatchlist = (user) => {
  const [items, setItems] = useState(readStorage);
  const [serverItems, setServerItems] = useState([]);
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isAuthenticated) return;

    watchlistApiService.getAll()
      .then((res) => {
        const fetched = (res.data.items || []).map((row) => ({
          _id: row.fund_id,
          fundname: row.fund_name,
          ticker: row.ticker,
          categoryname: row.category_name,
          securitytype: row.security_type,
          addedAt: new Date(row.added_at).getTime(),
        }));
        setServerItems(fetched);

        if (!localStorage.getItem(SYNCED_KEY)) {
          const localItems = readStorage();
          if (localItems.length > 0) {
            watchlistApiService.sync(localItems)
              .then(() => {
                localStorage.setItem(SYNCED_KEY, '1');
                return watchlistApiService.getAll();
              })
              .then((r) => {
                const merged = (r.data.items || []).map((row) => ({
                  _id: row.fund_id,
                  fundname: row.fund_name,
                  ticker: row.ticker,
                  categoryname: row.category_name,
                  securitytype: row.security_type,
                  addedAt: new Date(row.added_at).getTime(),
                }));
                setServerItems(merged);
              })
              .catch(() => {});
          } else {
            localStorage.setItem(SYNCED_KEY, '1');
          }
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const effectiveItems = isAuthenticated ? serverItems : items;
  const ids = useMemo(() => new Set(effectiveItems.map((i) => i._id)), [effectiveItems]);

  const isWatched = useCallback((id) => ids.has(id), [ids]);

  const toggle = useCallback((fund) => {
    const fundId = fund._id;
    const exists = ids.has(fundId);

    if (isAuthenticated) {
      if (exists) {
        setServerItems((prev) => prev.filter((i) => i._id !== fundId));
        watchlistApiService.remove(fundId).catch(() => {
          watchlistApiService.getAll().then((r) => {
            setServerItems((r.data.items || []).map((row) => ({
              _id: row.fund_id, fundname: row.fund_name, ticker: row.ticker,
              categoryname: row.category_name, securitytype: row.security_type,
              addedAt: new Date(row.added_at).getTime(),
            })));
          });
        });
      } else {
        const newItem = {
          _id: fundId,
          fundname: fund.fundname || fund._name,
          ticker: fund.ticker,
          categoryname: fund.categoryname,
          securitytype: fund.securitytype,
          addedAt: Date.now(),
        };
        setServerItems((prev) => [...prev, newItem]);
        watchlistApiService.add({
          fundId,
          fundName: fund.fundname || fund._name,
          ticker: fund.ticker,
          categoryName: fund.categoryname,
          securityType: fund.securitytype,
        }).catch(() => {
          setServerItems((prev) => prev.filter((i) => i._id !== fundId));
        });
      }
    } else {
      setItems((prev) => {
        const next = exists
          ? prev.filter((i) => i._id !== fundId)
          : [
              ...prev,
              {
                _id: fundId,
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
    }
  }, [ids, isAuthenticated]);

  const remove = useCallback((id) => {
    if (isAuthenticated) {
      setServerItems((prev) => prev.filter((i) => i._id !== id));
      watchlistApiService.remove(id).catch(() => {});
    } else {
      setItems((prev) => {
        const next = prev.filter((i) => i._id !== id);
        writeStorage(next);
        return next;
      });
    }
  }, [isAuthenticated]);

  const clear = useCallback(() => {
    if (isAuthenticated) {
      setServerItems([]);
      watchlistApiService.clear().catch(() => {});
    } else {
      writeStorage([]);
      setItems([]);
    }
  }, [isAuthenticated]);

  return { items: effectiveItems, isWatched, toggle, remove, clear };
};

export default useWatchlist;
