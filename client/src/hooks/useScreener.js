import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fundService } from '../services/api';
import { mapScreenerRow } from '../config/screenerMetrics';

/**
 * Fetches screener data with server-side sorting and pagination.
 *
 * The server returns rows already sorted by the requested column
 * and limited to the current page, so the client no longer needs
 * to sort or truncate locally.
 */
export const useScreener = ({
  search,
  category,
  type,
  asofDate,
  sortBy,
  sortDir,
  page = 1,
  limit = 25,
} = {}) => {
  const query = useQuery({
    queryKey: ['screener', { search, category, type, asofDate, sortBy, sortDir, page, limit }],
    queryFn: async () => {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (type) params.type = type;
      if (asofDate) params.asofDate = asofDate;
      if (sortBy) params.sortBy = sortBy;
      if (sortDir) params.sortDir = sortDir;
      params.page = page;
      params.limit = limit;
      const response = await fundService.getScreenerData(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const data = useMemo(() => {
    const rows = query.data?.data || [];
    return rows.map(mapScreenerRow);
  }, [query.data]);

  const meta = query.data?.meta || {};

  return {
    data,
    totalFunds: meta.total ?? 0,
    totalPages: meta.totalPages ?? 1,
    page: meta.page ?? page,
    limited: query.data?.limited ?? false,
    planLimit: query.data?.planLimit,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
};

export default useScreener;
