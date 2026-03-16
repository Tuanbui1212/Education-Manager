import { Plus, Edit2, Trash2, Calendar, UserCheck, DoorOpen, Users, Filter, X } from 'lucide-react';
import { useState } from 'react';

import Button from '../../../../components/Button';
import PageHeader from '../../../../components/PageHeader';
import TablePagination from '../../../../components/TablePagination';
import ConfirmModal from '../../../../components/ConfirmModal';
import TableSkeleton from '../../../../components/TableSkeleton';
import Combobox from '../../../../components/Combobox';

import ScheduleModal from './ScheduleModal';

import useFetch from '../../../../hooks/useFetch';
import { scheduleService } from '../../../../services/schedule.service';
import { userService } from '../../../../services/user.service';
import { classService } from '../../../../services/class.service';
import { roomService } from '../../../../services/room.service';

import type { ISchedule } from '../../../../types/schedule.type';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ScheduleManagement = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);

    // Filters
    const [classFilter, setClassFilter] = useState<{ id: string, name: string } | null>(null);
    const [teacherFilter, setTeacherFilter] = useState<{ id: string, name: string } | null>(null);
    const [roomFilter, setRoomFilter] = useState<{ id: string, name: string } | null>(null);

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<ISchedule | null>(null);

    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success' as 'success' | 'danger' | 'warning' | 'info',
        onConfirm: () => { },
    });

    const queryParams = {
        page,
        limit,
        classId: classFilter?.id || undefined,
        teacherId: teacherFilter?.id || undefined,
        roomId: roomFilter?.id || undefined,
    };

    const {
        data: schedules,
        loading,
        error,
        totalCount,
        refetch: fetchSchedules,
    } = useFetch(scheduleService.getSchedules, queryParams, [page, limit, classFilter?.id, teacherFilter?.id, roomFilter?.id]);

    const handleCreateSchedule = async (formData: Partial<ISchedule>) => {
        try {
            const res = await scheduleService.createSchedule(formData);
            if (res.success) {
                setConfirmConfig({
                    isOpen: true,
                    title: 'Thông báo',
                    message: res.message,
                    type: 'success',
                    onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
                });
                fetchSchedules();
                setShowScheduleModal(false);
            }
        } catch (error: any) {
            const detailError = error.response?.data?.message || 'Có lỗi xảy ra khi tạo lịch học!';
            setConfirmConfig({
                isOpen: true,
                title: 'Lỗi',
                message: detailError,
                type: 'danger',
                onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
            });
        }
    };

    const handleUpdateSchedule = async (formData: Partial<ISchedule>) => {
        if (!selectedSchedule?._id) return;

        try {
            const res = await scheduleService.updateSchedule(selectedSchedule._id, formData);
            if (res.success) {
                setConfirmConfig({
                    isOpen: true,
                    title: 'Thông báo',
                    message: res.message,
                    type: 'success',
                    onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
                });
                fetchSchedules();
                setShowScheduleModal(false);
                setSelectedSchedule(null);
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

    const handleDeleteSchedule = async (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc chắn muốn xóa lịch học này?',
            type: 'warning',
            onConfirm: async () => {
                try {
                    const res = await scheduleService.deleteSchedule(id);
                    if (res.success) {
                        setConfirmConfig({
                            isOpen: true,
                            title: 'Thông báo',
                            message: res.message,
                            type: 'success',
                            onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
                        });
                        fetchSchedules();
                    }
                } catch (error: any) {
                    const detailError = error.response?.data?.message || 'Có lỗi xảy ra khi xóa!';
                    setConfirmConfig({
                        isOpen: true,
                        title: 'Lỗi',
                        message: detailError,
                        type: 'danger',
                        onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
                    });
                }
            },
        });
    };

    const openEditModal = (scheduleData: ISchedule) => {
        setSelectedSchedule(scheduleData);
        setShowScheduleModal(true);
    };

    const resetFilters = () => {
        setClassFilter(null);
        setTeacherFilter(null);
        setRoomFilter(null);
        setPage(1);
    };

    const totalPages = Math.ceil((totalCount || 0) / limit);

    if (error) return <div className="p-8 text-red-500 text-center font-bold">Lỗi hệ thống: {error}</div>;

    return (
        <div className="p-8 w-full animate-in fade-in duration-500">
            {showScheduleModal && (
                <ScheduleModal
                    isOpen={showScheduleModal}
                    onClose={() => {
                        setShowScheduleModal(false);
                        setSelectedSchedule(null);
                    }}
                    onSubmit={selectedSchedule && selectedSchedule?._id ? handleUpdateSchedule : handleCreateSchedule}
                    initialData={selectedSchedule || undefined}
                />
            )}

            <PageHeader title="Quản lý lịch học" />

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                confirmText="Đồng ý"
                cancelText={confirmConfig.type === 'warning' ? 'Hủy' : ''}
            />

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            <Filter size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Tìm kiếm lịch học</h3>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {(classFilter || teacherFilter || roomFilter) && (
                            <Button variant="outline" onClick={resetFilters} className="text-red-500 border-red-200 hover:bg-red-50">
                                <X size={16} /> Xóa lọc
                            </Button>
                        )}
                        <Button variant="primary" icon={<Plus size={20} />} onClick={() => setShowScheduleModal(true)}>
                            Tạo lịch học mới
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Combobox
                        label="Lớp học"
                        icon={<Users size={16} />}
                        placeholder="Chọn lớp học..."
                        onSearch={async (q) => {
                            const res = await classService.getClasses({ search: q, limit: 10 });
                            return res.data || [];
                        }}
                        onSelect={(item) => {
                            setClassFilter(item ? { id: item._id, name: item.name } : null);
                            setPage(1);
                        }}
                        getDisplayValue={(item) => item.name}
                        initialValue={classFilter?.name || ''}
                    />

                    <Combobox
                        label="Giảng viên"
                        icon={<UserCheck size={16} />}
                        placeholder="Chọn giảng viên..."
                        onSearch={async (q) => {
                            const res = await userService.getUsers({ search: q, roleId: '69a955701a7df7d94923859d', limit: 10 });
                            return res.data || [];
                        }}
                        onSelect={(item) => {
                            setTeacherFilter(item ? { id: item._id, name: item.fullName } : null);
                            setPage(1);
                        }}
                        getDisplayValue={(item) => item.fullName}
                        initialValue={teacherFilter?.name || ''}
                    />

                    <Combobox
                        label="Phòng học"
                        icon={<DoorOpen size={16} />}
                        placeholder="Chọn phòng học..."
                        onSearch={async (q) => {
                            const res = await roomService.getRooms({ search: q, limit: 10 });
                            return res.data || [];
                        }}
                        onSelect={(item) => {
                            setRoomFilter(item ? { id: item._id, name: item.name } : null);
                            setPage(1);
                        }}
                        getDisplayValue={(item) => item.name}
                        initialValue={roomFilter?.name || ''}
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative transition-all hover:shadow-xl hover:shadow-gray-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-primary text-white">
                                <th className="p-5 font-bold text-xs uppercase tracking-wider w-16 text-center">No.</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider">Ngày học</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider">Ca học</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider">Lớp học</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider">Giảng viên</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider">Phòng</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {loading ? (
                                <TableSkeleton columns={7} rows={limit} />
                            ) : schedules && schedules.length > 0 ? (
                                schedules.map((item: any, index: number) => {
                                    return (
                                        <tr key={item._id} className="hover:bg-blue-50/40 transition-all cursor-pointer group">
                                            <td className="p-5 text-gray-400 font-medium text-center">
                                                {index + 1 + (page - 1) * limit}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2 text-primary font-bold">
                                                    <Calendar size={16} />
                                                    {format(new Date(item.date), 'dd/MM/yyyy', { locale: vi })}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-medium text-gray-700">
                                                    {typeof item.shiftId === 'object' ? item.shiftId?.name : item.shiftId}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-semibold text-blue-600">
                                                    {typeof item.classId === 'object' ? item.classId?.name : item.classId}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <UserCheck size={16} className="text-gray-400" />
                                                    <span className="font-medium">{typeof item.teacherId === 'object' ? item.teacherId?.fullName : item.teacherId || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <DoorOpen size={16} className="text-gray-400" />
                                                    <span className="font-medium">{typeof item.roomId === 'object' ? item.roomId?.name : item.roomId}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className="flex items-center justify-center gap-4">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit2 size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSchedule(item._id)}
                                                        className="p-2.5 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110"
                                                        title="Xóa"
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
                                    <td colSpan={7} className="p-20 text-center text-gray-400">
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
        </div>
    );
};

export default ScheduleManagement;
