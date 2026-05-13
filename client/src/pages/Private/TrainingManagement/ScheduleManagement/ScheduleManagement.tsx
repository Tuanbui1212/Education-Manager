import { Edit2, Trash2, Calendar, UserCheck, DoorOpen, Users, X, Filter } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import Button from '../../../../components/Button';
import PageHeader from '../../../../components/PageHeader';
import TablePagination from '../../../../components/TablePagination';
import ConfirmModal from '../../../../components/ConfirmModal';
import Combobox from '../../../../components/Combobox';
import InputField from '../../../../components/InputField';

import ScheduleModal from './ScheduleModal';

import useFetch from '../../../../hooks/useFetch';
import { scheduleService } from '../../../../services/schedule.service';
import { userService } from '../../../../services/user.service';
import { classService } from '../../../../services/class.service';
import { roomService } from '../../../../services/room.service';

import type { ISchedule } from '../../../../types/schedule.type';

const ScheduleManagement = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [classFilter, setClassFilter] = useState<{ _id: string; name: string } | null>(null);
  const [teacherFilter, setTeacherFilter] = useState<{ _id: string; fullName: string } | null>(null);
  const [roomFilter, setRoomFilter] = useState<{ _id: string; name: string } | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');

  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ISchedule | null>(null);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
  });

  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger' as 'success' | 'danger' | 'warning' | 'info',
    confirmText: '',
    cancelText: '',
    onConfirm: () => { },
  });

  const queryParams: any = {
    page,
    limit,
    classStatus: 'ACTIVE',
    ...(classFilter && { classId: classFilter._id }),
    ...(teacherFilter && { teacherId: teacherFilter._id }),
    ...(roomFilter && { roomId: roomFilter._id }),
    ...(dateFilter && { date: dateFilter }),
  };

  const {
    data: schedules,
    loading,
    error,
    totalCount,
    refetch: fetchSchedules,
  } = useFetch(scheduleService.getSchedules, queryParams, [
    page,
    limit,
    classFilter,
    teacherFilter,
    roomFilter,
    dateFilter,
  ]);

  const handleClassSearch = async (query: string) => {
    const res = await classService.getClasses({ search: query, status: 'ACTIVE', limit: 10 });
    return res.data || [];
  };

  const handleTeacherSearch = async (query: string) => {
    const res = await userService.getUsers({ search: query, limit: 10 });
    return res.data || [];
  };

  const handleRoomSearch = async (query: string) => {
    const res = await roomService.getRooms({ search: query, limit: 10 });
    return res.data || [];
  };

  const handleEditSchedule = async (formData: Partial<ISchedule>) => {
    if (!selectedSchedule?._id) return;
    try {
      const data = await scheduleService.updateSchedule(selectedSchedule._id, formData);
      if (data.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          message: 'Cập nhật lịch học thành công!',
          type: 'success',
        });
        fetchSchedules();
        setShowModal(false);
        setSelectedSchedule(null);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.message || 'Có lỗi xảy ra!';
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: detailError,
        type: 'danger',
      });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const data = await scheduleService.deleteSchedule(id);
      if (data.success) {
        setConfirmDelete({
          isOpen: true,
          title: 'Thành công',
          message: 'Xóa buổi học thành công!',
          type: 'success',
          onConfirm: () => setConfirmDelete({ ...confirmDelete, isOpen: false }),
          cancelText: '',
          confirmText: 'Xác nhận',
        });
        fetchSchedules();
        setShowModal(false);
        setSelectedSchedule(null);
      }
    } catch (error: any) {
      setConfirmDelete({
        isOpen: true,
        title: 'Lỗi',
        message: 'Có lỗi xảy ra khi xóa buổi học!',
        type: 'danger',
        confirmText: '',
        cancelText: '',
        onConfirm: () => { },
      });
    }
  };

  const clearFilters = () => {
    setClassFilter(null);
    setTeacherFilter(null);
    setRoomFilter(null);
    setDateFilter('');
    setPage(1);
  };

  const totalPages = Math.ceil((totalCount || 0) / limit);
  const hasFilters = classFilter || teacherFilter || roomFilter || dateFilter;

  if (error) return <div className="p-8 text-red-500 text-center">Lỗi: {error}</div>;

  return (
    <div className="p-8 w-full animate-in fade-in duration-500">
      {showModal && (
        <ScheduleModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedSchedule(null);
          }}
          onSubmit={handleEditSchedule}
          initialData={selectedSchedule || undefined}
        />
      )}

      <PageHeader title="Quản lý Thời khóa biểu toàn trung tâm" />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Đóng"
        cancelText=""
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={() => confirmDelete.onConfirm()}
        title={confirmDelete.title}
        message={confirmDelete.message}
        type={confirmDelete.type}
        confirmText={confirmDelete.confirmText}
        cancelText={confirmDelete.cancelText}
      />

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Button
          variant="outline"
          icon={<Filter size={18} />}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`relative ${isFilterOpen ? 'bg-violet-50 text-violet-700 border-violet-200' : ''}`}
        >
          {isFilterOpen ? 'Đóng bộ lọc' : 'Mở bộ lọc tìm kiếm'}
          {hasFilters && !isFilterOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
          >
            <X size={16} /> Xóa bộ lọc
          </button>
        )}
      </div>

      {isFilterOpen && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Combobox
              label="Theo lớp học"
              icon={<Users size={16} />}
              placeholder="Lọc theo Lớp học..."
              onSearch={handleClassSearch}
              onSelect={(item) => {
                setClassFilter(item);
                setPage(1);
              }}
              getDisplayValue={(item) => item?.name}
              initialValue={classFilter?.name || ''}
              direction="down"
            />

            <Combobox
              label="Theo giảng viên"
              icon={<UserCheck size={16} />}
              placeholder="Lọc theo Giảng viên..."
              onSearch={handleTeacherSearch}
              onSelect={(item) => {
                setTeacherFilter(item);
                setPage(1);
              }}
              getDisplayValue={(item) => item?.fullName}
              initialValue={teacherFilter?.fullName || ''}
              direction="down"
            />

            <Combobox
              label="Theo phòng học"
              icon={<DoorOpen size={16} />}
              placeholder="Lọc theo Phòng học..."
              onSearch={handleRoomSearch}
              onSelect={(item) => {
                setRoomFilter(item);
                setPage(1);
              }}
              getDisplayValue={(item) => item?.name}
              initialValue={roomFilter?.name || ''}
              direction="down"
            />

            <InputField
              label="Theo ngày"
              type="date"
              icon={<Calendar size={16} />}
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm sticky top-0 z-10">
              <th className="p-4 font-semibold w-16 text-center">STT</th>
              <th className="p-4 font-semibold">Lớp học</th>
              <th className="p-4 font-semibold">Ngày & Ca học</th>
              <th className="p-4 font-semibold">Giảng viên</th>
              <th className="p-4 font-semibold">Phòng học</th>
              <th className="p-4 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="p-8 bg-gray-50/50"></td>
                </tr>
              ))
            ) : schedules && schedules.length > 0 ? (
              schedules.map((schedule: any, index: number) => {
                const classData = schedule.classId || {};
                const teacherData = schedule.teacherId || {};
                const roomData = schedule.roomId || {};
                const shiftData = schedule.shiftId || {};

                return (
                  <tr key={schedule._id} className="hover:bg-violet-50/50 transition-colors group">
                    <td className="p-4 text-gray-500 font-medium text-center">{index + 1 + (page - 1) * limit}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{classData.name || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-text-main">
                          {schedule.date ? format(new Date(schedule.date), 'EEEE, dd/MM/yyyy', { locale: vi }) : 'N/A'}
                        </div>
                        <div className="text-sm flex items-center gap-1.5 text-gray-600 bg-gray-100 w-fit px-2 py-0.5 rounded-md">
                          <Calendar size={14} className="text-gray-500" />
                          {shiftData.name || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-100 text-text-main flex items-center justify-center font-bold text-xs">
                          {teacherData.fullName?.charAt(0) || 'U'}
                        </div>
                        <span className="font-medium text-gray-700">{teacherData.fullName || 'Chưa phân công'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-text-main bg-fuchsia-50 border border-fuchsia-100 w-fit px-2.5 py-1 rounded-lg">
                        <DoorOpen size={14} />
                        {roomData.name || 'Online'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setShowModal(true);
                          }}
                          className="p-2.5 text-primary hover:bg-violet-100 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Chỉnh sửa / Đổi giáo viên dạy thay"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDelete({
                              isOpen: true,
                              title: 'Xác nhận xóa',
                              message: `Bạn có chắc chắn muốn xóa buổi học ngày ${format(new Date(schedule.date), 'dd/MM/yyyy')} của lớp ${classData.name}?`,
                              type: 'danger',
                              confirmText: 'Xác nhận xóa',
                              cancelText: 'Hủy',
                              onConfirm: () => handleDeleteSchedule(schedule._id),
                            });
                          }}
                          className="p-2.5 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Xóa buổi học"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-20 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-4">
                    <Calendar size={64} strokeWidth={1} className="opacity-20" />
                    <p className="text-xl font-medium italic">Không tìm thấy lịch học nào</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination totalPages={totalPages} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
    </div>
  );
};

export default ScheduleManagement;
