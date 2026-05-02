import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TrendingUp,
  TrendingDown,
  BarChart2,
  type LucideIcon,
} from 'lucide-react';
import { PATHS } from '../../utils/constants';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type ScheduleStatus = 'ongoing' | 'upcoming' | 'done';

interface Stats {
  totalStudents: number;
  totalClasses: number;
  monthlyRevenue: number;
  monthlyExpense: number;
  pendingInvoices: number;
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
  monthlyExpense: 18_200_000,
  pendingInvoices: 7,
};

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

// ─── SKELETON ─────────────────────────────────────────────────────────────────

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

// ─── STEP 2: FinanceSummary ───────────────────────────────────────────────────

interface FinanceSummaryProps {
  stats: Stats | null;
  loading: boolean;
  onViewReport: () => void;
}

const FinanceSummary = ({ stats, loading, onViewReport }: FinanceSummaryProps) => {
  const netProfit = (stats?.monthlyRevenue ?? 0) - (stats?.monthlyExpense ?? 0);
  const isProfit = netProfit >= 0;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 text-white">
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-sm font-medium text-blue-100">Tài chính tháng này</p>
          <p className="text-xs text-blue-200 mt-0.5">Tổng quan nhanh</p>
        </div>
        <button
          onClick={onViewReport}
          className="flex items-center gap-1 text-xs font-semibold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors"
        >
          Xem báo cáo <ChevronRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Doanh thu */}
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={13} className="text-emerald-300" />
            <p className="text-xs font-medium text-blue-100">Doanh thu</p>
          </div>
          {loading ? (
            <Skeleton className="h-5 w-full bg-white/20" />
          ) : (
            <p className="text-sm font-bold truncate">{formatCurrency(stats?.monthlyRevenue)}</p>
          )}
        </div>

        {/* Chi phí */}
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown size={13} className="text-orange-300" />
            <p className="text-xs font-medium text-blue-100">Chi phí</p>
          </div>
          {loading ? (
            <Skeleton className="h-5 w-full bg-white/20" />
          ) : (
            <p className="text-sm font-bold truncate">{formatCurrency(stats?.monthlyExpense)}</p>
          )}
        </div>

        {/* Lợi nhuận */}
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart2 size={13} className={isProfit ? 'text-emerald-300' : 'text-red-300'} />
            <p className="text-xs font-medium text-blue-100">Lợi nhuận</p>
          </div>
          {loading ? (
            <Skeleton className="h-5 w-full bg-white/20" />
          ) : (
            <p className={`text-sm font-bold truncate ${isProfit ? 'text-emerald-300' : 'text-red-300'}`}>
              {isProfit ? '+' : ''}
              {formatCurrency(netProfit)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── STEP 3: QuickActions ─────────────────────────────────────────────────────

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

// ─── STEP 4: TeacherScheduleToday ─────────────────────────────────────────────

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

// ─── STEP 5: HomePage ─────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [schedule, setSchedule] = useState<ScheduleSession[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setStats(MOCK_STATS);
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

      {/* Row 2: Finance Summary + Quick Actions + Teacher Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <FinanceSummary stats={stats} loading={loading} onViewReport={() => navigate(PATHS.FINANCE_REPORT)} />
          <QuickActions onNavigate={(path) => console.log(`navigate → PATHS.${path}`)} />
        </div>
        <div className="lg:col-span-2">
          <TeacherScheduleToday data={schedule} loading={loading} />
        </div>
      </div>
    </div>
  );
}
