import { useState, useEffect } from 'react';

export default function useFetch<T, P = unknown>(
  apiFunction: (params?: P) => Promise<{ success: boolean; data?: T; message: string; totalCount?: number }>,
  params: P | null = null,
  dependencies: unknown[] = [],
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(params as P);
      if (result.success) {
        setData(result.data);
        if (result.totalCount !== undefined) {
          setTotalCount(result.totalCount);
        }
      } else {
        setError(result.message);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, totalCount, loading, error, refetch: fetchData };
}
