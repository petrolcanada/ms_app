import { renderHook, act } from '@testing-library/react';
import { useWatchlist } from './useWatchlist';

const mockFund = {
  _id: 'fund-1',
  fundname: 'Test Fund',
  ticker: 'TF',
  categoryname: 'Equity',
  securitytype: 'ETF',
};

beforeEach(() => {
  localStorage.clear();
});

test('starts with empty watchlist', () => {
  const { result } = renderHook(() => useWatchlist());
  expect(result.current.items).toEqual([]);
});

test('toggle adds a fund', () => {
  const { result } = renderHook(() => useWatchlist());
  act(() => result.current.toggle(mockFund));
  expect(result.current.items).toHaveLength(1);
  expect(result.current.items[0]._id).toBe('fund-1');
  expect(result.current.isWatched('fund-1')).toBe(true);
});

test('toggle removes a fund that is already watched', () => {
  const { result } = renderHook(() => useWatchlist());
  act(() => result.current.toggle(mockFund));
  expect(result.current.items).toHaveLength(1);

  act(() => result.current.toggle(mockFund));
  expect(result.current.items).toHaveLength(0);
  expect(result.current.isWatched('fund-1')).toBe(false);
});

test('remove deletes by id', () => {
  const { result } = renderHook(() => useWatchlist());
  act(() => result.current.toggle(mockFund));
  act(() => result.current.remove('fund-1'));
  expect(result.current.items).toHaveLength(0);
});

test('clear empties the watchlist', () => {
  const { result } = renderHook(() => useWatchlist());
  act(() => result.current.toggle(mockFund));
  act(() => result.current.toggle({ ...mockFund, _id: 'fund-2' }));
  expect(result.current.items).toHaveLength(2);

  act(() => result.current.clear());
  expect(result.current.items).toHaveLength(0);
});

test('persists to localStorage', () => {
  const { result } = renderHook(() => useWatchlist());
  act(() => result.current.toggle(mockFund));

  const stored = JSON.parse(localStorage.getItem('fundlens_watchlist'));
  expect(stored).toHaveLength(1);
  expect(stored[0]._id).toBe('fund-1');
});
