import { useQuery } from '@tanstack/react-query';
import { publicApiService } from '../services/api';

export const usePublicDashboard = () => {
  return useQuery({
    queryKey: ['publicDashboard'],
    queryFn: async () => {
      const response = await publicApiService.getDashboard();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export default usePublicDashboard;
