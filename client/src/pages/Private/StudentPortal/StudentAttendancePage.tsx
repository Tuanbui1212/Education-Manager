import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  User,
  MapPin,
  X,
  CheckCircle2,
  Clock,
  ArrowLeft,
  BookMarked,
  AlertCircle,
  BarChart2,
  Award,
  ChevronDown,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { attendanceService } from '../../../services/attendance.service';
import { classService } from '../../../services/class.service';
import { PATHS } from '../../../utils/constants';

const ATTENDANCE_CONFIG: Record<string, any> = {
  PRESENT: { label: 'Có mặt', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircle2 },
  ABSENT: { label: 'Vắng mặt', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', icon: X },
  LATE: { label: 'Đi muộn', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', icon: Clock },
};

const hwConfig: Record<string, any> = {
  DONE: { label: 'Đã nộp', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  NOT_DONE: { label: 'Chưa nộp', bg: 'bg-red-100', text: 'text-red-700' },
  late: { label: 'Nộp muộn', bg: 'bg-amber-100', text: 'text-amber-700' },
};

const scoreColor = (v: number, max = 10) => {
  const r = v / max;
  if (r >= 0.8) return 'text-emerald-600';
  if (r >= 0.6) return 'text-blue-600';
  return 'text-red-600';
};

const scoreBg = (v: number, max = 10) => {
  const r = v / max;
  if (r >= 0.8) return 'bg-emerald-50 border-emerald-200';
  if (r >= 0.6) return 'bg-blue-50 border-blue-200';
  return 'bg-red-50 border-red-200';
};

const StudentAttendancePage = () => {
  const { id: classId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cls, setCls] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterAttendance, setFilterAttendance] = useState('all');

  // Fetch class info + attendance sessions
  useEffect(() => {
    if (!classId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [clsResp, sessResp] = await Promise.all([
          classService.getClassById(classId),
          attendanceService.getStudentAttendancesByClass(classId),
        ]);
        setCls(clsResp?.data ?? clsResp);
        const list = sessResp?.data || [];
        setSessions(list);
        setExpandedId(list[0]?._id ?? null);
      } catch (err) {
        console.error('Lỗi tải dữ liệu điểm danh:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [classId]);

  const filtered =
    filterAttendance === 'all' ? sessions : sessions.filter((s) => s.status === filterAttendance);

  const presentCount = sessions.filter((s) => s.status === 'PRESENT' || s.status === 'LATE').length;
  const absentCount = sessions.filter((s) => s.status === 'ABSENT').length;
  const lateCount = sessions.filter((s) => s.status === 'LATE').length;
  const scoresArr = sessions.filter((s) => s.mark !== undefined && s.mark !== null).map((s) => s.mark);
  const avgScore = scoresArr.length
    ? (scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length).toFixed(1)
    : '—';

  const handleBack = () => navigate(PATHS.STUDENT_PORTAL);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !cls) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-8">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <X size={32} className="text-red-500" />
        </div>
        <p className="font-bold text-gray-700 text-lg">{error || 'Không tìm thấy dữ liệu lớp học.'}</p>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-200 shadow-xl mb-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="bg-linear-to-br from-blue-500 to-blue-700 text-white">
        <div className="p-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Quay lại danh sách lớp</span>
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
              <BookMarked size={32} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-1">
                {cls.courseId?.title}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-3">{cls.name}</h2>
              <div className="flex flex-wrap gap-3 text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  <User size={14} />
                  {typeof cls.teacherId === 'object' ? cls.teacherId?.fullName : cls.teacherId}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {typeof cls.roomId === 'object' ? cls.roomId?.name : cls.roomId}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 bg-white">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Buổi có mặt', value: presentCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            { label: 'Vắng / Muộn', value: `${absentCount}/${lateCount}`, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
            { label: 'Điểm TB', value: avgScore, icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
            {
              label: 'Bài tập đã nộp',
              value: `${sessions.filter((s) => s.homework === 'DONE').length}/${sessions.length}`,
              icon: Award,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              border: 'border-amber-200',
            },
          ].map((stat, i) => (
            <div key={i} className={`rounded-2xl p-4 shadow-sm border ${stat.border} flex items-center gap-3`}>
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div>
                <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium leading-tight">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Session log header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Nhật ký buổi học ({sessions.length} buổi)
          </h3>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {[
              { v: 'all', label: 'Tất cả' },
              { v: 'PRESENT', label: 'Có mặt' },
              { v: 'ABSENT', label: 'Vắng' },
            ].map((f) => (
              <button
                key={f.v}
                onClick={() => setFilterAttendance(f.v)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filterAttendance === f.v
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Session list */}
        <div className="space-y-3">
          {filtered.map((session, i) => {
            const att = ATTENDANCE_CONFIG[session.status] || ATTENDANCE_CONFIG.PRESENT;
            const isOpen = expandedId === session._id;

            return (
              <div
                key={session._id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${isOpen
                  ? 'border-blue-200 shadow-blue-50'
                  : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                  }`}
              >
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedId(isOpen ? null : session._id)}
                >
                  <div className="p-4 sm:p-5 flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isOpen ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                      {sessions.length - i}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-gray-400">
                          {new Date(session.date).toLocaleDateString('vi-VN')}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${att.bg} ${att.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${att.dot}`} />
                          {att.label}
                        </span>
                      </div>
                      <p className="font-bold text-gray-800 text-sm truncate pr-2">
                        {session.topic || session.shiftName || 'Lí thuyết'}
                      </p>
                    </div>
                    {session.mark !== undefined && session.mark !== null ? (
                      <div
                        className={`hidden sm:flex flex-col items-center px-3 py-1.5 rounded-xl border text-center shrink-0 ${scoreBg(session.mark)}`}
                      >
                        <span className={`text-lg font-black leading-none ${scoreColor(session.mark)}`}>
                          {session.mark}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">/10</span>
                      </div>
                    ) : (
                      <div className="hidden sm:block w-14" />
                    )}
                    <div
                      className={`text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''
                        }`}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 px-4 sm:px-5 py-5 space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Score card */}
                      <div
                        className={`rounded-2xl border p-4 flex items-center gap-3 ${session.mark ? scoreBg(session.mark) : 'bg-gray-50 border-gray-200'
                          }`}
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <TrendingUp
                            size={18}
                            className={session.mark ? scoreColor(session.mark) : 'text-gray-400'}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Điểm số</p>
                          {session.mark !== undefined && session.mark !== null ? (
                            <p className={`text-xl font-black ${scoreColor(session.mark)}`}>
                              {session.mark}
                              <span className="text-sm font-medium text-gray-400">/10</span>
                            </p>
                          ) : (
                            <p className="text-sm font-bold text-gray-400">Không có</p>
                          )}
                        </div>
                      </div>

                      {/* Homework card */}
                      <div
                        className={`rounded-2xl border p-4 flex items-center gap-3 ${session.homework
                          ? `${hwConfig[session.homework]?.bg} border-${session.homework === 'DONE' ? 'emerald' : 'red'}-200`
                          : 'bg-gray-50 border-gray-100'
                          }`}
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <BookOpen
                            size={18}
                            className={session.homework === 'DONE' ? 'text-emerald-600' : 'text-red-500'}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Bài tập về nhà</p>
                          <p
                            className={`text-sm font-black ${session.homework === 'DONE' ? 'text-emerald-700' : 'text-red-700'
                              }`}
                          >
                            {hwConfig[session.homework]?.label ?? '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Teacher comment */}
                    {session.teacherComment && (
                      <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 font-black text-white text-sm">
                          GV
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] text-blue-400 font-medium">Nhận xét buổi học</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed italic">
                            "{session.teacherComment}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Filter size={24} className="text-gray-400" />
            </div>
            <p className="font-bold text-gray-600">Không có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendancePage;
