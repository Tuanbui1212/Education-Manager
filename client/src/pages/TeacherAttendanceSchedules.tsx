import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  UserCheck,
  UserX,
  CheckCircle2,
  XCircle,
  ClipboardList,
  BookOpen,
} from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';

import useFetch from '../hooks/useFetch';
import { attendanceService } from '../services/attendance.service';
import { PATHS } from '../utils/constants';

const ScheduleRowSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-pulse">
    <div className="flex-1 space-y-2">
      <div className="h-5 bg-gray-200 rounded w-32" />
      <div className="h-4 bg-gray-100 rounded w-24" />
    </div>
    <div className="flex gap-6">
      <div className="h-8 w-16 bg-gray-200 rounded-xl" />
      <div className="h-8 w-16 bg-gray-200 rounded-xl" />
      <div className="h-8 w-16 bg-gray-200 rounded-xl" />
    </div>
    <div className="h-9 w-28 bg-gray-200 rounded-xl" />
  </div>
);

const getScheduleStatus = (dateString: string) => {
  const scheduleDate = startOfDay(new Date(dateString));
  const today = startOfDay(new Date());
  if (isBefore(scheduleDate, today)) {
    return { text: 'Đã xong', bg: 'bg-gray-100', text_color: 'text-gray-600' };
  }
  return { text: 'Sắp tới', bg: 'bg-blue-50', text_color: 'text-blue-600' };
};

const TeacherAttendanceSchedules = () => {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();

  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: schedulesData, loading, totalCount } = useFetch(
    () => attendanceService.getSchedulesByClass({ classId: classId!, page, limit }),
    null,
    [classId, page]
  );

  const className = (schedulesData as any)?.[0]?.className || 'Lớp học';

  const handleScheduleClick = (scheduleId: string) => {
    const path = PATHS.TEACHER_ATTENDANCE_DETAILS
      .replace(':classId', classId!)
      .replace(':scheduleId', scheduleId);
    navigate(path);
  };

  const totalPages = Math.ceil((totalCount || 0) / limit);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(PATHS.TEACHER_PORTAL)}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-0.5">Lịch học</p>
          <h1 className="text-2xl font-bold text-gray-900">{className}</h1>
        </div>
      </div>

      {/* Stats Bar */}
      {!loading && schedulesData && schedulesData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: 'Tổng buổi',
              value: totalCount ?? 0,
              icon: Calendar,
              bg: 'bg-blue-50',
              text: 'text-blue-600',
              border: 'border-blue-100',
            },
            {
              label: 'Đã điểm danh',
              value: (schedulesData as any[]).filter((s) => s.isAttended).length,
              icon: CheckCircle2,
              bg: 'bg-emerald-50',
              text: 'text-emerald-600',
              border: 'border-emerald-100',
            },
            {
              label: 'Chưa điểm danh',
              value: (schedulesData as any[]).filter((s) => !s.isAttended).length,
              icon: XCircle,
              bg: 'bg-red-50',
              text: 'text-red-500',
              border: 'border-red-100',
            },
          ].map((stat, i) => (
            <div key={i} className={`bg-white rounded-2xl border ${stat.border} p-4 flex items-center gap-3 shadow-sm`}>
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <stat.icon size={20} className={stat.text} />
              </div>
              <div>
                <p className={`text-xl font-black ${stat.text}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <ScheduleRowSkeleton key={i} />)}
        </div>
      ) : !schedulesData || schedulesData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-blue-400" />
          </div>
          <p className="font-bold text-gray-700 text-lg mb-1">Chưa có lịch học</p>
          <p className="text-sm text-gray-400">Lớp học này hiện chưa có buổi học nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(schedulesData as any[]).map((schedule, index) => {
            const status = getScheduleStatus(schedule.date);
            return (
              <div
                key={schedule._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Index + Date */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-500 text-sm shrink-0">
                      {(page - 1) * limit + index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {format(new Date(schedule.date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {schedule.shiftName}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.bg} ${status.text_color} shrink-0`}>
                    {status.text}
                  </span>

                  {/* Stats */}
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Users size={15} className="text-gray-400" />
                      <span className="font-semibold">{schedule.totalStudents}</span>
                      <span className="text-gray-400 text-xs">HS</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                      <UserCheck size={15} />
                      <span className="font-semibold">{schedule.presentCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-red-500">
                      <UserX size={15} />
                      <span className="font-semibold">{schedule.absentCount}</span>
                    </div>
                    <div>
                      {schedule.isAttended ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <XCircle size={20} className="text-red-400" />
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => handleScheduleClick(schedule._id)}
                    className="shrink-0 cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-blue-600/20 transition-all active:scale-95"
                  >
                    <ClipboardList size={16} />
                    Điểm danh
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm font-semibold text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceSchedules;
