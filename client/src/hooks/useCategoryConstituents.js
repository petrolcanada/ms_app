import { useQuery } from '@tanstack/react-query';
import { mapScreenerRow } from '../config/screenerMetrics';
import { fundService } from '../services/api';

const PAGE_SIZE = 100;

export const useCategoryConstituents = (category, asofDate) => {
  return useQuery({
    queryKey: ['categoryConstituents', category, asofDate],
    enabled: Boolean(category),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const baseParams = {
        category,
        limit: PAGE_SIZE,
        page: 1,
        sortBy: 'return1yr',
        sortDir: 'desc',
      };

      if (asofDate) {
        baseParams.asofDate = asofDate;
      }

      const firstResponse = await fundService.getScreenerData(baseParams);
      const firstPayload = firstResponse.data || {};
      const totalPages = firstPayload.meta?.totalPages ?? 1;
      const rows = [...(firstPayload.data || [])];

      for (let page = 2; page <= totalPages; page += 1) {
        const response = await fundService.getScreenerData({
          ...baseParams,
          page,
        });
        rows.push(...(response.data?.data || []));
      }

      return {
        funds: rows.map(mapScreenerRow),
        totalFunds: firstPayload.meta?.total ?? rows.length,
        limited: Boolean(firstPayload.limited),
        planLimit: firstPayload.planLimit ?? null,
      };
    },
  });
};

export default useCategoryConstituents;
