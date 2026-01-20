import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

// Default categories to use as fallback when API fails or while loading
const DEFAULT_CATEGORIES = [
  'Alternative',
  'Balanced',
  'Canadian Equity',
  'Canadian Fixed Income',
  'Global Equity',
  'Global Fixed Income',
  'International Equity',
  'Money Market',
  'Specialty',
  'US Equity',
];

/**
 * Custom hook for fetching category names from the API
 * Categories are cached indefinitely since they rarely change
 * Falls back to default categories on error
 * @returns {Object} React Query result with categories data, loading, and error states
 */
export const useCategories = () => {
  const query = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/api/categories');
      return response.data.data;
    },
    staleTime: Infinity, // Categories don't change frequently
    cacheTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 1, // Only retry once on failure
    onError: (error) => {
      console.error('Failed to fetch categories:', error);
    },
    placeholderData: DEFAULT_CATEGORIES, // Use defaults while loading
    useErrorBoundary: false, // Don't throw errors to error boundary
  });

  // Return default categories on error as fallback
  return {
    ...query,
    data: query.isError ? DEFAULT_CATEGORIES : (query.data || DEFAULT_CATEGORIES),
  };
};

export default useCategories;
