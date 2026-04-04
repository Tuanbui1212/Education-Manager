import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User as UserIcon } from 'lucide-react';

import TablePagination from '../../../../components/TablePagination';
import TableSkeleton from '../../../../components/TableSkeleton';
import Button from '../../../../components/Button';
import ConfirmModal from '../../../../components/ConfirmModal';
import SelectField from '../../../../components/SelectField';

import useFetch from '../../../../hooks/useFetch';
import { attendanceService } from '../../../../services/attendance.service';
import type { IAttendanceRecord, IAttendance } from '../../../../types/attendance.type';
import type { AttendanceStatus, HomeworkStatus } from '../../../../types/attendance.type';

const AttendanceDetails = () => {
    const navigate = useNavigate();
    const { classId, scheduleId } = useParams<{ classId: string; scheduleId: string }>();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [records, setRecords] = useState<IAttendanceRecord[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success' as 'success' | 'danger' | 'warning' | 'info',
        onConfirm: () => { },
    });

    const queryParams = { page, limit };

    const {
        data: responseData,
        loading,
        totalCount,
        error: fetchError
    } = useFetch(
        () => attendanceService.getAttendanceList({ classId: classId!, scheduleId: scheduleId!, ...queryParams }),
        null,
        [classId, scheduleId, page, limit]
    );

    useEffect(() => {
        if (responseData) {
            setRecords(responseData);
        }
    }, [responseData]);

    if (fetchError && !confirmConfig.isOpen) {
        setConfirmConfig({
            isOpen: true,
            title: 'Lỗi hệ thống',
            message: fetchError,
            type: 'danger',
            onConfirm: () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                navigate(`/training/attendances/${classId}`);
            }
        });
    }

    const updateAttendanceStatus = (studentId: string, status: AttendanceStatus) => {
        setRecords(prev => {
            const newRecords = [...prev];
            const index = newRecords.findIndex(r => r.studentInfo._id === studentId);
            if (index > -1) newRecords[index].attendance.status = status;
            return newRecords;
        });
    };

    const updateHomeworkStatus = (studentId: string, hw: HomeworkStatus) => {
        setRecords(prev => {
            const newRecords = [...prev];
            const index = newRecords.findIndex(r => r.studentInfo._id === studentId);
            if (index > -1) newRecords[index].attendance.homework = hw;
            return newRecords;
        });
    };

    const updateComment = (studentId: string, comment: string) => {
        setRecords(prev => {
            const newRecords = [...prev];
            const index = newRecords.findIndex(r => r.studentInfo._id === studentId);
            if (index > -1) newRecords[index].attendance.teacherComment = comment;
            return newRecords;
        });
    };

    const updateMark = (studentId: string, markValue: string) => {
        setRecords(prev => {
            const newRecords = [...prev];
            const index = newRecords.findIndex(r => r.studentInfo._id === studentId);
            if (index > -1) {
                newRecords[index].attendance.mark = markValue === '' ? undefined : Number(markValue);
            }
            return newRecords;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const dataToSave: IAttendance[] = records.map(r => r.attendance);
            const res = await attendanceService.upsertAttendances(dataToSave);
            if (res.success) {
                setConfirmConfig({
                    isOpen: true,
                    title: 'Thành công',
                    message: 'Lưu điểm danh thành công!',
                    type: 'success',
                    onConfirm: () => {
                        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                        navigate(`/training/attendances/${classId}`);
                    }
                });
            } else {
                setConfirmConfig({
                    isOpen: true,
                    title: 'Lỗi',
                    message: res.message,
                    type: 'danger',
                    onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
                });
            }
        } catch (err: any) {
            setConfirmConfig({
                isOpen: true,
                title: 'Lỗi',
                message: err.response?.data?.message || 'Lỗi lưu dữ liệu điểm danh',
                type: 'danger',
                onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            });
        } finally {
            setIsSaving(false);
        }
    };

    const renderTableBody = () => {
        if (loading) return <TableSkeleton columns={6} />;

        if (!records || records.length === 0) {
            return (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                            <UserIcon className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-base font-medium text-gray-900 mb-1">Không có học viên</p>
                            <p className="text-sm">Hiện chưa có học viên nào trong lớp.</p>
                        </div>
                    </td>
                </tr>
            );
        }

        return records.map((record) => (
            <tr key={record.studentInfo._id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                <td className="px-4 md:px-6 py-4">
                    <div className="flex flex-col">
                        <span
                            className="font-semibold text-primary cursor-pointer hover:underline"
                            onClick={() => window.open(`/training/students/${record.studentInfo._id}`, '_blank')}
                        >
                            {record.studentInfo.fullName}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">{record.studentInfo.code}</span>
                    </div>
                </td>
                <td className="px-4 md:px-6 py-4">
                    <div className="flex gap-2">
                        <SelectField
                            label=""
                            className={`px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-1 transition-colors ${record.attendance.status === 'PRESENT' ? 'bg-green-50 border-green-200 text-green-700 focus:ring-green-500' :
                                record.attendance.status === 'LATE' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 focus:ring-yellow-500' :
                                    'bg-red-50 border-red-200 text-red-700 focus:ring-red-500'
                                }`}
                            value={record.attendance.status}
                            onChange={(e) => updateAttendanceStatus(record.studentInfo._id, e.target.value as AttendanceStatus)}
                        >
                            <option value="PRESENT">Có mặt</option>
                            <option value="LATE">Đi trễ</option>
                            <option value="ABSENT">Vắng mặt</option>
                        </SelectField>
                    </div>
                </td>
                <td className="px-4 md:px-6 py-4">
                    <SelectField
                        label=""
                        className={`px-3 py-1.5 rounded-lg border text-sm w-full focus:outline-none focus:ring-1 transition-colors ${record.attendance.homework === 'DONE' ? 'bg-blue-50 border-blue-200 text-blue-700 focus:ring-blue-500' :
                            record.attendance.homework === 'NOT_DONE' ? 'bg-orange-50 border-orange-200 text-orange-700 focus:ring-orange-500' :
                                'bg-gray-50 border-gray-200 text-gray-700 focus:ring-gray-500'
                            }`}
                        value={record.attendance.homework}
                        onChange={(e) => updateHomeworkStatus(record.studentInfo._id, e.target.value as HomeworkStatus)}
                    >
                        <option value="DONE">Đã làm BTVN</option>
                        <option value="NOT_DONE">Chưa làm BTVN</option>
                        <option value="NO_HOMEWORK">Không có BTVN</option>
                    </SelectField>
                </td>
                <td className="px-4 md:px-6 py-4">
                    <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-gray-300 transition-all text-center"
                        placeholder="Điểm"
                        value={record.attendance.mark !== undefined ? record.attendance.mark : ''}
                        onChange={(e) => updateMark(record.studentInfo._id, e.target.value)}
                    />
                </td>
                <td className="px-4 md:px-6 py-4">
                    <input
                        type="text"
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-gray-300 transition-all"
                        placeholder="Thêm nhận xét..."
                        value={record.attendance.teacherComment || ''}
                        onChange={(e) => updateComment(record.studentInfo._id, e.target.value)}
                    />
                </td>
            </tr>
        ));
    };

    return (
        <div className="p-8 w-full animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                        title="Quay lại danh sách"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Chi tiết Điểm danh
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Chi tiết điểm danh
                        </p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving || loading}>
                    {isSaving ? (
                        <>
                            <div className="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <Save size={18} className="mr-2" />
                            Lưu thay đổi
                        </>
                    )}
                </Button>
            </div>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                confirmText={confirmConfig.type === 'success' ? 'Tiếp tục' : 'Đóng'}
                cancelText=""
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Học sinh</th>
                                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái Điểm danh</th>
                                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái BTVN</th>
                                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Điểm</th>
                                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nhận xét của GV</th>
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

export default AttendanceDetails;
