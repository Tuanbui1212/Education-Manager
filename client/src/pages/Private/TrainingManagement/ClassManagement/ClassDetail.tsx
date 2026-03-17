import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  User as UserIcon,
  Users,
  Edit,
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Trash2,
} from 'lucide-react';

import useFetch from '../../../../hooks/useFetch';
import { classService } from '../../../../services/class.service';
import { scheduleService } from '../../../../services/schedule.service';

import Button from '../../../../components/Button';
import SearchInput from '../../../../components/SearchInput';
import ConfirmModal from '../../../../components/ConfirmModal';

import ClassModal from './ClassModal';
import AutoScheduleModal from './AutoScheduleModal';

import { PATHS } from '../../../../utils/constants';
import type { IClass } from '../../../../types/class.type';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: classData,
    loading,
    error,
    refetch: fetchClass,
  } = useFetch(classService.getClassById, id as string, [id]);

  const {
    data: schedulesResponse,
    loading: loadingSchedules,
    refetch: fetchSchedules,
  } = useFetch(scheduleService.getSchedules, { classId: id, limit: 100 }, [id]);

  const schedulesList = Array.isArray(schedulesResponse) ? schedulesResponse : (schedulesResponse as any)?.data || [];

  const scheduleSummary = useMemo(() => {
    if (!schedulesList || schedulesList.length === 0) return null;

    const dayShiftMap = new Map<number, Set<string>>();

    schedulesList.forEach((s: any) => {
      if (s.date) {
        const dateObj = new Date(s.date);
        const day = dateObj.getDay();
        
        let shiftName = '';
        if (s.shiftId?.name) {
          shiftName = s.shiftId.name;
        } else if (typeof s.shiftId === 'string') {
          shiftName = s.shiftId;
        }

        if (shiftName) {
          if (!dayShiftMap.has(day)) {
            dayShiftMap.set(day, new Set());
          }
          dayShiftMap.get(day)!.add(shiftName);
        }
      }
    });

    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    const sortedDays = Array.from(dayShiftMap.keys()).sort((a, b) => {
      const dayA = a === 0 ? 7 : a;
      const dayB = b === 0 ? 7 : b;
      return dayA - dayB;
    });

    const details = sortedDays.map((day) => ({
      dayName: dayNames[day],
      shifts: Array.from(dayShiftMap.get(day)!).join(', '),
    }));

    return {
      details,
      total: schedulesList.length,
    };
  }, [schedulesList]);

  const [searchInput, setSearchInput] = useState('');
  const [showClassModal, setShowClassModal] = useState(false);
  const [showAutoScheduleModal, setShowAutoScheduleModal] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
    onConfirm: () => {},
  });

  const [confirmDeleteAll, setConfirmDeleteAll] = useState({
    isOpen: false,
    title: '',
    message: '',
  });

  const handleUpdateClass = async (formData: Partial<IClass>) => {
    if (!id) return;
    try {
      const res = await classService.updateClass(id, formData);
      if (res.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          message: 'Cập nhật thông khoá học thành công!',
          type: 'success',
          onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
        });
        fetchClass();
        setShowClassModal(false);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!';
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: detailError,
        type: 'danger',
        onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
      });
    }
  };

  const handleDeleteAllSchedules = async () => {
    if (schedulesList.length === 0) return;

    setIsDeletingBulk(true);
    setConfirmDeleteAll({ ...confirmDeleteAll, isOpen: false });

    const scheduleIds = schedulesList.map((s: any) => s._id);

    try {
      await scheduleService.deleteSchedulesBulk(scheduleIds);

      setConfirmConfig({
        isOpen: true,
        title: 'Thành công',
        message: `Đã xóa sạch ${scheduleIds.length} buổi học của lớp này.`,
        type: 'success',
        onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
      });
      fetchSchedules();
    } catch (error: any) {
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: error.response?.data?.message || 'Không thể xóa lịch học lúc này.',
        type: 'danger',
        onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
      });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const studentIds = classData?.studentIds;

  const filteredStudents = useMemo(() => {
    if (!studentIds) return [];
    if (!searchInput.trim()) return studentIds;

    const lowerSearch = searchInput.toLowerCase();
    return studentIds.filter(
      (student: any) =>
        student.fullName?.toLowerCase().includes(lowerSearch) ||
        student.phone?.includes(lowerSearch) ||
        student.email?.toLowerCase().includes(lowerSearch),
    );
  }, [studentIds, searchInput]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải thông tin lớp học...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
  if (!classData) return <div className="p-8 text-center text-gray-500">Không tìm thấy thông tin lớp học.</div>;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold uppercase tracking-wider shadow-sm">
            <CheckCircle2 size={16} /> Đang hoạt động
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-sm font-bold uppercase tracking-wider shadow-sm">
            <CheckCircle2 size={16} /> Đã hoàn thành
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-bold uppercase tracking-wider shadow-sm">
            <Clock size={16} /> {status}
          </span>
        );
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in duration-500">
      {showClassModal && (
        <ClassModal
          isOpen={showClassModal}
          onClose={() => setShowClassModal(false)}
          onSubmit={handleUpdateClass}
          initialData={classData as any}
        />
      )}

      {showAutoScheduleModal && (
        <AutoScheduleModal
          isOpen={showAutoScheduleModal}
          onClose={() => setShowAutoScheduleModal(false)}
          onSuccess={() => {
            fetchSchedules();
          }}
          classData={classData}
        />
      )}

      {/* Modal Thông báo chung */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Đóng"
        cancelText=""
      />

      {/* Modal Xác nhận Xóa Toàn Bộ Lịch */}
      <ConfirmModal
        isOpen={confirmDeleteAll.isOpen}
        onClose={() => setConfirmDeleteAll({ ...confirmDeleteAll, isOpen: false })}
        onConfirm={handleDeleteAllSchedules}
        title={confirmDeleteAll.title}
        message={confirmDeleteAll.message}
        type="danger"
        confirmText="Xác nhận xóa sạch"
        cancelText="Hủy bỏ"
        isLoading={isDeletingBulk}
      />

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
            title="Quay lại danh sách"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{classData.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Chi tiết lớp học và danh sách học viên</p>
          </div>
        </div>

        <Button variant="primary" icon={<Edit size={18} />} onClick={() => setShowClassModal(true)}>
          Chỉnh sửa thông tin
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50"></div>

            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <BookOpen size={28} />
              </div>
              {renderStatusBadge(classData.status)}
            </div>

            <div className="relative z-10 space-y-5">
              <div className="flex flex-col gap-1 border-b border-gray-50 pb-4">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Khóa học</span>
                <div className="flex items-center gap-2 text-gray-800 font-medium">
                  <BookOpen size={16} className="text-indigo-400" />
                  <span>{classData.courseId?.title || 'Chưa cập nhật'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 border-b border-gray-50 pb-4">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Giáo viên phụ trách
                </span>
                <div
                  className="flex items-center gap-2 text-gray-800 font-medium cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => navigate(PATHS.HR_TEACHERS_ID.replace(':id', classData.teacherId?._id || ''))}
                >
                  <UserIcon size={16} className="text-blue-400" />
                  <span className="underline decoration-blue-200 underline-offset-4">
                    {classData.teacherId?.fullName || 'Chưa phân công'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 border-b border-gray-50 pb-4">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phòng học mặc định</span>
                <div className="flex items-center gap-2 text-gray-800 font-medium">
                  <MapPin size={16} className="text-rose-400" />
                  <span
                    onClick={() => navigate(PATHS.SETTINGS_ROOMS_ID.replace(':id', classData.roomId?._id as string))}
                  >
                    {classData.roomId?.name || 'Chưa xếp phòng / Học Online'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tài liệu đính kèm</span>
                <div className="flex items-center gap-2 text-gray-800 font-medium">
                  <FileText size={16} className="text-emerald-400" />
                  <span>{classData.documents?.length || 0} tài liệu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Calendar size={20} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Lịch học định kỳ</h3>
              </div>

              {/* Nút Sinh lịch chỉ hiện khi chưa có lịch */}
              {schedulesList.length === 0 && (
                <Button
                  variant="outline"
                  icon={<Sparkles size={16} className="text-indigo-500" />}
                  className="border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                  onClick={() => setShowAutoScheduleModal(true)}
                >
                  Sinh lịch tự động
                </Button>
              )}
            </div>

            {loadingSchedules ? (
              <div className="h-20 flex items-center justify-center text-gray-400 animate-pulse">
                Đang tải thông tin lịch...
              </div>
            ) : scheduleSummary ? (
              <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-14 h-14 bg-white border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                    <Clock size={26} />
                  </div>
                  <div className="space-y-3 pt-1">
                    {scheduleSummary.details.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-800 w-[70px]">{item.dayName}:</span>
                        <span className="text-sm font-semibold text-indigo-700 bg-indigo-100/70 px-3 py-1 rounded-md border border-indigo-200 shadow-sm">
                          {item.shifts}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-indigo-100 w-full md:w-auto relative z-10">
                  <span className="text-sm font-bold bg-white border border-indigo-200 text-indigo-700 px-5 py-2 rounded-full shadow-sm mb-2">
                    Tổng cộng: {scheduleSummary.total} buổi học
                  </span>

                  {/* NÚT RESET LỊCH KHI BỊ SAI */}
                  <Button
                    variant="outline"
                    icon={<Trash2 size={14} />}
                    className="w-full text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                    onClick={() =>
                      setConfirmDeleteAll({
                        isOpen: true,
                        title: 'Xóa toàn bộ lịch học của lớp',
                        message: `Bạn chuẩn bị xóa sạch ${scheduleSummary.total} buổi học của lớp ${classData.name}. Hệ thống sẽ thu hồi toàn bộ lịch để bạn có thể sinh lại tự động từ đầu.\n\nHành động này không thể hoàn tác!`,
                      })
                    }
                  >
                    Làm lại lịch (Xóa tất cả)
                  </Button>

                  <button
                    onClick={() => navigate(PATHS.TRAINING_SCHEDULES)}
                    className="text-xs mt-2 font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-end gap-1 transition-colors w-full"
                  >
                    Chỉnh sửa từng buổi ở TKB →
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <Calendar size={44} className="mb-3 opacity-20" />
                <p className="text-sm font-medium text-gray-500 mb-3">Lớp học này chưa có thời khóa biểu</p>
                <Button variant="primary" onClick={() => setShowAutoScheduleModal(true)}>
                  Tạo lịch học ngay
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Danh sách Học viên</h3>
                <span className="ml-2 text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                  {classData.studentIds?.length || 0}
                </span>
              </div>

              <div className="w-64">
                <SearchInput
                  type="text"
                  placeholder="Tìm tên, SĐT học viên..."
                  value={searchInput}
                  setSearchInput={setSearchInput}
                  setPage={() => {}}
                />
              </div>
            </div>

            <div className="flex-1">
              {filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredStudents.map((student: any) => (
                    <div
                      key={student._id || student}
                      className="group flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm bg-gray-50/50 hover:bg-white transition-all cursor-pointer"
                      onClick={() => navigate(PATHS.TRANINING_STUDENT_ID.replace(':id', student._id))}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-inner">
                        {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                          {student.fullName || 'Học viên ẩn danh'}
                        </span>
                        <span className="text-xs text-gray-500 truncate mt-0.5">
                          {student.phone || student.email || `ID: ${student._id?.slice(-6) || student.slice(-6)}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30">
                  <Users size={48} className="mb-4 opacity-20" />
                  <p className="text-base font-medium text-gray-500 mb-1">
                    {searchInput
                      ? 'Không tìm thấy học viên nào khớp với từ khóa.'
                      : 'Lớp học này chưa có học viên nào.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;
