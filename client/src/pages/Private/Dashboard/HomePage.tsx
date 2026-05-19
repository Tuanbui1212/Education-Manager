import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  DollarSign,
  FileText,
  PlusCircle,
  UserPlus,
  CalendarDays,
  MapPin,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  BarChart2,
  ShieldOff,
} from 'lucide-react';
import { PATHS } from '../../../utils/constants';

import Skeleton from '../../../components/Skeleton';
import StatCard from '../../../components/StatCard';

import useFetch from '../../../hooks/useFetch';
import { cashbookService } from '../../../services/cashbook.service';
import { classService } from '../../../services/class.service';
import { userService } from '../../../services/user.service';
import { invoiceService } from '../../../services/invoice.service';
import { scheduleService } from '../../../services/schedule.service';

import type { ISchedule } from '../../../types/schedule.type';

import { formatCurrency, STATUS_CONFIG } from '../../../utils/format.util';

import RequirePermission from '../../../components/RequirePermission';
import { PERMISSIONS } from '../../../utils/permission.constant';
import { checkPermission } from '../../../utils/permission.util';

// ─── ACTION ITEMS ──────────────────────────────────────────────────────────────

const ACTION_ITEMS = [
  {
    label: 'Thêm học sinh mới',
    icon: UserPlus,
    hover: 'hover:bg-blue-50 hover:text-blue-600',
    path: PATHS.TRAINING_STUDENT_CREATE,
    permission: PERMISSIONS.STUDENT.CREATE,
  },
  {
    label: 'Mở lớp học mới',
    icon: PlusCircle,
    hover: 'hover:bg-green-50 hover:text-green-600',
    path: PATHS.TRAINING_CLASSES_CREATE,
    permission: PERMISSIONS.CLASS.CREATE,
  },
  {
    label: 'Xếp lịch dạy',
    icon: CalendarDays,
    hover: 'hover:bg-teal-50 hover:text-teal-600',
    path: PATHS.TRAINING_AUTO_SCHEDULES,
    permission: PERMISSIONS.SCHEDULE.VIEW,
  },
];

// ─── FINANCE SUMMARY ───────────────────────────────────────────────────────────

interface FinanceSummaryProps {
  stats: any;
  loading: boolean;
  onViewReport: () => void;
}

