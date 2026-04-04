import { useQuery } from '@tanstack/react-query';
import { dateService } from '../services/api';

export const useAvailableDates = () => {
  return useQuery({
    queryKey: ['availableDates'],
    queryFn: async () => {
      const response = await dateService.getAvailableDates();
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
};

export default useAvailableDates;
