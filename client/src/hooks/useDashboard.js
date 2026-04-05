import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/api';

export const useDashboard = (asofDate) => {
  return useQuery({
    queryKey: ['dashboard', asofDate],
    queryFn: async () => {
      const params = {};
      if (asofDate) params.asofDate = asofDate;
      const response = await dashboardService.getDashboard(params);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export default useDashboard;