const FinanceSummary = ({ stats, loading, onViewReport }: FinanceSummaryProps) => {
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
            <p className="text-sm font-bold truncate">{formatCurrency(stats?.totalIn)}</p>
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
            <p className="text-sm font-bold truncate">{formatCurrency(stats?.totalOut)}</p>
          )}
        </div>

        {/* Lợi nhuận */}
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart2 size={13} className={stats?.balance >= 0 ? 'text-emerald-300' : 'text-red-300'} />
            <p className="text-xs font-medium text-blue-100">Lợi nhuận</p>
          </div>
          {loading ? (
            <Skeleton className="h-5 w-full bg-white/20" />
          ) : (
            <p className={`text-sm font-bold truncate ${stats?.balance >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {stats?.balance >= 0 ? '+' : ''}
              {formatCurrency(stats?.balance)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── TEACHER SCHEDULE TODAY ────────────────────────────────────────────────────

const TeacherScheduleToday = ({ data, loading }: { data: ISchedule[]; loading: boolean }) => {
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Lịch dạy hôm nay</h2>
          <p className="text-xs text-gray-400 mt-0.5">{today}</p>
        </div>
        <button
          onClick={() => navigate(PATHS.TRAINING_SCHEDULES)}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          Xem tất cả <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <CalendarDays className="w-10 h-10 mb-3 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">Không có lịch dạy hôm nay</p>
            <p className="text-xs text-gray-400 mt-1">Hãy tận hưởng ngày nghỉ của bạn 🎉</p>
          </div>
        ) : (
          data.map((session) => {
            const now = new Date();
            let statusSchedule: 'done' | 'ongoing' | 'upcoming' = 'upcoming';

            if (typeof session.shiftId === 'object' && session.shiftId) {
              const baseDate = new Date(session.date);
              const [sh, sm] = session.shiftId.startTime.split(':');
              const [eh, em] = session.shiftId.endTime.split(':');

              const start = new Date(baseDate);
              start.setHours(Number(sh), Number(sm), 0, 0);

              const end = new Date(baseDate);
              end.setHours(Number(eh), Number(em), 0, 0);

              if (now > end) statusSchedule = 'done';
              else if (now >= start && now <= end) statusSchedule = 'ongoing';
              else statusSchedule = 'upcoming';
            }

            const s = STATUS_CONFIG[statusSchedule];

            return (
              <div
                key={session._id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="shrink-0 text-center min-w-[72px]">
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${s.dot} ${
                        statusSchedule === 'ongoing' ? 'animate-pulse' : ''
                      }`}
                    />
                    {s.label}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {typeof session.shiftId === 'object'
                      ? `${session.shiftId.startTime} - ${session.shiftId.endTime}`
                      : ''}
                  </p>
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-semibold text-gray-800 truncate cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => {
                      const classId =
                        typeof session.classId === 'object' && session.classId !== null
                          ? session.classId._id
                          : session.classId;
                      if (classId) {
                        navigate(PATHS.TRAINING_CLASSES_ID.replace(':id', classId));
                      }
                    }}
                  >
                    {typeof session.classId === 'object' ? session.classId.name : 'Không xác định'}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{' '}
                      {typeof session.roomId === 'object' ? session.roomId.name : 'Không xác định'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />{' '}
                      {typeof session.classId === 'object' ? session.classId.studentIds?.length || 0 : 0} học sinh
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {typeof session.teacherId === 'object' ? session.teacherId.fullName : ''}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─── HOME PAGE ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();
  const { hasPermission } = checkPermission();

  // Kiểm tra trước các permission ảnh hưởng đến layout
  const hasScheduleView = hasPermission(PERMISSIONS.SCHEDULE.VIEW);
  const hasAnyActionItem = ACTION_ITEMS.some((item) => hasPermission(item.permission));

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { summary, loading: loadingCashbook } = useFetch(
    cashbookService.getCashBook,
    { limit: 1, page: 1, startDate, endDate },
    [],
  );
  const { totalCount: totalClass, loading: loadingClass } = useFetch(
    classService.getClasses,
    { status: 'ACTIVE', limit: 1, page: 1 },
    [],
  );
  const { summary: sumaryStudent, loading: loadingStudent } = useFetch(
    userService.getAllStudents,
    { status: 'ACTIVE', limit: 1, page: 1 },
    [],
  );
  const { totalCount: totalInvoicesUnpaid, loading: loadingInvoices } = useFetch(
    invoiceService.getInvoices,
    { status: 'UNPAID', limit: 1, page: 1 },
    [],
  );
  const { data: dataSchedule, loading: loadingSchedule } = useFetch(scheduleService.getTodaySchedules, {});

  // Mỗi stat card có thêm field `permission` để guard riêng
  const statCards = [
    {
      label: 'Tổng Học Sinh',
      value: sumaryStudent?.active ?? 0,
      icon: <Users className="w-5 h-5" />,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-blue-500',
      loading: loadingStudent,
      permission: PERMISSIONS.STUDENT.VIEW,
      onClick: () => navigate(PATHS.TRAINING_STUDENT),
    },
    {
      label: 'Lớp Đang Mở',
      value: totalClass ?? 0,
      icon: <BookOpen className="w-5 h-5" />,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
      textColor: 'text-green-500',
      loading: loadingClass,
      permission: PERMISSIONS.CLASS.VIEW,
      onClick: () => navigate(PATHS.TRAINING_CLASSES),
    },
    {
      label: 'Doanh Thu Tháng',
      value: formatCurrency(summary?.totalIn ?? 0),
      icon: <DollarSign className="w-5 h-5" />,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-purple-500',
      loading: loadingCashbook,
      permission: PERMISSIONS.CASHBOOK.VIEW,
      onClick: () => navigate(PATHS.FINANCE_REPORT),
    },
    {
      label: 'Hóa Đơn Chờ Thanh Toán',
      value: totalInvoicesUnpaid ?? 0,
      icon: <FileText className="w-5 h-5" />,
      gradient: 'bg-gradient-to-br from-red-500 to-red-600',
      textColor: 'text-red-500',
      loading: loadingInvoices,
      permission: PERMISSIONS.INVOICE.VIEW,
      onClick: () => navigate(PATHS.FINANCE_INVOICES),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
        <p className="text-gray-500 text-sm mt-1">Chào mừng bạn trở lại — đây là tình hình trung tâm hôm nay.</p>
      </div>

      {/* Stat Cards — mỗi card được guard riêng, grid tự co lại nếu bị ẩn */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map(({ permission, ...card }, i) => (
          <RequirePermission key={i} required={permission}>
            <StatCard {...card} active={false} />
          </RequirePermission>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Cột trái: Finance + Quick Actions
            Nếu không có SCHEDULE.VIEW → chiếm toàn bộ 5 cột */}
        <div className={`flex flex-col gap-6 ${hasScheduleView ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
          <RequirePermission required={PERMISSIONS.CASHBOOK.VIEW}>
            <FinanceSummary
              stats={summary}
              loading={loadingCashbook}
              onViewReport={() => navigate(PATHS.FINANCE_REPORT)}
            />
          </RequirePermission>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Thao tác nhanh</h2>

            {hasAnyActionItem ? (
              <div className="space-y-2">
                {ACTION_ITEMS.map(({ label, icon: Icon, hover, path, permission }) => (
                  <RequirePermission key={path} required={permission}>
                    <button
                      onClick={() => navigate(path)}
                      className={`w-full flex items-center p-3 text-sm text-gray-700 bg-gray-50 ${hover} rounded-lg transition-colors`}
                    >
                      <Icon className="w-4 h-4 mr-3 shrink-0" />
                      {label}
                    </button>
                  </RequirePermission>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <ShieldOff className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">Không có thao tác khả dụng</p>
                <p className="text-xs text-gray-400 mt-1">Bạn chưa được cấp quyền thực hiện thao tác nào.</p>
              </div>
            )}
          </div>
        </div>

        <RequirePermission required={PERMISSIONS.SCHEDULE.VIEW}>
          <div className="lg:col-span-3">
            <TeacherScheduleToday data={dataSchedule || []} loading={loadingSchedule} />
          </div>
        </RequirePermission>
      </div>
    </div>
  );
}
