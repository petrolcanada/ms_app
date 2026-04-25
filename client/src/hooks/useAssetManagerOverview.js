import { useQuery } from '@tanstack/react-query';
import { assetManagerService } from '../services/api';

export const useAssetManagerOverview = (assetManager, asofDate) => {
  return useQuery({
    queryKey: ['assetManagerOverview', assetManager, asofDate],
    queryFn: async () => {
      const params = {};
      if (asofDate) params.asofDate = asofDate;
      const response = await assetManagerService.getAssetManagerOverview(assetManager, params);
      return response.data.data;
    },
    enabled: Boolean(assetManager),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export default useAssetManagerOverview;
