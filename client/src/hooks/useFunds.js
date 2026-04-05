import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fundService } from '../services/api';

/**
 * Custom hook for fetching funds data with pagination and filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Current page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @param {string} options.search - Search term for fund name or ticker
 * @param {string} options.type - Filter by fund type
 * @param {string} options.category - Filter by fund category
 * @returns {Object} React Query result with funds data, pagination, loading, and error states
 */
export const useFunds = ({ page = 1, limit = 20, search = '', type = '', category = '', asofDate = '' } = {}) => {
  return useQuery({
    queryKey: ['funds', { page, limit, search, type, category, asofDate }],
    queryFn: async () => {
      const params = {
        page,
        limit,
      };
      
      if (search) params.search = search;
      if (type) params.type = type;
      if (category) params.category = category;
      if (asofDate) params.asofDate = asofDate;
      
      const response = await fundService.getAllFunds(params);
      const { data, meta } = response.data;
      return { data, pagination: meta?.pagination, asofDate: meta?.asofDate };
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export default useFunds;
