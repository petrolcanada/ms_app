import { useQuery } from '@tanstack/react-query';
import { assetManagerService } from '../services/api';

export const useAssetManagers = () => {
  return useQuery({
    queryKey: ['assetManagers'],
    queryFn: async () => {
      const response = await assetManagerService.getAssetManagers();
      return response.data.data;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    retry: 1,
    placeholderData: [],
  });
};

export default useAssetManagers;
