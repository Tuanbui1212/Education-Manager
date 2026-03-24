import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, Users, UserCheck, UserX, CheckCircle2, XCircle, ArrowLeft, ClipboardList } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';

import TablePagination from '../../../../components/TablePagination';
import TableSkeleton from '../../../../components/TableSkeleton';

import useFetch from '../../../../hooks/useFetch';
import { attendanceService } from '../../../../services/attendance.service';
import ConfirmModal from '../../../../components/ConfirmModal';

const AttendanceSchedules = () => {
    const navigate = useNavigate();
    const { classId } = useParams<{ classId: string }>();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const queryParams = {
        page,
        limit,
    };

    const {
        data: schedulesData,
        loading,
        totalCount,
        error: fetchError
    } = useFetch(
        () => attendanceService.getSchedulesByClass({ classId: classId!, ...queryParams }),
        null,
        [classId, page, limit]
    );

    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger' as 'success' | 'danger' | 'warning' | 'info',
        onConfirm: () => { },
    });

    if (fetchError && !confirmConfig.isOpen) {
        setConfirmConfig({
            isOpen: true,
            title: 'Lỗi',
            message: fetchError,
            type: 'danger',
            onConfirm: () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                navigate('/training/attendances');
            }
        });
    }

    const getScheduleStatus = (dateString: string) => {
        const scheduleDate = startOfDay(new Date(dateString));
        const today = startOfDay(new Date());

        if (isBefore(scheduleDate, today)) {
            return {
                text: 'Đã kết thúc',
                className: 'bg-gray-100 text-gray-700 border-gray-200'
            };
        }
        return {
            text: 'Chưa bắt đầu',
            className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
    };

    const renderTableBody = () => {
        if (loading) {
            return <TableSkeleton columns={7} />;
        }

        if (!schedulesData || schedulesData.length === 0) {
            return (
                <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                            <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-base font-medium text-gray-900 mb-1">Không có lịch học</p>
                            <p className="text-sm">Lớp học này hiện chưa có lịch học nào.</p>
                        </div>
                    </td>
                </tr>
            );
        }

        return schedulesData.map((schedule) => {
            const status = getScheduleStatus(schedule.date);

            return (
                <tr key={schedule._id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                    <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                                {format(new Date(schedule.date), 'dd/MM/yyyy', { locale: vi })}
                            </span>
                            <span className="text-xs text-gray-500 mt-1 flex items-center">
                                <Clock size={12} className="mr-1" /> {schedule.shiftName}
                            </span>
                        </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                            {status.text}
                        </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center">
                        <div className="flex items-center justify-center text-gray-700">
                            <Users size={16} className="mr-1.5 text-gray-400" />
                            {schedule.totalStudents}
                        </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center">
                        <div className="flex items-center justify-center text-green-600 font-medium">
                            <UserCheck size={16} className="mr-1.5" />
                            {schedule.presentCount}
                        </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center">
                        <div className="flex items-center justify-center text-red-600 font-medium">
                            <UserX size={16} className="mr-1.5" />
                            {schedule.absentCount}
                        </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center">
                        <div className="flex justify-center">
                            {schedule.isAttended ? (
                                <CheckCircle2 size={24} className="text-green-500" />
                            ) : (
                                <XCircle size={24} className="text-red-500" />
                            )}
                        </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                        <button
                            onClick={() => navigate(`/training/attendances/${classId}/list/${schedule._id}`)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90 rounded-xl shadow-sm"
                        >
                            <ClipboardList size={16} />
                            Điểm danh
                        </button>
                    </td>
                </tr>
            );
        });
    };

    return (
        <div className="p-8 w-full animate-in fade-in duration-500">
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={confirmConfig.onConfirm}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                confirmText={confirmConfig.type === 'danger' ? 'Quay lại' : 'Đóng'}
                cancelText=""
            />

            <div className="flex items-center gap-4 mb-8">
                <button
                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                    title="Quay lại danh sách"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Lịch học - {schedulesData?.[0]?.className || 'Lớp học'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Chi tiết lịch học
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày học</th>
                                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Tổng HSV</th>
                                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Tham dự</th>
                                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Vắng mặt</th>
                                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái điểm danh</th>
                                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {renderTableBody()}
                        </tbody>
                    </table>
                </div>
                <TablePagination
                    totalPages={Math.ceil((totalCount || 0) / limit)}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                />
            </div>

        </div>
    );
};

export default AttendanceSchedules;
