import { ClipboardCheck, Users, Clock, Filter, X } from 'lucide-react';
import { useState } from 'react';

import Button from '../../../../components/Button';
import PageHeader from '../../../../components/PageHeader';
import TablePagination from '../../../../components/TablePagination';
import TableSkeleton from '../../../../components/TableSkeleton';
import Combobox from '../../../../components/Combobox';

import AttendanceModal from './AttendanceModal';

import useFetch from '../../../../hooks/useFetch';
import { attendanceService } from '../../../../services/attendance.service';
import { classService } from '../../../../services/class.service';
import { shiftService } from '../../../../services/shift.service';

import type { IScheduleStat } from '../../../../types/attendance.type';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const AttendanceManagement = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Filters
    const [classFilter, setClassFilter] = useState<{ id: string, name: string } | null>(null);
    const [shiftFilter, setShiftFilter] = useState<{ id: string, name: string } | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<IScheduleStat | null>(null);

    const hasFilters = classFilter || shiftFilter;
    const queryParams = {
        page,
        limit,
        classId: classFilter?.id || undefined,
        shiftId: shiftFilter?.id || undefined,
    };

    const {
        data: schedules,
        loading,
        error,
        totalCount: total,
        refetch: fetchSchedules,
    } = useFetch(attendanceService.getScheduleStats, queryParams, [page, limit, classFilter?.id, shiftFilter?.id]);

    const openAttendanceModal = (scheduleData: IScheduleStat) => {
        setSelectedSchedule(scheduleData);
        setShowAttendanceModal(true);
    };

    const handleModalClose = (needRefresh: boolean) => {
        setShowAttendanceModal(false);
        setSelectedSchedule(null);
        if (needRefresh) {
            fetchSchedules();
        }
    };

    const resetFilters = () => {
        setClassFilter(null);
        setShiftFilter(null);
        setPage(1);
    };

    const totalPages = Math.ceil((total || 0) / limit);

    if (error) return <div className="p-8 text-red-500 text-center font-bold">Lỗi hệ thống: {error}</div>;

    return (
        <div className="p-8 w-full animate-in fade-in duration-500">
            {showAttendanceModal && selectedSchedule && (
                <AttendanceModal
                    isOpen={showAttendanceModal}
                    onClose={() => handleModalClose(false)}
                    onSaveSuccess={() => handleModalClose(true)}
                    schedule={selectedSchedule}
                />
            )}

            <PageHeader title="Quản lý điểm danh" />

            <div className="flex flex-wrap items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    icon={<Filter size={18} />}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`relative ${isFilterOpen ? 'bg-violet-50 text-violet-700 border-violet-200' : ''}`}
                >
                    {isFilterOpen ? 'Đóng bộ lọc' : 'Mở bộ lọc tìm kiếm'}
                </Button>

                {hasFilters && (
                    <button
                        onClick={resetFilters}
                        className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
                    >
                        <X size={16} /> Xóa bộ lọc
                    </button>
                )}
            </div>

            {isFilterOpen && (
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Combobox
                            label="Theo lớp học"
                            icon={<Users size={16} />}
                            placeholder="Lọc theo Lớp học..."
                            onSearch={async (q) => {
                                const res = await classService.getClasses({ search: q, limit: 10 });
                                return res.data || [];
                            }}
                            onSelect={(item) => {
                                setClassFilter(item ? { id: item._id, name: item.name } : null);
                                setPage(1);
                            }}
                            getDisplayValue={(item) => item?.name}
                            initialValue={classFilter?.name || ''}
                            direction="down"
                        />

                        <Combobox
                            label="Theo ca học"
                            icon={<Clock size={16} />}
                            placeholder="Lọc theo Ca học..."
                            onSearch={async (q) => {
                                const res = await shiftService.getShifts({ search: q, limit: 10 });
                                return res.data || [];
                            }}
                            onSelect={(item) => {
                                setShiftFilter(item ? { id: item._id, name: item.name } : null);
                                setPage(1);
                            }}
                            getDisplayValue={(item) => item?.name}
                            initialValue={shiftFilter?.name || ''}
                            direction="down"
                        />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative transition-all hover:shadow-xl hover:shadow-gray-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-primary text-white">
                                <th className="p-5 font-bold text-xs uppercase tracking-wider w-16 text-center">No.</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider">Lớp học</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider">Ca học</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider">Ngày học</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider text-center">Sĩ số</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider text-center">Có mặt</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider text-center">Vắng mặt</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {loading ? (
                                <TableSkeleton columns={8} rows={limit} />
                            ) : schedules && schedules.length > 0 ? (
                                schedules.map((item: IScheduleStat, index: number) => {
                                    return (
                                        <tr key={item._id} className="hover:bg-blue-50/40 transition-all cursor-pointer group">
                                            <td className="p-5 text-gray-400 font-medium text-center">
                                                {index + 1 + (page - 1) * limit}
                                            </td>
                                            <td className="p-5">
                                                <div className="font-semibold text-blue-600">
                                                    {item.className || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-medium text-gray-700">
                                                    {item.shiftName || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-medium text-gray-700">
                                                    {format(new Date(item.date), 'dd/MM/yyyy', { locale: vi })}
                                                </div>
                                            </td>
                                            <td className="p-5 flex items-center justify-center">
                                                <div className={`font-medium ${new Date(item.date) > new Date() ? 'text-green-600 bg-green-100 rounded-full px-2 py-1'
                                                    : 'text-red-500 bg-red-100 rounded-full px-2 py-1'}`}>
                                                    {new Date(item.date) > new Date() ? 'Chưa bắt đầu' : 'Đã kết thúc'}
                                                </div>
                                            </td>
                                            <td className="p-5 text-center font-bold text-gray-600">
                                                {item.totalStudents}
                                            </td>
                                            <td className="p-5 text-center font-bold text-green-600">
                                                {item.presentCount}
                                            </td>
                                            <td className="p-5 text-center font-bold text-red-500">
                                                {item.absentCount}
                                            </td>
                                            <td className="p-5 flex items-center justify-center">
                                                <Button
                                                    variant="primary"
                                                    icon={<ClipboardCheck size={16} />}
                                                    onClick={() => openAttendanceModal(item)}
                                                >
                                                    Điểm danh
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-20 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-4">
                                            <ClipboardCheck size={64} strokeWidth={1} className="opacity-20" />
                                            <p className="text-xl font-medium italic">Không tìm thấy ca học nào</p>
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

export default AttendanceManagement;
