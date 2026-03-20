import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, BookOpen, AlertCircle, MessageSquare, Search, Loader2 } from 'lucide-react';
import Button from '../../../../components/Button';
import { attendanceService } from '../../../../services/attendance.service';
import type { IScheduleStat, IAttendanceRecord, IAttendance, AttendanceStatus, HomeworkStatus } from '../../../../types/attendance.type';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import useDebounce from '../../../../hooks/useDebounce';

const HighlightText = ({ text, highlight }: { text?: string; highlight: string }) => {
    if (!text) return null;
    if (!highlight || !highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? <strong key={i} className="text-blue-600 bg-blue-50/50">{part}</strong> : <span key={i}>{part}</span>
            )}
        </span>
    );
};

interface AttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    schedule: IScheduleStat;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, onSaveSuccess, schedule }) => {
    const [records, setRecords] = useState<IAttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const isSearching = searchTerm !== debouncedSearchTerm;

    useEffect(() => {
        if (isOpen && schedule?._id) {
            fetchInitialData();
        }
    }, [isOpen, schedule]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await attendanceService.getAttendanceBySchedule(schedule._id);
            if (res.success) {
                setRecords(res.data || []);
            } else {
                setError(res.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi tải dữ liệu điểm danh');
        } finally {
            setIsLoading(false);
        }
    };

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

    const filteredRecords = records.filter(record =>
        (record.studentInfo?.fullName || '').toLowerCase().includes((debouncedSearchTerm || '').toLowerCase())
    );

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const dataToSave: IAttendance[] = records.map(r => r.attendance);
            const res = await attendanceService.upsertAttendances(dataToSave);
            if (res.success) {
                onSaveSuccess();
            } else {
                setError(res.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi lưu dữ liệu điểm danh');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-primary p-6 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-bold">Điểm danh lớp: {schedule.className}</h3>
                        <p className="text-sm opacity-80 mt-1">
                            Ca: {schedule.shiftName} | Ngày: {format(new Date(schedule.date), 'dd/MM/yyyy', { locale: vi })}
                        </p>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
                    {error && (
                        <div className="mb-4 flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 italic">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div className="mb-6 relative max-w-md">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo Tên học sinh..."
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm shadow-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 size={18} className="text-primary animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2 opacity-60">
                            <BookOpen size={48} strokeWidth={1} />
                            <p className="text-lg italic">Lớp học chưa có học viên</p>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2 opacity-60">
                            <Search size={48} strokeWidth={1} />
                            <p className="text-lg italic">
                                Không tìm thấy kết quả nào hiển thị cho: <span className="font-bold">"{searchTerm}"</span>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredRecords.map((record) => (
                                <div key={record.studentInfo._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 lg:items-center">
                                    <div className="flex items-center gap-4 w-[250px] shrink-0">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold uppercase shrink-0">
                                            {record.studentInfo.fullName.charAt(0)}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-gray-800 truncate">
                                                <HighlightText text={record.studentInfo.fullName} highlight={debouncedSearchTerm} />
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-2 rounded-lg flex gap-1">
                                            <button
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all text-xs font-medium ${record.attendance.status === 'PRESENT'
                                                    ? 'bg-green-500 text-white shadow-md'
                                                    : 'text-gray-500 hover:bg-green-100 hover:text-green-600'
                                                    }`}
                                                onClick={() => updateAttendanceStatus(record.studentInfo._id, 'PRESENT')}
                                            >
                                                <CheckCircle size={14} /> Có mặt
                                            </button>
                                            <button
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all text-xs font-medium ${record.attendance.status === 'LATE'
                                                    ? 'bg-yellow-500 text-white shadow-md'
                                                    : 'text-gray-500 hover:bg-yellow-100 hover:text-yellow-600'
                                                    }`}
                                                onClick={() => updateAttendanceStatus(record.studentInfo._id, 'LATE')}
                                            >
                                                <Clock size={14} /> Đi trễ
                                            </button>
                                            <button
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all text-xs font-medium ${record.attendance.status === 'ABSENT'
                                                    ? 'bg-red-500 text-white shadow-md'
                                                    : 'text-gray-500 hover:bg-red-100 hover:text-red-600'
                                                    }`}
                                                onClick={() => updateAttendanceStatus(record.studentInfo._id, 'ABSENT')}
                                            >
                                                <XCircle size={14} /> Vắng
                                            </button>
                                        </div>

                                        <div className="bg-gray-50 p-2 rounded-lg flex gap-1">
                                            <button
                                                className={`flex-1 py-1.5 px-2 rounded-md transition-all text-xs font-medium ${record.attendance.homework === 'DONE'
                                                    ? 'bg-blue-500 text-white shadow-md'
                                                    : 'text-gray-500 hover:bg-blue-100 hover:text-blue-600'
                                                    }`}
                                                onClick={() => updateHomeworkStatus(record.studentInfo._id, 'DONE')}
                                            >
                                                Đã làm BTVN
                                            </button>
                                            <button
                                                className={`flex-1 py-1.5 px-2 rounded-md transition-all text-xs font-medium ${record.attendance.homework === 'NOT_DONE'
                                                    ? 'bg-orange-500 text-white shadow-md'
                                                    : 'text-gray-500 hover:bg-orange-100 hover:text-orange-600'
                                                    }`}
                                                onClick={() => updateHomeworkStatus(record.studentInfo._id, 'NOT_DONE')}
                                            >
                                                Chưa làm BTVN
                                            </button>
                                            <button
                                                className={`flex-1 py-1.5 px-2 rounded-md transition-all text-xs font-medium ${record.attendance.homework === 'NO_HOMEWORK'
                                                    ? 'bg-gray-300 text-gray-700 shadow-md'
                                                    : 'text-gray-500 hover:bg-gray-200'
                                                    }`}
                                                onClick={() => updateHomeworkStatus(record.studentInfo._id, 'NO_HOMEWORK')}
                                            >
                                                Không có BTVN
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-full lg:w-[250px] shrink-0">
                                        <div className="relative">
                                            <MessageSquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                className="w-full text-sm py-2 pl-9 pr-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                placeholder="Nhận xét của GV..."
                                                value={record.attendance.teacherComment || ''}
                                                onChange={(e) => updateComment(record.studentInfo._id, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white p-5 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={isSaving || records.length === 0}>
                        {isSaving ? 'Đang lưu...' : 'Lưu điểm danh'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceModal;
