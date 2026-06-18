import { useApi } from './useApi';

export function useQuery<T>(
  fetcher: () => Promise<{ data: { data: T } }>,
  deps: unknown[] = []
) {
  const { data, loading, error, refetch } = useApi(
    async () => {
      const result = await fetcher();
      return result?.data?.data || result?.data || result || null;
    },
    deps as any[]
  );

  return { 
    data, 
    isLoading: loading, 
    error, 
    refetch 
  };
}
