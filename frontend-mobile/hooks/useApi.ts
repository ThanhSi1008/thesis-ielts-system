/**
 * useApi - Custom hook for API data fetching with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiResult<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
}

export function useApi<T>(
  fetchFn: () => Promise<T>,
  dependencies: unknown[] = []
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await fetchFn();
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setState({ data: null, loading: false, error: message });
    }
  }, [fetchFn]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    ...state,
    refetch: fetchData,
  };
}

export default useApi;
