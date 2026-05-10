import React, { useState, useMemo } from 'react';
import { Search, Download, Plus, ArrowUpRight, ArrowDownRight, RefreshCcw, Calendar } from 'lucide-react';

import { formatCurrency, formatDate } from '../../../../utils/format.util';
import Button from '../../../../components/Button';
import PageHeader from '../../../../components/PageHeader';
import TablePagination from '../../../../components/TablePagination';
import CreateVoucherModal from './CreateVoucherModal';

import { type TransactionType, type DateRangeType } from '../../../../hooks/useCashbook';
import useFetch from '../../../../hooks/useFetch';
import { cashbookService } from '../../../../services/cashbook.service';
import { PATHS } from '../../../../utils/constants';

import { useNavigate } from 'react-router-dom';

// ==================== HELPERS ====================

const renderTypeBadge = (type: TransactionType) => {
  switch (type) {
    case 'IN':
      return (
        <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
          <ArrowUpRight size={14} /> Phiếu Thu
        </span>
      );
    case 'OUT':
      return (
        <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
          <ArrowDownRight size={14} /> Phiếu Chi
        </span>
      );
    case 'REFUND':
      return (
        <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
          <RefreshCcw size={14} /> Hoàn Tiền
        </span>
      );
    default:
      return null;
  }
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Tiền mặt',
  TRANSFER: 'Chuyển khoản',
  CARD: 'Quẹt thẻ',
};

const DATE_RANGE_OPTIONS: { value: DateRangeType; label: string }[] = [
  { value: 'this_month', label: 'Tháng này' },
  { value: 'last_month', label: 'Tháng trước' },
  { value: 'this_quarter', label: 'Quý này' },
  { value: 'this_year', label: 'Năm nay' },
  { value: 'custom', label: 'Tùy chỉnh...' },
  { value: 'all', label: 'Tất cả' },
];

const CashbookManagement = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>('this_month');
  const [type, setTab] = useState('ALL');
  const [customDates, setCustomDates] = useState<[string, string]>(['', '']);
  const [fromDate, toDate] = customDates;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [search, setSearch] = useState('');

  const range = useMemo(() => {
    const now = new Date();

    switch (dateRange) {
      case 'this_month':
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          endDate: new Date().toISOString(),
        };

      case 'last_month':
        return {
          startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
          endDate: new Date(now.getFullYear(), now.getMonth(), 0).toISOString(),
        };

      case 'this_quarter':
        return {
          startDate: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).toISOString(),
          endDate: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0).toISOString(),
        };

      case 'this_year':
        return {
          startDate: new Date(now.getFullYear(), 0, 1).toISOString(),
          endDate: new Date(now.getFullYear(), 11, 31).toISOString(),
        };

      case 'custom':
        if (!fromDate || !toDate) return null;
        return {
          startDate: new Date(fromDate).toISOString(),
          endDate: new Date(toDate).toISOString(),
        };
      case 'all':
        return {
          startDate: '',
          endDate: '',
        };
      default:
        return null;
    }
  }, [dateRange, fromDate, toDate]);

  const queryParams = {
    page,
    limit,
    type,
    startDate: range?.startDate,
    endDate: range?.endDate,
    search,
  };

  const { data, loading, error, refetch, totalCount } = useFetch(cashbookService.getCashBook, queryParams, [
    page,
    limit,
    type,
    dateRange,
    search,
    fromDate,
    toDate,
  ]);

  const totalPages = Math.ceil(totalCount / queryParams.limit);

  const handleNavigate = (item: any) => {
    if (item.type === 'IN') {
      return navigate(PATHS.FINANCE_TRANSACTIONS_ID.replace(':id', item._id) + '?type=IN&table=transaction');
    } else if (item.type === 'OUT' && item.invoiceId?.status === 'REFUNDED') {
      return navigate(PATHS.FINANCE_TRANSACTIONS_ID.replace(':id', item._id) + '?type=OUT&table=transaction');
    }

    return navigate(PATHS.FINANCE_TRANSACTIONS_ID.replace(':id', item._id) + '?type=OUT&table=expenditure');
  };

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen bg-gray-50/50">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <PageHeader title="Lịch sử giao dịch" />
        <div className="flex gap-3">
          <Button variant="outline" icon={<Download size={18} />} className="bg-white">
            Xuất Báo cáo
          </Button>
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
            Tạo Phiếu Thủ Công
          </Button>
        </div>
      </div>

      {/* ===== TABS & TOOLBAR ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-gray-50 rounded-xl w-fit border border-gray-100">
            {(['ALL', 'IN', 'OUT'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setTab(tab);
                  setPage(1);
                }}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                  type === tab
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200/50'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab === 'ALL' ? 'Tất cả' : tab === 'IN' ? 'Phiếu Thu' : 'Phiếu Chi'}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-3">
            {/* Date range */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <Calendar size={18} className="text-gray-400" />
              <select
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value as DateRangeType);
                  setPage(1);
                }}
              >
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom date range */}
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  value={fromDate}
                  onChange={(e) => setCustomDates([e.target.value, toDate])}
                />
                <span className="text-gray-400 text-sm">→</span>
                <input
                  type="date"
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  value={toDate}
                  onChange={(e) => setCustomDates([fromDate, e.target.value])}
                />
              </div>
            )}

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm mã phiếu, nội dung..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== BẢNG DỮ LIỆU ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Thời gian</th>
                <th className="p-4 font-semibold">Mã Phiếu</th>
                <th className="p-4 font-semibold">Loại</th>
                <th className="p-4 font-semibold w-1/3">Nội dung</th>
                <th className="p-4 font-semibold text-right">Số tiền (VNĐ)</th>
                <th className="p-4 font-semibold text-center">Hình thức</th>
                <th className="p-4 font-semibold text-center">Người lập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data?.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 text-sm text-gray-600">
                      <div className="font-medium text-gray-800">{formatDate(item.createdAt)}</div>
                      <div className="text-xs text-gray-400">{item.createdAt.split('T')[1]?.substring(0, 5)}</div>
                    </td>
                    <td className="p-4 cursor-pointer" onClick={() => handleNavigate(item)}>
                      <span className="font-mono text-sm font-semibold text-blue-600 hover:text-blue-400">
                        {item.code}
                      </span>
                    </td>
                    <td className="p-4">{renderTypeBadge(item.type)}</td>
                    <td className="p-4 text-sm text-gray-600">{item.description || item.note}</td>
                    <td className="p-4 text-right">
                      <span
                        className={`font-bold text-base ${item.type === 'IN' ? 'text-emerald-600' : 'text-orange-600'}`}
                      >
                        {item.type === 'IN' ? '+' : '-'}
                        {formatCurrency(item.amount)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">
                        {PAYMENT_METHOD_LABELS[item.paymentMethod] || item.paymentMethod || 'Chuyển khoản'}
                      </span>
                    </td>
                    <td
                      onClick={() =>
                        navigate(PATHS.HR_STAFFS_ID.replace(':id', item.processedBy?._id || item.paidBy?._id))
                      }
                      className="p-4 text-center text-sm text-gray-500 cursor-pointer hover:text-blue-600"
                    >
                      {item.processedBy?.fullName || item.paidBy?.fullName}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-500 italic">
                    Không tìm thấy dữ liệu giao dịch nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination totalPages={totalPages} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
      </div>

      {/* ===== MODAL ===== */}
      <CreateVoucherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default CashbookManagement;
