import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fundService } from '../services/api';

/**
 * Fetches screener data with server-side sorting and pagination.
 *
 * The server returns rows already sorted by the requested column
 * and limited to the current page, so the client no longer needs
 * to sort or truncate locally.
 */
export const useScreener = ({ category, type, asofDate, sortBy, sortDir, page = 1, limit = 25 } = {}) => {
  const query = useQuery({
    queryKey: ['screener', { category, type, asofDate, sortBy, sortDir, page, limit }],
    queryFn: async () => {
      const params = {};
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
    return rows.map(row => ({
      _id: row._id,
      fundname: row.fundname,
      ticker: row.ticker,
      categoryname: row.categoryname,
      securitytype: row.securitytype,
      performance: {
        return1yr: row.return1yr,
        return3yr: row.return3yr,
        return5yr: row.return5yr,
        return10yr: row.return10yr,
      },
      fees: { mer: row.mer },
      risk: { sharperatio3yr: row.sharperatio3yr },
      ratings: { ratingoverall: row.ratingoverall },
      assets: { fundnetassets: row.fundnetassets },
    }));
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
