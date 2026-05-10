import { useState, useMemo, useEffect } from 'react';
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
  CalendarIcon,
  Clock,
  UserIcon,
  ChevronLeft,
} from 'lucide-react';
import { startOfWeek, addDays, subWeeks, addWeeks, format, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';
import { attendanceService } from '../../../services/attendance.service';
import { scheduleService } from '../../../services/schedule.service';
import { shiftService } from '../../../services/shift.service';
import { getDecodedToken } from '../../../utils/auth';
import { PATHS } from '../../../utils/constants';
import { ClassStatus } from '../../../types/class.type';
import { ClassCardSkeleton } from '../../../components/ClassCardSkeleton';
import { CLASS_STATUS_CONFIG } from '../../../utils/constants';

type Tab = 'attendance' | 'schedule' | 'exams';

const TeacherPortal = () => {
  const navigate = useNavigate();
  const currentUser = getDecodedToken();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [activeTab, setActiveTab] = useState<Tab>('attendance');

  // Timetable state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const { data: classes, loading, totalCount } = useFetch(
    () => attendanceService.getActiveClassesByTeacherId({ limit: 100, search: debouncedSearch }),
    null,
    [debouncedSearch]
  );

  const { data: shiftsData } = useFetch(shiftService.getShifts, { limit: 100 }, []);
  const shiftsList = useMemo(() => {
    const list = Array.isArray(shiftsData) ? shiftsData : (shiftsData as any)?.data || [];
    return list.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
  }, [shiftsData]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  );

  // Fetch teacher schedules for timetable
  useEffect(() => {
    if (!classes || classes.length === 0) { setScheduleData([]); return; }
    const fetchSchedules = async () => {
      setScheduleLoading(true);
      try {
        const promises = (classes as any[]).map((cls: any) =>
          scheduleService.getSchedules({ classId: cls._id, limit: 1000 })
        );
        const results = await Promise.all(promises);
        const allSchedules = results.flatMap((r: any) => Array.isArray(r) ? r : r.data || []);
        setScheduleData(allSchedules);
      } catch { } finally { setScheduleLoading(false); }
    };
    fetchSchedules();
  }, [classes, currentWeekStart]);

  const getScheduleForCell = (date: Date, shiftId: string) =>
    scheduleData?.find((s: any) => {
      const isSameDate = isSameDay(new Date(s.date), date);
      const isSameShift = typeof s.shiftId === 'object' ? s.shiftId._id === shiftId : s.shiftId === shiftId;
      return isSameDate && isSameShift;
    });

  const handleClassClick = (cls: any) => {
    if (activeTab === 'attendance') {
      navigate(PATHS.TEACHER_ATTENDANCE_SCHEDULES.replace(':classId', cls._id));
    } else if (activeTab === 'exams') {
      navigate(PATHS.TEACHER_EXAM_MANAGER.replace(':classId', cls._id));
    }
  };

  const handleScheduleCellClick = (schedule: any) => {
    const classId = typeof schedule.classId === 'object' ? schedule.classId._id : schedule.classId;
    navigate(PATHS.TEACHER_ATTENDANCE_SCHEDULES.replace(':classId', classId));
  };

  const renderClassGrid = (actionLabel: string, icon: React.ReactNode) => (
    <>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {icon} Lớp học của tôi
        </h3>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Tìm kiếm lớp học..."
            value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
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
          <p className="font-bold text-gray-700">{debouncedSearch ? 'Không tìm thấy lớp phù hợp.' : 'Hiện chưa có lớp học nào đang hoạt động.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(classes as any[]).map((cls: any) => {
            const statusCfg = CLASS_STATUS_CONFIG[cls.status] ?? CLASS_STATUS_CONFIG[ClassStatus.ACTIVE];
            return (
              <div key={cls._id} onClick={() => handleClassClick(cls)}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>{statusCfg.label}</span>
                </div>
                <h4 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{cls.name}</h4>
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
                  {icon}<span>{actionLabel}</span><ChevronRight size={15} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4"><ShieldCheck size={250} /></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Xin chào, {currentUser?.name ?? 'Giáo viên'}! 👋</h2>
          <p className="text-blue-100 mb-8 max-w-2xl text-lg">Cổng thông tin giáo viên — Quản lý lớp học và điểm danh học sinh của bạn.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><BookOpen size={24} className="text-white" /></div>
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
          {([
            ['attendance', <ClipboardList size={17} />, 'Điểm danh'],
            ['schedule', <CalendarIcon size={17} />, 'Lịch dạy'],
            ['exams', <FileText size={17} />, 'Bài kiểm tra'],
          ] as const).map(([tab, icon, label]) => (
            <button key={tab} id={`tab-${tab}`}
              onClick={() => setActiveTab(tab as Tab)}
              className={`px-6 py-2.5 cursor-pointer rounded-xl justify-center min-w-[140px] text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === tab ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 active:scale-95'}`}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderClassGrid('Xem lịch điểm danh', <ClipboardList className="text-blue-600" />)}
        </section>
      )}

      {/* SCHEDULE TAB - Timetable */}
      {activeTab === 'schedule' && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex flex-wrap justify-between items-center gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CalendarIcon size={20} /></div>
              <div>
                <h3 className="font-bold text-gray-800">Lịch dạy của tôi</h3>
                <p className="text-xs text-gray-500">Click vào lớp để xem lịch điểm danh</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-inner">
              <button onClick={() => setCurrentWeekStart(p => subWeeks(p, 1))}
                className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-blue-600 hover:shadow-sm">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                className="px-4 py-2 font-bold text-sm bg-white text-blue-700 rounded-lg shadow-sm border border-blue-100">
                {format(weekDays[0], 'dd/MM/yyyy')} - {format(weekDays[6], 'dd/MM/yyyy')}
              </button>
              <button onClick={() => setCurrentWeekStart(p => addWeeks(p, 1))}
                className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-blue-600 hover:shadow-sm">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr>
                    <th className="p-4 border-b border-r border-gray-200 bg-gray-50 w-[100px] text-center font-bold text-gray-600">
                      <Clock size={18} className="mx-auto text-gray-400" />
                    </th>
                    {weekDays.map((day, index) => (
                      <th key={index} className="p-3 border-b border-r border-gray-200 bg-primary text-white text-center w-[12.8%]">
                        <div className="text-sm font-bold uppercase tracking-wider">{format(day, 'EEEE', { locale: vi })}</div>
                        <div className="text-xs text-violet-200 mt-1">{format(day, 'dd/MM/yyyy')}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scheduleLoading ? (
                    Array.from({ length: 5 }).map((_, rIdx) => (
                      <tr key={rIdx}>
                        <td className="p-4 border-b border-r border-gray-200 bg-gray-50/50">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                        </td>
                        {Array.from({ length: 7 }).map((_, cIdx) => (
                          <td key={cIdx} className="p-2 border-b border-r border-gray-100">
                            <div className="h-24 bg-gray-50 rounded-xl animate-pulse border border-gray-100" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : shiftsList.length > 0 ? (
                    shiftsList.map((shift: any) => (
                      <tr key={shift._id} className="group/row">
                        <td className="p-3 border-b border-r border-gray-200 bg-gray-50 text-center align-middle group-hover/row:bg-gray-100 transition-colors">
                          <div className="font-bold text-gray-700 text-sm">{shift.name}</div>
                          <div className="text-[11px] text-gray-500 font-medium mt-1 bg-white px-2 py-0.5 rounded-md border border-gray-200 inline-block shadow-sm">
                            {shift.startTime} - {shift.endTime}
                          </div>
                        </td>
                        {weekDays.map((day, index) => {
                          const cellSchedule = getScheduleForCell(day, shift._id);
                          return (
                            <td key={index} className="p-2 border-b border-r border-gray-100 bg-white align-top relative">
                              {cellSchedule ? (
                                <div
                                  onClick={() => handleScheduleCellClick(cellSchedule)}
                                  className="h-full bg-blue-50 border border-blue-200 rounded-xl p-3 cursor-pointer hover:bg-blue-100 hover:shadow-md transition-all group/card flex flex-col gap-2"
                                >
                                  <h4 className="font-bold text-sm text-blue-800 line-clamp-2 group-hover/card:text-blue-900">
                                    {typeof cellSchedule.classId === 'object' ? cellSchedule.classId?.name : 'N/A'}
                                  </h4>
                                  <div className="mt-auto space-y-1.5 pt-2 border-t border-blue-200/60">
                                    <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium">
                                      <UserIcon size={12} className="text-blue-500" />
                                      <span className="truncate">{currentUser?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                      <MapPin size={12} className="text-gray-400" />
                                      <span className="truncate uppercase font-bold">{cellSchedule.roomId?.name || '—'}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full min-h-[100px] rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 hover:bg-gray-50 transition-all border border-dashed border-transparent hover:border-gray-300">
                                  <span className="text-xs text-gray-400 font-medium italic">Trống</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-gray-500">
                        Không có dữ liệu ca học. Vui lòng cấu hình ca học trước.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* EXAMS TAB */}
      {activeTab === 'exams' && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderClassGrid('Quản lý bài kiểm tra', <FileText className="text-blue-600" />)}
        </section>
      )}
    </>
  );
};

export default TeacherPortal;