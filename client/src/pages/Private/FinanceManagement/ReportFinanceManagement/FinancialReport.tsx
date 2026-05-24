import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Minus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useFetch from '../../../../hooks/useFetch';
import { cashbookService } from '../../../../services/cashbook.service';
import { formatCurrency } from '../../../../utils/format.util';
import { PATHS } from '../../../../utils/constants';

// ===================== HELPERS =====================

// FIX Bug 4: QUICK_MONTHS nhận year động, không hardcode 2026
const getQuickMonths = (year: number) =>
  Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { label: `T${d.getMonth() + 1}`, value };
  });

const EXPENDITURE_TYPE_LABEL: Record<string, string> = {
  SALARY_TEACHER: 'Lương giáo viên',
  SALARY_SALE: 'Lương tư vấn',
  OPERATION: 'Chi phí vận hành',
};

const PAYMENT_METHOD_BADGE: Record<string, string> = {
  TRANSFER: 'bg-blue-50 text-blue-600',
  CASH: 'bg-amber-50 text-amber-600',
  CARD: 'bg-violet-50 text-violet-600',
  VNPAY: 'bg-emerald-50 text-emerald-600',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Tiền mặt',
  TRANSFER: 'Chuyển khoản',
  CARD: 'Quẹt thẻ',
  VNPAY: 'VNPAY',
};

// ===================== KpiCard =====================

