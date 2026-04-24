// pages/finance/report/FinancialReport.tsx
import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CalendarDays } from 'lucide-react';

import PageHeader from '../../../../components/PageHeader';

import KpiCard from './components/KpiCard';
import ReportChart from './components/ReportChart';
import TransactionTable from './components/TransactionTable';

import useFetch from '../../../../hooks/useFetch';
import useDebounce from '../../../../hooks/useDebounce';
import { reportService } from '../../../../services/report.service';
import type { IKpiSummary, IChartDataPoint, ITransaction, IExpenditure } from '../../../../services/report.service';
import { formatCurrency } from '../../../../utils/format.util';

// ---- Helper: tạo danh sách tháng nhanh ----
const QUICK_MONTHS = Array.from({ length: 8 }, (_, i) => {
  const d = new Date(2026, i, 1);
  const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return { label: `T${d.getMonth() + 1}`, value };
});

const FinancialReport = () => {
  // ---- Bộ lọc thời gian ----
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ---- Pagination bảng ----
  const [txPage, setTxPage] = useState(1);
  const [exPage, setExPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debouncedDateFrom = useDebounce(dateFrom, 500);
  const debouncedDateTo = useDebounce(dateTo, 500);

  // Params chung cho KPI + bảng
  const timeParams = useMemo(
    () => ({
      month: !debouncedDateFrom && !debouncedDateTo ? selectedMonth : undefined,
      dateFrom: debouncedDateFrom || undefined,
      dateTo: debouncedDateTo || undefined,
    }),
    [selectedMonth, debouncedDateFrom, debouncedDateTo],
  );

  // ---- Fetch KPI summary ----
  // useFetch trả { data: IServiceResponse<T> } — lấy .data để ra payload thực
  const { data: kpiRes, loading: kpiLoading } = useFetch(reportService.getSummary, timeParams, [
    timeParams.month,
    timeParams.dateFrom,
    timeParams.dateTo,
  ]);
  const kpi = (kpiRes as any)?.data as IKpiSummary | null;

  console.log(kpi);

  // ---- Fetch Chart data (luôn load cả năm) ----
  const { data: chartRes, loading: chartLoading } = useFetch(reportService.getChartData, { year: '2026' }, ['2026']);
  const chartData = (chartRes as any)?.data as IChartDataPoint[] | null;

  // ---- Fetch Transactions ----
  const { data: txRes, loading: txLoading } = useFetch(
    reportService.getTransactions,
    { ...timeParams, page: txPage, limit },
    [timeParams.month, timeParams.dateFrom, timeParams.dateTo, txPage, limit],
  );
  const txData = (txRes as any)?.data as ITransaction[] | null;
  const txTotal = ((txRes as any)?.totalCount as number) || 0;

  // ---- Fetch Expenditures ----
  const { data: exRes, loading: exLoading } = useFetch(
    reportService.getExpenditures,
    { ...timeParams, page: exPage, limit },
    [timeParams.month, timeParams.dateFrom, timeParams.dateTo, exPage, limit],
  );
  const exData = (exRes as any)?.data as IExpenditure[] | null;
  const exTotal = ((exRes as any)?.totalCount as number) || 0;

  const isDateRangeActive = !!(debouncedDateFrom || debouncedDateTo);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedMonth('2026-08');
  };

  return (
    <div className="p-8 w-full space-y-6">
      <PageHeader title="Báo cáo Tài chính" />

      {/* ---- Bộ lọc thời gian ---- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-4">
          {/* Quick month buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <CalendarDays size={13} /> Tháng nhanh
            </span>
            {QUICK_MONTHS.map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  setSelectedMonth(m.value);
                  setDateFrom('');
                  setDateTo('');
                  setTxPage(1);
                  setExPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  selectedMonth === m.value && !isDateRangeActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 hidden sm:block" />

          {/* Date range inputs */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Khoảng tùy chọn</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setTxPage(1);
                setExPage(1);
              }}
              className={`px-3 py-1.5 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${isDateRangeActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}
            />
            <span className="text-gray-400 text-sm">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setTxPage(1);
                setExPage(1);
              }}
              className={`px-3 py-1.5 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${isDateRangeActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}
            />
            {isDateRangeActive && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---- KPI Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Tổng Doanh Thu"
          value={kpi ? formatCurrency(kpi.totalRevenue) : '—'}
          growth={kpi?.revenueGrowth}
          subtitle="so với kỳ trước"
          icon={<TrendingUp size={18} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          valueColor="text-blue-600"
          loading={kpiLoading}
        />
        <KpiCard
          title="Tổng Chi Phí"
          value={kpi ? formatCurrency(kpi.totalExpense) : '—'}
          growth={kpi?.expenseGrowth}
          subtitle="lương + vận hành"
          icon={<TrendingDown size={18} />}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          valueColor="text-orange-600"
          loading={kpiLoading}
        />
        <KpiCard
          title="Lợi Nhuận Ròng"
          value={kpi ? formatCurrency(kpi.netProfit) : '—'}
          icon={<DollarSign size={18} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          valueColor="text-emerald-600"
          loading={kpiLoading}
        />
        <KpiCard
          title="Công Nợ Còn Lại"
          value={kpi ? formatCurrency(kpi.totalDebt) : '—'}
          subtitle="chưa thu"
          icon={<AlertTriangle size={18} />}
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
          valueColor="text-rose-600"
          loading={kpiLoading}
        />
      </div>

      {/* ---- Charts ---- */}
      <ReportChart data={chartData || []} loading={chartLoading} />

      {/* ---- Transaction Table ---- */}
      <TransactionTable
        transactions={txData || []}
        expenditures={exData || []}
        txPage={txPage}
        setTxPage={setTxPage}
        exPage={exPage}
        setExPage={setExPage}
        txTotal={txTotal}
        exTotal={exTotal}
        limit={limit}
        setLimit={setLimit}
        loading={txLoading || exLoading}
      />
    </div>
  );
};

export default FinancialReport;
