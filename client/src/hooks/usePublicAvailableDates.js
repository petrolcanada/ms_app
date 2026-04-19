import { useQuery } from '@tanstack/react-query';
import { publicApiService } from '../services/api';

export const usePublicAvailableDates = () => {
  return useQuery({
    queryKey: ['publicAvailableDates'],
    queryFn: async () => {
      const response = await publicApiService.getAvailableDates();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
};

export default usePublicAvailableDates;
