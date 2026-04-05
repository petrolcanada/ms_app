import { useQuery } from '@tanstack/react-query';
import { fundService } from '../services/api';

const ALL_DOMAINS = ['basicInfo', 'performance', 'rankings', 'fees', 'ratings', 'risk', 'flows', 'assets'];

/**
 * Fetches multiple domain datasets for a single fund.
 * When asofDate is omitted the server auto-resolves to the latest
 * monthenddate available in the performance table.
 */
export const useDomains = (fundId, { domains = ALL_DOMAINS, asofDate } = {}) => {
  return useQuery({
    queryKey: ['domains', fundId, domains, asofDate],
    queryFn: async () => {
      const response = await fundService.fetchMultipleDomains(domains, [fundId], asofDate);
      const funds = response.data?.data || [];
      return funds[0] || {};
    },
    enabled: !!fundId && domains.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export default useDomains;
