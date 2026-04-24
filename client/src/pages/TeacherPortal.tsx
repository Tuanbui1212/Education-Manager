import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  User,
  MapPin,
  ClipboardList,
  ShieldCheck,
  ChevronRight,
  Search,
  FileText,
} from 'lucide-react';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { attendanceService } from '../services/attendance.service';
import { getDecodedToken } from '../utils/auth';
import { PATHS } from '../utils/constants';
import { ClassStatus } from '../types/class.type';
import { ClassCardSkeleton } from '../components/ClassCardSkeleton';
import { CLASS_STATUS_CONFIG } from '../utils/constants';
import { ExamManager } from './ExamManager';

type Tab = 'attendance' | 'exams';

const TeacherPortal = () => {
  const navigate = useNavigate();
  const currentUser = getDecodedToken();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [activeTab, setActiveTab] = useState<Tab>('attendance');
  // Track selected class for exam tab (reuse the same class list)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const { data: classes, loading, totalCount } = useFetch(
    () => attendanceService.getActiveClasses({ limit: 100, search: debouncedSearch }),
    null,
    [debouncedSearch]
  );

  const handleClassClick = (cls: any) => {
    if (activeTab === 'attendance') {
      navigate(PATHS.TEACHER_ATTENDANCE_SCHEDULES.replace(':classId', cls._id));
    } else {
      setSelectedClassId(cls._id);
    }
  };

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <ShieldCheck size={250} />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Xin chào, {currentUser?.name ?? 'Giáo viên'}! 👋</h2>
          <p className="text-blue-100 mb-8 max-w-2xl text-lg">
            Cổng thông tin giáo viên — Quản lý lớp học và điểm danh học sinh của bạn.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">Lớp đang dạy</p>
                <p className="text-2xl font-bold">{totalCount ?? 0} Lớp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="flex mb-6 mt-2 overflow-x-auto custom-scrollbar pb-2">
        <div className="bg-white border border-gray-200 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-xs">
          <button
            id="tab-attendance"
            onClick={() => { setActiveTab('attendance'); setSelectedClassId(null); }}
            className={`px-6 py-2.5 cursor-pointer rounded-xl justify-center min-w-[150px] text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 active:scale-95'
              }`}
          >
            <ClipboardList size={17} /> Điểm danh
          </button>
          <button
            id="tab-exams"
            onClick={() => { setActiveTab('exams'); setSelectedClassId(null); }}
            className={`px-6 py-2.5 cursor-pointer rounded-xl justify-center min-w-[150px] text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'exams'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 active:scale-95'
              }`}
          >
            <FileText size={17} /> Bài kiểm tra
          </button>
        </div>
      </div>

      {/* ── ATTENDANCE TAB ── */}
      {activeTab === 'attendance' && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ClipboardList className="text-blue-600" />
              Lớp học của tôi
            </h3>
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm lớp học..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <ClassCardSkeleton key={i} />)}
            </div>
          ) : !classes || classes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-blue-400" />
              </div>
              <p className="font-bold text-gray-700 text-lg mb-1">Không có lớp học nào</p>
              <p className="text-sm text-gray-400">
                {debouncedSearch ? 'Không tìm thấy lớp phù hợp.' : 'Hiện chưa có lớp học nào đang hoạt động.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes.map((cls: any) => {
                const statusCfg = CLASS_STATUS_CONFIG[cls.status] ?? CLASS_STATUS_CONFIG[ClassStatus.ACTIVE];
                return (
                  <div
                    key={cls._id}
                    onClick={() => handleClassClick(cls)}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen size={24} />
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {cls.name}
                    </h4>
                    <p className="text-sm text-gray-400 font-medium mb-4">{cls.courseName || '—'}</p>
                    <div className="space-y-2 border-t border-gray-50 pt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">{cls.teacherName || 'Chưa phân công'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">{cls.roomName || 'Chưa xếp phòng'}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-1 text-blue-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <ClipboardList size={15} />
                      <span>Xem lịch điểm danh</span>
                      <ChevronRight size={15} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── EXAMS TAB ── */}
      {activeTab === 'exams' && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!selectedClassId ? (
            <>
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="text-blue-600" />
                  Chọn lớp để quản lý bài kiểm tra
                </h3>
                <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm lớp học..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => <ClassCardSkeleton key={i} />)}
                </div>
              ) : !classes || classes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
                  <BookOpen size={28} className="mx-auto text-blue-300 mb-3" />
                  <p className="font-bold text-gray-700">Không tìm thấy lớp học</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {classes.map((cls: any) => {
                    const statusCfg = CLASS_STATUS_CONFIG[cls.status] ?? CLASS_STATUS_CONFIG[ClassStatus.ACTIVE];
                    return (
                      <div
                        key={cls._id}
                        onClick={() => handleClassClick(cls)}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText size={22} />
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <h4 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {cls.name}
                        </h4>
                        <p className="text-sm text-gray-400 font-medium mb-4">{cls.courseName || '—'}</p>
                        <div className="mt-4 flex items-center justify-end gap-1 text-blue-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          <FileText size={15} />
                          <span>Quản lý bài kiểm tra</span>
                          <ChevronRight size={15} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Step 2: ExamManager for selected class */
            <>
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => setSelectedClassId(null)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <ChevronRight size={16} className="rotate-180" />
                  Quay lại danh sách lớp
                </button>
                <span className="text-gray-300">|</span>
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  Bài kiểm tra — {classes?.find((c: any) => c._id === selectedClassId)?.name ?? selectedClassId}
                </h3>
              </div>
              <ExamManager classId={selectedClassId} />
            </>
          )}
        </section>
      )}
    </>
  );
};

export default TeacherPortal;