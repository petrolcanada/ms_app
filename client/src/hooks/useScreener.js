import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fundService } from '../services/api';

/**
 * Fetches all screener data in a single request via the dedicated
 * /api/funds/screener endpoint (backed by a single SQL JOIN).
 *
 * Returns rows shaped with nested domain objects so the Screener
 * component can access values as fund.performance.return1yr, etc.
 */
export const useScreener = ({ category, type, asofDate } = {}) => {
  const query = useQuery({
    queryKey: ['screener', { category, type, asofDate }],
    queryFn: async () => {
      const params = {};
      if (category) params.category = category;
      if (type) params.type = type;
      if (asofDate) params.asofDate = asofDate;
      const response = await fundService.getScreenerData(params);
      const { data, meta, limited, planLimit } = response.data;
      return { data, total: meta?.total ?? 0, limited: !!limited, planLimit };
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

  return {
    data,
    totalFunds: query.data?.total ?? 0,
    limited: query.data?.limited ?? false,
    planLimit: query.data?.planLimit,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isDomainsLoading: false,
    isError: query.isError,
    error: query.error,
  };
};

export default useScreener;
