import { useState, useCallback } from 'react';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
  success: boolean;
}

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  onFinally?: () => void;
}

export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (
      apiCall: () => Promise<ApiResponse<T>>,
      options?: UseApiOptions<T>
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiCall();

        if (response.error) {
          setError(response.error);
          options?.onError?.(response.error);
          return { data: null, error: response.error };
        }

        setData(response.data ?? null);
        options?.onSuccess?.(response.data as T);
        return { data: response.data, error: null };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        options?.onError?.(errorMessage);
        return { data: null, error: errorMessage };
      } finally {
        setLoading(false);
        options?.onFinally?.();
      }
    },
    []
  );

  return {
    data,
    loading,
    error,
    execute,
    setData,
    setError,
    reset: () => {
      setData(null);
      setLoading(false);
      setError(null);
    },
  };
}
