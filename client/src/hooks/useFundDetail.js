import { useQuery } from '@tanstack/react-query';
import { fundService } from '../services/api';

/**
 * Custom hook for fetching a single fund's detailed information
 * @param {string|number} fundId - The ID of the fund to fetch
 * @returns {Object} React Query result with fund detail data, loading, and error states
 */
export const useFundDetail = (fundId) => {
  return useQuery({
    queryKey: ['fund', fundId],
    queryFn: async () => {
      const response = await fundService.getFundById(fundId);
      return response.data;
    },
    enabled: !!fundId, // Only run query if fundId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Retry once on failure
  });
};

export default useFundDetail;
