import { useState, useMemo, useEffect } from 'react';
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
  ArrowDownCircle,
  ArrowUpCircle,
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

// ===================== MOCK DATA =====================

const MOCK_KPI = {
  totalRevenue: 285_000_000,
  totalExpense: 162_500_000,
  netProfit: 122_500_000,
  totalDebt: 47_300_000,
  revenueGrowth: 12.4,
  expenseGrowth: 5.1,
};

const MOCK_CHART = [
  { month: 'T1', revenue: 210_000_000, expense: 140_000_000, profit: 70_000_000 },
  { month: 'T2', revenue: 195_000_000, expense: 135_000_000, profit: 60_000_000 },
  { month: 'T3', revenue: 230_000_000, expense: 148_000_000, profit: 82_000_000 },
  { month: 'T4', revenue: 255_000_000, expense: 155_000_000, profit: 100_000_000 },
  { month: 'T5', revenue: 242_000_000, expense: 150_000_000, profit: 92_000_000 },
  { month: 'T6', revenue: 270_000_000, expense: 158_000_000, profit: 112_000_000 },
  { month: 'T7', revenue: 260_000_000, expense: 152_000_000, profit: 108_000_000 },
  { month: 'T8', revenue: 285_000_000, expense: 162_500_000, profit: 122_500_000 },
  { month: 'T9', revenue: 0, expense: 0, profit: 0 },
  { month: 'T10', revenue: 0, expense: 0, profit: 0 },
  { month: 'T11', revenue: 0, expense: 0, profit: 0 },
  { month: 'T12', revenue: 0, expense: 0, profit: 0 },
];

const MOCK_TRANSACTIONS = [
  {
    _id: '1',
    code: 'TXN-001',
    date: '2026-08-15',
    studentName: 'Nguyễn Văn An',
    className: 'IELTS Advanced 01',
    amount: 8_500_000,
    paymentMethod: 'Chuyển khoản',
  },
  {
    _id: '2',
    code: 'TXN-002',
    date: '2026-08-14',
    studentName: 'Trần Thị Bình',
    className: 'TOEIC 600+ B2',
    amount: 6_200_000,
    paymentMethod: 'Tiền mặt',
  },
  {
    _id: '3',
    code: 'TXN-003',
    date: '2026-07-28',
    studentName: 'Lê Minh Cường',
    className: 'Communication Pro',
    amount: 5_000_000,
    paymentMethod: 'Chuyển khoản',
  },
  {
    _id: '4',
    code: 'TXN-004',
    date: '2026-08-12',
    studentName: 'Phạm Thị Dung',
    className: 'IELTS Starter 03',
    amount: 7_800_000,
    paymentMethod: 'Chuyển khoản',
  },
  {
    _id: '5',
    code: 'TXN-005',
    date: '2026-08-11',
    studentName: 'Hoàng Văn Em',
    className: 'TOEIC 600+ A1',
    amount: 6_200_000,
    paymentMethod: 'Tiền mặt',
  },
  {
    _id: '6',
    code: 'TXN-006',
    date: '2026-07-20',
    studentName: 'Vũ Thị Phương',
    className: 'IELTS Advanced 02',
    amount: 9_100_000,
    paymentMethod: 'Chuyển khoản',
  },
  {
    _id: '7',
    code: 'TXN-007',
    date: '2026-06-30',
    studentName: 'Đặng Quốc Tuấn',
    className: 'Business English',
    amount: 7_500_000,
    paymentMethod: 'Tiền mặt',
  },
];

const MOCK_EXPENDITURES = [
  {
    _id: 'e1',
    date: '2026-08-15',
    type: 'SALARY_TEACHER',
    receiverName: 'GV. Nguyễn Hữu Phúc',
    description: 'Lương giảng dạy T8/2026',
    amount: 22_000_000,
  },
  {
    _id: 'e2',
    date: '2026-08-15',
    type: 'SALARY_TEACHER',
    receiverName: 'GV. Trần Thị Lan',
    description: 'Lương giảng dạy T8/2026',
    amount: 18_500_000,
  },
  {
    _id: 'e3',
    date: '2026-08-10',
    type: 'SALARY_SALE',
    receiverName: 'TV. Lê Văn Hùng',
    description: 'Lương + hoa hồng T8/2026',
    amount: 12_000_000,
  },
  {
    _id: 'e4',
    date: '2026-08-01',
    type: 'OPERATION',
    receiverName: 'Công ty TNHH Điện lực',
    description: 'Tiền điện tháng 8',
    amount: 3_200_000,
  },
  {
    _id: 'e5',
    date: '2026-07-25',
    type: 'OPERATION',
    receiverName: 'Viettel Business',
    description: 'Internet + điện thoại T7',
    amount: 850_000,
  },
  {
    _id: 'e6',
    date: '2026-07-15',
    type: 'SALARY_TEACHER',
    receiverName: 'GV. Phan Minh Tuấn',
    description: 'Lương giảng dạy T7/2026',
    amount: 20_000_000,
  },
];

// ===================== HELPERS =====================

const QUICK_MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2026, i, 1);
  const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return { label: `T${d.getMonth() + 1}`, value };
});

const EXPENDITURE_TYPE_LABEL = {
  SALARY_TEACHER: 'Lương giáo viên',
  SALARY_SALE: 'Lương tư vấn',
  OPERATION: 'Chi phí vận hành',
};

const PAYMENT_METHOD_BADGE = {
  'Chuyển khoản': 'bg-blue-50 text-blue-600',
  'Tiền mặt': 'bg-amber-50 text-amber-600',
};

