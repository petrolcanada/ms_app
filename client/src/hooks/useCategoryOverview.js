import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/api';

export const useCategoryOverview = (category, asofDate) => {
  return useQuery({
    queryKey: ['categoryOverview', category, asofDate],
    queryFn: async () => {
      const params = {};
      if (asofDate) params.asofDate = asofDate;
      const response = await dashboardService.getCategoryOverview(category, params);
      return response.data.data;
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export default useCategoryOverview;