const KpiCard = ({
  title,
  value,
  growth,
  icon,
  iconBg,
  iconColor,
  valueColor = 'text-gray-900',
  subtitle,
  loading,
}: {
  title: string;
  value: string;
  growth: number | null | undefined;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  subtitle?: string;
  loading: boolean;
}) => {
  const renderGrowth = () => {
    if (growth === undefined || growth === null) return null;
    if (growth > 0)
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <TrendingUp size={12} /> +{growth}%
        </span>
      );
    if (growth < 0)
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
          <TrendingDown size={12} /> {growth}%
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
        <Minus size={12} /> 0%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-7 w-36 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-20 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor}`}>{icon}</div>
      </div>
      <p className={`text-2xl font-bold tracking-tight mb-2 ${valueColor}`}>{value}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {renderGrowth()}
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>
    </div>
  );
};

// ===================== ReportChart =====================

const formatYAxis = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}tỷ`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}tr`;
  return `${v}`;
};

// FIX Bug 3: Props của CustomTooltip dùng optional types để match Recharts interface
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm min-w-[180px]">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex justify-between gap-4 mb-1">
          <span style={{ color: entry.color }} className="font-medium">
            {entry.name}
          </span>
          <span className="font-semibold text-gray-800">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
    <div className="h-[220px] bg-gray-100 rounded-xl" />
  </div>
);

const ReportChart = ({ data, loading }: { data: any[]; loading: boolean }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <ChartSkeleton />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-800 mb-1">So sánh Thu nhập & Chi phí</p>
        <p className="text-xs text-gray-400 mb-4">Theo từng tháng trong năm</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barCategoryGap="30%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span className="text-xs text-gray-500">{v}</span>}
            />
            <Bar dataKey="revenue" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Chi phí" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-800 mb-1">Xu hướng Lợi nhuận</p>
        <p className="text-xs text-gray-400 mb-4">Lợi nhuận ròng qua các tháng</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span className="text-xs text-gray-500">{v}</span>}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="Lợi nhuận"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Doanh thu"
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ===================== TopTransactions =====================

const TopTransactions = ({
  topItems,
  loading,
  onViewAll,
}: {
  topItems: any[];
  loading: boolean;
  onViewAll: () => void;
}) => {
  const navigate = useNavigate();
  const handleNavigate = (item: any) => {
    if (item.type === 'IN') {
      return navigate(PATHS.FINANCE_TRANSACTIONS_ID.replace(':id', item._id) + '?type=IN&table=transaction');
    } else if (item.type === 'OUT' && item.invoiceId?.status === 'REFUNDED') {
      return navigate(PATHS.FINANCE_TRANSACTIONS_ID.replace(':id', item._id) + '?type=OUT&table=transaction');
    }

    return navigate(PATHS.FINANCE_TRANSACTIONS_ID.replace(':id', item._id) + '?type=OUT&table=expenditure');
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-800">Giao dịch lớn nhất kỳ này</p>
          <p className="text-xs text-gray-400 mt-0.5">Top 5 theo giá trị</p>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          Xem toàn bộ sổ quỹ <ChevronRight size={14} />
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          ))
        ) : topItems.length > 0 ? (
          topItems.map((item, idx) => (
            <div key={item._id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/60 transition-colors">
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-xs font-bold text-gray-300 w-4 text-center">{idx + 1}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.type === 'IN' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'
                  }`}
                >
                  {item.type === 'IN' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {item.processedBy?.fullName || item.paidBy?.fullName}{' '}
                  {item.code && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(item);
                      }}
                      className="text-[11px] font-mono font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      #{item.code}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400 truncate">{item.description || item.note}</p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:inline-flex ${
                  PAYMENT_METHOD_BADGE[item.paymentMethod] || 'bg-blue-50 text-blue-600'
                }`}
              >
                {PAYMENT_METHOD_LABELS[item.paymentMethod] || item.paymentMethod || 'Chuyển khoản'}
              </span>
              <span
                className={`text-sm font-bold shrink-0 ${item.type === 'IN' ? 'text-emerald-600' : 'text-orange-600'}`}
              >
                {item.type === 'IN' ? '+' : '-'}
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">Không có dữ liệu giao dịch trong kỳ này.</div>
        )}
      </div>
    </div>
  );
};

// ===================== MAIN PAGE =====================

export default function FinancialReport() {
  const navigate = useNavigate();

  const monthNow = new Date().getMonth() + 1;
  const yearNow = new Date().getFullYear();

  const quickMonths = getQuickMonths(yearNow);

  const [selectedMonth, setSelectedMonth] = useState(`${yearNow}-${monthNow.toString().padStart(2, '0')}`);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  console.log(selectedMonth);

  const isDateRangeActive = !!(dateFrom || dateTo);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedMonth(`${yearNow}-${monthNow.toString().padStart(2, '0')}`);
  };

  const { summary: cashbookSummary, loading: cashbookLoading } = useFetch(
    cashbookService.getCashBook,
    isDateRangeActive ? { startDate: dateFrom, endDate: dateTo } : { month: selectedMonth },
    [selectedMonth, dateFrom, dateTo],
  );

  const { data: kpiData, loading: kpiDataLoading } = useFetch(
    cashbookService.getCashBookYearlySummary,
    { year: yearNow },
    [yearNow],
  );

  return (
    <div className="p-8 w-full space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo Tài chính</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tổng quan doanh thu, chi phí và lợi nhuận</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <CalendarDays size={13} /> Tháng nhanh
            </span>
            {/* FIX Bug 4: Dùng quickMonths thay vì QUICK_MONTHS hardcode */}
            {quickMonths.map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  setSelectedMonth(m.value);
                  setDateFrom('');
                  setDateTo('');
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

          <div className="w-px h-8 bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Khoảng tùy chọn</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`px-3 py-1.5 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
                isDateRangeActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              }`}
            />
            <span className="text-gray-400 text-sm">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`px-3 py-1.5 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
                isDateRangeActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              }`}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Tổng Doanh Thu"
          value={cashbookLoading ? '—' : formatCurrency(cashbookSummary?.totalIn ?? 0)}
          growth={cashbookSummary?.revenueGrowthPercent ?? null}
          subtitle="so với kỳ trước"
          icon={<TrendingUp size={18} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          valueColor="text-blue-600"
          loading={cashbookLoading}
        />
        <KpiCard
          title="Tổng Chi Phí"
          value={
            cashbookLoading
              ? '—'
              : formatCurrency((cashbookSummary?.totalOut ?? 0) + (cashbookSummary?.totalRefund ?? 0))
          }
          growth={cashbookSummary?.expenseGrowthPercent ?? null}
          subtitle="lương + vận hành"
          icon={<TrendingDown size={18} />}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          valueColor="text-orange-600"
          loading={cashbookLoading}
        />
        <KpiCard
          title="Lợi Nhuận Ròng"
          value={cashbookLoading ? '—' : formatCurrency(cashbookSummary?.balance ?? 0)}
          growth={cashbookSummary?.profitGrowthPercent ?? null}
          icon={<DollarSign size={18} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          valueColor="text-emerald-600"
          loading={cashbookLoading}
        />
        <KpiCard
          title="Công Nợ Còn Lại"
          value={cashbookLoading ? '—' : formatCurrency(cashbookSummary?.totalDebt ?? 0)}
          growth={null}
          subtitle="chưa thu"
          icon={<AlertTriangle size={18} />}
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
          valueColor="text-rose-600"
          loading={cashbookLoading}
        />
      </div>

      {/* Chart */}
      <ReportChart data={kpiData || []} loading={kpiDataLoading} />

      {/* Top Transactions */}
      <TopTransactions
        topItems={cashbookSummary?.top5Amounts || []}
        loading={cashbookLoading}
        onViewAll={() => navigate(PATHS.FINANCE_TRANSACTIONS)}
      />
    </div>
  );
}
