import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  User as UserIcon,
  MessageSquare,
  Calculator,
} from 'lucide-react';

import useFetch from '../hooks/useFetch';
import { attendanceService } from '../services/attendance.service';
import type { IAttendanceRecord, IAttendance } from '../types/attendance.type';
import type { AttendanceStatus, HomeworkStatus } from '../types/attendance.type';
import { PATHS } from '../utils/constants';
import { toast } from 'react-toastify';

const ATTENDANCE_STATUS_OPTIONS: { value: AttendanceStatus; label: string; bg: string; text: string; border: string }[] = [
  { value: 'PRESENT', label: 'Có mặt', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { value: 'LATE', label: 'Muộn', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { value: 'ABSENT', label: 'Vắng', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
];

const HOMEWORK_OPTIONS: { value: HomeworkStatus; label: string }[] = [
  { value: 'DONE', label: 'Đã nộp BT' },
  { value: 'NOT_DONE', label: 'Chưa nộp BT' },
  { value: 'NO_HOMEWORK', label: 'Không có BT' },
];

const StudentRowSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <div className="h-4 bg-gray-200 rounded w-36" />
        <div className="h-3 bg-gray-100 rounded w-20" />
      </div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
    </div>
  </div>
);

const TeacherAttendanceDetails = () => {
  const navigate = useNavigate();
  const { classId, scheduleId } = useParams<{ classId: string; scheduleId: string }>();

  const [records, setRecords] = useState<IAttendanceRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: responseData, loading, totalCount } = useFetch(
    () => attendanceService.getAttendanceList({ classId: classId!, scheduleId: scheduleId!, page, limit }),
    null,
    [classId, scheduleId, page]
  );

  useEffect(() => {
    if (responseData) setRecords(responseData);
  }, [responseData]);

  const updateField = (studentId: string, field: keyof IAttendance, value: any) => {
    setRecords((prev) => {
      const next = [...prev];
      const idx = next.findIndex((r) => r.studentInfo._id === studentId);
      if (idx > -1) (next[idx].attendance as any)[field] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave: IAttendance[] = records.map((r) => r.attendance);
      const res = await attendanceService.upsertAttendances(dataToSave);
      if (res.success) {
        toast.success('Lưu điểm danh thành công!');
        navigate(backPath);
      } else {
        toast.error(res.message || 'Lưu thất bại');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi lưu dữ liệu điểm danh');
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = records.filter((r) => r.attendance.status === 'PRESENT').length;
  const absentCount = records.filter((r) => r.attendance.status === 'ABSENT').length;
  const lateCount = records.filter((r) => r.attendance.status === 'LATE').length;
  const totalPages = Math.ceil((totalCount || 0) / limit);

  const backPath = PATHS.TEACHER_ATTENDANCE_SCHEDULES.replace(':classId', classId!);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(backPath)}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-0.5">Điểm danh</p>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết buổi học</h1>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && records.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Có mặt', value: presentCount, icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
            { label: 'Đi trễ', value: lateCount, icon: Clock, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
            { label: 'Vắng mặt', value: absentCount, icon: XCircle, bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100' },
          ].map((s, i) => (
            <div key={i} className={`bg-white rounded-2xl border ${s.border} p-4 flex items-center gap-3 shadow-sm`}>
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <s.icon size={20} className={s.text} />
              </div>
              <div>
                <p className={`text-xl font-black ${s.text}`}>{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Cards */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <StudentRowSkeleton key={i} />)}
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon size={28} className="text-blue-400" />
          </div>
          <p className="font-bold text-gray-700 text-lg mb-1">Chưa có học sinh</p>
          <p className="text-sm text-gray-400">Hiện chưa có học sinh nào trong lớp.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record, index) => {
            const att = record.attendance;
            const attOpt = ATTENDANCE_STATUS_OPTIONS.find((o) => o.value === att.status) ?? ATTENDANCE_STATUS_OPTIONS[0];

            return (
              <div key={record.studentInfo._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all p-5">
                {/* Student info header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-sm shrink-0">
                    {(page - 1) * limit + index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{record.studentInfo.fullName}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{record.studentInfo.code}</p>
                  </div>
                  {/* Quick attendance badge */}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${attOpt.bg} ${attOpt.text} ${attOpt.border}`}>
                    {attOpt.label}
                  </span>
                </div>

                {/* Input controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Attendance Status */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                      <CheckCircle2 size={10} /> Điểm danh
                    </label>
                    <div className="flex gap-1">
                      {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateField(record.studentInfo._id, 'status', opt.value)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${att.status === opt.value ? `${opt.bg} ${opt.text} ${opt.border} shadow-sm` : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                        >
                          {opt.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Homework */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                      <BookOpen size={10} /> Bài tập
                    </label>
                    <select
                      value={att.homework}
                      onChange={(e) => updateField(record.studentInfo._id, 'homework', e.target.value as HomeworkStatus)}
                      className={`w-full px-3 py-2 text-xs font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors ${att.homework === 'DONE' ? 'bg-blue-50 border-blue-200 text-blue-700' : att.homework === 'NOT_DONE' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                    >
                      {HOMEWORK_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Mark */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                      <Calculator size={10} /> Điểm số
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      placeholder="0 — 10"
                      value={att.mark !== undefined ? att.mark : ''}
                      onChange={(e) => updateField(record.studentInfo._id, 'mark', e.target.value === '' ? undefined : Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-center transition-all"
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                      <MessageSquare size={10} /> Nhận xét
                    </label>
                    <input
                      type="text"
                      placeholder="Thêm nhận xét..."
                      value={att.teacherComment || ''}
                      onChange={(e) => updateField(record.studentInfo._id, 'teacherComment', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
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
          <span className="px-4 py-2 text-sm font-semibold text-gray-600">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      )}

      {/* Save button (bottom sticky) */}
      {!loading && records.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex cursor-pointer items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang lưu...</>
            ) : (
              <><Save size={18} /> Lưu điểm danh</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceDetails;
