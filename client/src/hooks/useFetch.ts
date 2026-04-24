import { useState, useEffect } from 'react';

export default function useFetch<T, P = unknown>(
  apiFunction: (params?: P) => Promise<{
    success: boolean;
    data?: T;
    message: string;
    totalCount?: number;
    allCount?: number;
    activeCount?: number;
    inactiveCount?: number;
    summary?: any;
  }>,
  params: P | null = null,
  dependencies: unknown[] = [],
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allCount, setAllCount] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [inactiveCount, setInactiveCount] = useState<number>(0);
  const [summary, setSummary] = useState<any>(null);

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
        if (result.allCount !== undefined) {
          setAllCount(result.allCount);
        }
        if (result.activeCount !== undefined) {
          setActiveCount(result.activeCount);
        }
        if (result.inactiveCount !== undefined) {
          setInactiveCount(result.inactiveCount);
        }
        if (result.summary !== undefined) {
          return setSummary(result.summary);
        }
      } else {
        setError(result.message);
      }
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || (err as Error).message || 'Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, totalCount, allCount, activeCount, inactiveCount, loading, error, refetch: fetchData, summary };
}
