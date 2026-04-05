import { useQuery } from '@tanstack/react-query';
import { historyService } from '../services/api';

const threeYearsAgo = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 3);
  return d.toISOString().slice(0, 10);
};

const today = () => new Date().toISOString().slice(0, 10);

export const usePerformanceHistory = (fundId, { startDate, endDate } = {}) => {
  const start = startDate || threeYearsAgo();
  const end = endDate || today();
  return useQuery({
    queryKey: ['performanceHistory', fundId, start, end],
    queryFn: async () => {
      const response = await historyService.getPerformanceHistory(fundId, start, end);
      return response.data.data;
    },
    enabled: !!fundId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
};

export const useFlowHistory = (fundId, { startDate, endDate } = {}) => {
  const start = startDate || threeYearsAgo();
  const end = endDate || today();
  return useQuery({
    queryKey: ['flowHistory', fundId, start, end],
    queryFn: async () => {
      const response = await historyService.getFlowHistory(fundId, start, end);
      return response.data.data;
    },
    enabled: !!fundId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
};

export const useAssetsHistory = (fundId, { startDate, endDate } = {}) => {
  const start = startDate || threeYearsAgo();
  const end = endDate || today();
  return useQuery({
    queryKey: ['assetsHistory', fundId, start, end],
    queryFn: async () => {
      const response = await historyService.getAssetsHistory(fundId, start, end);
      return response.data.data;
    },
    enabled: !!fundId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
};
