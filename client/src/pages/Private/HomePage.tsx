import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  DollarSign,
  FileText,
  PlusCircle,
  CreditCard,
  UserPlus,
  CalendarDays,
  Bell,
  Wallet,
  MapPin,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type PaymentMethod = 'CASH' | 'TRANSFER' | 'MOMO';
type ScheduleStatus = 'ongoing' | 'upcoming' | 'done';

interface Stats {
  totalStudents: number;
  totalClasses: number;
  monthlyRevenue: number;
  pendingInvoices: number;
}

interface Transaction {
  code: string;
  processedBy: { fullName: string };
  amount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

interface Debtor {
  id: number;
  name: string;
  className: string;
  debt: number;
  dueDate: string;
  overdueDays: number;
}

interface ScheduleSession {
  id: number;
  time: string;
  className: string;
  room: string;
  teacher: string;
  students: number;
  status: ScheduleStatus;
}

interface ActionItem {
  label: string;
  icon: LucideIcon;
  hover: string;
  path: string;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_STATS: Stats = {
  totalStudents: 142,
  totalClasses: 18,
  monthlyRevenue: 45_500_000,
  pendingInvoices: 7,
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    code: 'GD-0091',
    processedBy: { fullName: 'Nguyễn Văn An' },
    amount: 2_500_000,
    paymentMethod: 'CASH',
    createdAt: '29/04/2024',
  },
  {
    code: 'GD-0090',
    processedBy: { fullName: 'Trần Thị Bình' },
    amount: 1_800_000,
    paymentMethod: 'TRANSFER',
    createdAt: '28/04/2024',
  },
  {
    code: 'GD-0089',
    processedBy: { fullName: 'Lê Hoàng Cường' },
    amount: 3_200_000,
    paymentMethod: 'CASH',
    createdAt: '28/04/2024',
  },
  {
    code: 'GD-0088',
    processedBy: { fullName: 'Phạm Minh Đức' },
    amount: 900_000,
    paymentMethod: 'TRANSFER',
    createdAt: '27/04/2024',
  },
  {
    code: 'GD-0087',
    processedBy: { fullName: 'Hoàng Thị Emy' },
    amount: 4_500_000,
    paymentMethod: 'MOMO',
    createdAt: '26/04/2024',
  },
];

const MOCK_DEBTORS: Debtor[] = [
  { id: 1, name: 'Nguyễn Bảo Châu', className: 'Toán K5', debt: 3_000_000, dueDate: '15/04', overdueDays: 14 },
  { id: 2, name: 'Trần Quốc Hùng', className: 'Anh Văn K3', debt: 1_800_000, dueDate: '18/04', overdueDays: 11 },
  { id: 3, name: 'Lê Thị Hoa', className: 'Lý Nâng Cao', debt: 2_500_000, dueDate: '20/04', overdueDays: 9 },
  { id: 4, name: 'Đinh Văn Khoa', className: 'Hóa K4', debt: 900_000, dueDate: '22/04', overdueDays: 7 },
  { id: 5, name: 'Vũ Ngọc Lan', className: 'Văn K2', debt: 1_200_000, dueDate: '25/04', overdueDays: 4 },
];

const MOCK_SCHEDULE: ScheduleSession[] = [
  {
    id: 1,
    time: '07:30 – 09:00',
    className: 'Toán Nâng Cao K5',
    room: 'P.101',
    teacher: 'Cô Nguyễn Lan',
    students: 18,
    status: 'ongoing',
  },
  {
    id: 2,
    time: '09:15 – 10:45',
    className: 'Anh Văn Giao Tiếp K3',
    room: 'P.203',
    teacher: 'Thầy Minh Tuấn',
    students: 22,
    status: 'upcoming',
  },
  {
    id: 3,
    time: '13:00 – 14:30',
    className: 'Vật Lý Cơ Bản K4',
    room: 'P.102',
    teacher: 'Thầy Đức Anh',
    students: 15,
    status: 'upcoming',
  },
  {
    id: 4,
    time: '15:00 – 16:30',
    className: 'Hóa Học K3',
    room: 'P.204',
    teacher: 'Cô Thu Hằng',
    students: 20,
    status: 'upcoming',
  },
];

// ─── CONFIGS ──────────────────────────────────────────────────────────────────

const PAYMENT_CONFIG: Record<PaymentMethod, { label: string; className: string }> = {
  CASH: { label: 'Tiền mặt', className: 'bg-green-100 text-green-700' },
  TRANSFER: { label: 'Chuyển khoản', className: 'bg-blue-100 text-blue-700' },
  MOMO: { label: 'MoMo', className: 'bg-pink-100 text-pink-700' },
};

const STATUS_CONFIG: Record<ScheduleStatus, { label: string; className: string; dot: string }> = {
  ongoing: { label: 'Đang học', className: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  upcoming: { label: 'Sắp tới', className: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  done: { label: 'Đã xong', className: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
};

const ACTION_ITEMS: ActionItem[] = [
  {
    label: 'Thêm học sinh mới',
    icon: UserPlus,
    hover: 'hover:bg-blue-50 hover:text-blue-600',
    path: 'TRAINING_STUDENT_CREATE',
  },
  {
    label: 'Mở lớp học mới',
    icon: PlusCircle,
    hover: 'hover:bg-green-50 hover:text-green-600',
    path: 'TRAINING_CLASSES',
  },
  {
    label: 'Lập hóa đơn thu tiền',
    icon: CreditCard,
    hover: 'hover:bg-purple-50 hover:text-purple-600',
    path: 'FINANCE_INVOICE_CREATE',
  },
  {
    label: 'Thêm khoản thu / chi',
    icon: Wallet,
    hover: 'hover:bg-orange-50 hover:text-orange-600',
    path: 'FINANCE_CASHBOOK_CREATE',
  },
  {
    label: 'Xếp lịch dạy',
    icon: CalendarDays,
    hover: 'hover:bg-teal-50 hover:text-teal-600',
    path: 'TRAINING_SCHEDULE',
  },
  {
    label: 'Nhắc nợ học phí (SMS)',
    icon: Bell,
    hover: 'hover:bg-red-50 hover:text-red-600',
    path: 'FINANCE_DEBT_REMIND',
  },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────

const formatCurrency = (value: number | undefined): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value ?? 0);

// ─── SKELETON ────────────────────────────────────────────────────────────────

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// ─── STEP 1: StatCard ─────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number | undefined;
  icon: LucideIcon;
  color: string;
  bg: string;
  loading: boolean;
}

const StatCard = ({ title, value, icon: Icon, color, bg, loading }: StatCardProps) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-4 rounded-full ${bg} shrink-0`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      {loading ? (
        <Skeleton className="h-7 w-24 mt-1" />
      ) : (
        <h3 className="text-xl font-bold text-gray-800 truncate">{value}</h3>
      )}
    </div>
  </div>
);

// ─── STEP 2: QuickActions ──────────────────────────────────────────────────────

interface QuickActionsProps {
  onNavigate: (path: string) => void;
}

const QuickActions = ({ onNavigate }: QuickActionsProps) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-lg font-bold text-gray-800 mb-4">Thao tác nhanh</h2>
    <div className="space-y-2">
      {ACTION_ITEMS.map(({ label, icon: Icon, hover, path }) => (
        <button
          key={path}
          onClick={() => onNavigate(path)}
          className={`w-full flex items-center p-3 text-sm text-gray-700 bg-gray-50 ${hover} rounded-lg transition-colors`}
        >
          <Icon className="w-4 h-4 mr-3 shrink-0" />
          {label}
        </button>
      ))}
    </div>
  </div>
);

// ─── STEP 3: RecentTransactions ───────────────────────────────────────────────

interface RecentTransactionsProps {
  data: Transaction[];
  loading: boolean;
}

const RecentTransactions = ({ data, loading }: RecentTransactionsProps) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-bold text-gray-800">Giao dịch gần đây</h2>
      <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
        Xem tất cả <ChevronRight className="w-3 h-3" />
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
            <th className="pb-3 font-medium">Mã GD</th>
            <th className="pb-3 font-medium">Người thực hiện</th>
            <th className="pb-3 font-medium">Số tiền</th>
            <th className="pb-3 font-medium">Hình thức</th>
            <th className="pb-3 font-medium">Ngày</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="py-3 pr-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            : data.map((tx, idx) => (
                <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-800">{tx.code}</td>
                  <td className="py-3 pr-4 text-gray-600">{tx.processedBy.fullName}</td>
                  <td className="py-3 pr-4 font-semibold text-gray-800">{formatCurrency(tx.amount)}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_CONFIG[tx.paymentMethod].className}`}
                    >
                      {PAYMENT_CONFIG[tx.paymentMethod].label}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{tx.createdAt}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── STEP 4: DebtList ─────────────────────────────────────────────────────────

interface DebtListProps {
  data: Debtor[];
  loading: boolean;
}

const DebtList = ({ data, loading }: DebtListProps) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-bold text-gray-800">Công nợ học phí</h2>
      <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
        Xem tất cả <ChevronRight className="w-3 h-3" />
      </button>
    </div>
    <div className="space-y-3">
      {loading
        ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
        : data.map((debtor) => (
            <div
              key={debtor.id}
              className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{debtor.name}</p>
                <p className="text-xs text-gray-500">
                  {debtor.className} · Hạn: {debtor.dueDate}
                </p>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-sm font-bold text-red-600">{formatCurrency(debtor.debt)}</p>
                <p className="text-xs text-red-400">Quá hạn {debtor.overdueDays} ngày</p>
              </div>
            </div>
          ))}
    </div>
  </div>
);

// ─── STEP 5: TeacherScheduleToday ─────────────────────────────────────────────

interface TeacherScheduleTodayProps {
  data: ScheduleSession[];
  loading: boolean;
}

const TeacherScheduleToday = ({ data, loading }: TeacherScheduleTodayProps) => {
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Lịch dạy hôm nay</h2>
          <p className="text-xs text-gray-400 mt-0.5">{today}</p>
        </div>
        <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          Xem tất cả <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          : data.map((session) => {
              const s = STATUS_CONFIG[session.status];
              return (
                <div
                  key={session.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="shrink-0 text-center min-w-[72px]">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${s.dot} ${session.status === 'ongoing' ? 'animate-pulse' : ''}`}
                      />
                      {s.label}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{session.time}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{session.className}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {session.room}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {session.students} học sinh
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{session.teacher}</p>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};

// ─── STEP 6: HomePage ─────────────────────────────────────────────────────────

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSession[]>([]);

  // Simulate useFetch (loading → data)
  useEffect(() => {
    const t = setTimeout(() => {
      setStats(MOCK_STATS);
      setTransactions(MOCK_TRANSACTIONS);
      setDebtors(MOCK_DEBTORS);
      setSchedule(MOCK_SCHEDULE);
      setLoading(false);
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  const statCards: StatCardProps[] = [
    {
      title: 'Tổng Học Sinh',
      value: stats?.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      loading,
    },
    {
      title: 'Lớp Đang Mở',
      value: stats?.totalClasses,
      icon: BookOpen,
      color: 'text-green-600',
      bg: 'bg-green-100',
      loading,
    },
    {
      title: 'Doanh Thu Tháng',
      value: formatCurrency(stats?.monthlyRevenue),
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      loading,
    },
    {
      title: 'Hóa Đơn Chờ T.Toán',
      value: stats?.pendingInvoices,
      icon: FileText,
      color: 'text-red-600',
      bg: 'bg-red-100',
      loading,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
        <p className="text-gray-500 text-sm mt-1">Chào mừng bạn trở lại — đây là tình hình trung tâm hôm nay.</p>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Row 2: Quick Actions + Teacher Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <QuickActions onNavigate={(path) => console.log(`navigate → PATHS.${path}`)} />
        </div>
        <div className="lg:col-span-2">
          <TeacherScheduleToday data={schedule} loading={loading} />
        </div>
      </div>

      {/* Row 3: Debt List + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DebtList data={debtors} loading={loading} />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions data={transactions} loading={loading} />
        </div>
      </div>
    </div>
  );
}
