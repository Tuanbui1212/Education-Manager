import { useState, useEffect, useCallback } from 'react';
import { cashbookService } from '../services/cashbook.service';

// ==================== TYPES ====================

export type CashbookTabType = 'ALL' | 'IN' | 'OUT';
export type DateRangeType = 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'custom';
export type PaymentMethodType = 'CASH' | 'TRANSFER' | 'CARD';
export type TransactionType = 'IN' | 'OUT' | 'REFUND';

export interface ICashbookRecord {
  _id: string;
  code: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  createdAt: string;
  creatorName: string;
}

export interface ICashbookSummary {
  totalIn: number;
  totalOut: number;
  totalRefund: number;
  balance: number;
}

export interface ICashbookFilters {
  type: CashbookTabType;
  dateRange: DateRangeType;
  fromDate: string;
  toDate: string;
  search: string;
  page: number;
  limit: number;
}

interface ICashbookState {
  data: ICashbookRecord[];
  summary: ICashbookSummary;
  totalCount: number;
  totalPages: number;
  loading: boolean;
  loadingSummary: boolean;
  error: string | null;
}

// ==================== HELPERS ====================

const getDateRange = (range: DateRangeType): { fromDate: string; toDate: string } => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  switch (range) {
    case 'this_month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { fromDate: toISO(from), toDate: toISO(to) };
    }
    case 'last_month': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { fromDate: toISO(from), toDate: toISO(to) };
    }
    case 'this_quarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      const from = new Date(now.getFullYear(), quarter * 3, 1);
      const to = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      return { fromDate: toISO(from), toDate: toISO(to) };
    }
    case 'this_year': {
      const from = new Date(now.getFullYear(), 0, 1);
      const to = new Date(now.getFullYear(), 11, 31);
      return { fromDate: toISO(from), toDate: toISO(to) };
    }
    default:
      return { fromDate: '', toDate: '' };
  }
};

// ==================== HOOK ====================

const DEFAULT_FILTERS: ICashbookFilters = {
  type: 'ALL',
  dateRange: 'this_month',
  ...getDateRange('this_month'),
  search: '',
  page: 1,
  limit: 10,
};

const DEFAULT_SUMMARY: ICashbookSummary = {
  totalIn: 0,
  totalOut: 0,
  totalRefund: 0,
  balance: 0,
};

export const useCashbook = () => {
  const [filters, setFilters] = useState<ICashbookFilters>(DEFAULT_FILTERS);
  const [state, setState] = useState<ICashbookState>({
    data: [],
    summary: DEFAULT_SUMMARY,
    totalCount: 0,
    totalPages: 1,
    loading: false,
    loadingSummary: false,
    error: null,
  });

  // ── Fetch data + summary song song ──
  const fetchAll = useCallback(async (f: ICashbookFilters) => {
    setState((prev) => ({ ...prev, loading: true, loadingSummary: true, error: null }));

    try {
      const params = {
        ...(f.type !== 'ALL' && { type: f.type }),
        ...(f.fromDate && { fromDate: f.fromDate }),
        ...(f.toDate && { toDate: f.toDate }),
        ...(f.search && { search: f.search }),
        page: f.page,
        limit: f.limit,
      };

      const summaryParams = {
        ...(f.fromDate && { fromDate: f.fromDate }),
        ...(f.toDate && { toDate: f.toDate }),
      };

      const [cashbookRes, summaryRes] = await Promise.all([
        cashbookService.getCashbook(params),
        cashbookService.getSummary(summaryParams),
      ]);

      setState((prev) => ({
        ...prev,
        data: cashbookRes.data,
        totalCount: cashbookRes.totalCount,
        totalPages: cashbookRes.totalPages,
        summary: summaryRes.data,
        loading: false,
        loadingSummary: false,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        loadingSummary: false,
        error: err?.message || 'Có lỗi xảy ra khi tải dữ liệu',
      }));
    }
  }, []);

  useEffect(() => {
    fetchAll(filters);
  }, [filters, fetchAll]);

  // ── Setters ──

  const setTab = useCallback((type: CashbookTabType) => {
    setFilters((prev) => ({ ...prev, type, page: 1 }));
  }, []);

  const setDateRange = useCallback((dateRange: DateRangeType) => {
    if (dateRange === 'custom') {
      setFilters((prev) => ({ ...prev, dateRange }));
      return;
    }
    const { fromDate, toDate } = getDateRange(dateRange);
    setFilters((prev) => ({ ...prev, dateRange, fromDate, toDate, page: 1 }));
  }, []);

  const setCustomDates = useCallback((fromDate: string, toDate: string) => {
    setFilters((prev) => ({ ...prev, fromDate, toDate, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const refetch = useCallback(() => {
    fetchAll(filters);
  }, [filters, fetchAll]);

  return {
    // State
    data: state.data,
    summary: state.summary,
    totalCount: state.totalCount,
    totalPages: state.totalPages,
    loading: state.loading,
    loadingSummary: state.loadingSummary,
    error: state.error,

    // Filters
    filters,

    // Actions
    setTab,
    setDateRange,
    setCustomDates,
    setSearch,
    setPage,
    setLimit,
    refetch,
  };
};