const formatCurrency = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatDate = (str) => {
  const d = new Date(str);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

// Filter items by month string (YYYY-MM) hoặc date range (YYYY-MM-DD)
const filterByTime = (items, { month, dateFrom, dateTo }) => {
  return items.filter((item) => {
    const d = item.date; // "YYYY-MM-DD"
    if (dateFrom && dateTo) return d >= dateFrom && d <= dateTo;
    if (dateFrom) return d >= dateFrom;
    if (dateTo) return d <= dateTo;
    if (month) return d.startsWith(month);
    return true;
  });
};

// Tính KPI từ filtered data
const calcKpi = (txs, exs) => {
  const totalRevenue = txs.reduce((s, t) => s + t.amount, 0);
  const totalExpense = exs.reduce((s, e) => s + e.amount, 0);
  return {
    totalRevenue,
    totalExpense,
    netProfit: totalRevenue - totalExpense,
    totalDebt: MOCK_KPI.totalDebt, // debt giữ nguyên mock
    revenueGrowth: null,
    expenseGrowth: null,
  };
};

// ===================== HOOK: useDelayedData =====================

// Trả về { data, loading } — loading true trong `delay` ms đầu
function useDelayedData(rawData, delay = 500) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [JSON.stringify(rawData), delay]);
  return { data: rawData, loading };
}

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

const formatYAxis = (v) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}tỷ`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}tr`;
  return `${v}`;
};

const CustomTooltip = ({ active, payload, label }) => {
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

const TopTransactions = ({ transactions, expenditures, loading, onViewAll }) => {
  const topItems = useMemo(() => {
    const inc = transactions.map((tx) => ({
      id: tx._id,
      type: 'IN',
      label: tx.studentName,
      sublabel: tx.className,
      amount: tx.amount,
      date: tx.date,
      badge: tx.paymentMethod,
    }));
    const exp = expenditures.map((ex) => ({
      id: ex._id,
      type: 'OUT',
      label: ex.receiverName,
      sublabel: EXPENDITURE_TYPE_LABEL[ex.type] || ex.type,
      amount: ex.amount,
      date: ex.date,
      badge: null,
    }));
    return [...inc, ...exp].sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [transactions, expenditures]);

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
            <div key={item.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/60 transition-colors">
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-xs font-bold text-gray-300 w-4 text-center">{idx + 1}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'IN' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'}`}
                >
                  {item.type === 'IN' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.label}</p>
                <p className="text-xs text-gray-400 truncate">
                  {item.sublabel} · {formatDate(item.date)}
                </p>
              </div>
              {item.badge && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:inline-flex ${PAYMENT_METHOD_BADGE[item.badge] || 'bg-gray-100 text-gray-500'}`}
                >
                  {item.badge}
                </span>
              )}
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
  const monthNow = new Date().getMonth() + 1;
  const yearNow = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(`${yearNow}-${monthNow.toString().padStart(2, '0')}`);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const isDateRangeActive = !!(dateFrom || dateTo);

  // Params filter
  const timeParams = useMemo(
    () => ({
      month: !dateFrom && !dateTo ? selectedMonth : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [selectedMonth, dateFrom, dateTo],
  );

  // Filtered mock data
  const filteredTx = useMemo(() => filterByTime(MOCK_TRANSACTIONS, timeParams), [timeParams]);
  const filteredEx = useMemo(() => filterByTime(MOCK_EXPENDITURES, timeParams), [timeParams]);
  const kpi = useMemo(() => calcKpi(filteredTx, filteredEx), [filteredTx, filteredEx]);

  // Delayed loading per filter change
  const { loading: kpiLoading } = useDelayedData(kpi, 500);
  const { loading: txLoading } = useDelayedData(filteredTx, 500);
  const { loading: chartLoading } = useDelayedData(MOCK_CHART, 600);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedMonth(`${yearNow}-${monthNow.toString().padStart(2, '0')}`);
  };

  const { summary: cashbookSummary, loading: cashbookLoading } = useFetch(
    cashbookService.getCashBook,
    { month: selectedMonth },
    [selectedMonth],
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
            {QUICK_MONTHS.map((m) => (
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
              className={`px-3 py-1.5 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${isDateRangeActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}
            />
            <span className="text-gray-400 text-sm">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Tổng Doanh Thu"
          value={cashbookLoading ? '—' : formatCurrency(cashbookSummary.totalIn)}
          growth={kpi.revenueGrowth}
          subtitle="so với kỳ trước"
          icon={<TrendingUp size={18} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          valueColor="text-blue-600"
          loading={kpiLoading}
        />
        <KpiCard
          title="Tổng Chi Phí"
          value={cashbookLoading ? '—' : formatCurrency(cashbookSummary.totalOut)}
          growth={kpi.expenseGrowth}
          subtitle="lương + vận hành"
          icon={<TrendingDown size={18} />}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          valueColor="text-orange-600"
          loading={kpiLoading}
        />
        <KpiCard
          title="Lợi Nhuận Ròng"
          value={cashbookLoading ? '—' : formatCurrency(cashbookSummary.balance)}
          icon={<DollarSign size={18} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          valueColor="text-emerald-600"
          loading={kpiLoading}
        />
        <KpiCard
          title="Công Nợ Còn Lại"
          value={cashbookLoading ? '—' : formatCurrency(cashbookSummary.totalDebt)}
          subtitle="chưa thu"
          icon={<AlertTriangle size={18} />}
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
          valueColor="text-rose-600"
          loading={kpiLoading}
        />
      </div>

      {/* Chart */}
      <ReportChart data={MOCK_CHART} loading={chartLoading} />

      {/* Top Transactions */}
      <TopTransactions
        transactions={filteredTx}
        expenditures={filteredEx}
        loading={txLoading}
        onViewAll={() => alert('Điều hướng tới sổ quỹ')}
      />
    </div>
  );
}
