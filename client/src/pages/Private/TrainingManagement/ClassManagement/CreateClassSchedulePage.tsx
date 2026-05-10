import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Save, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../../../components/PageHeader';
import Button from '../../../../components/Button';
import InputField from '../../../../components/InputField';
import Combobox from '../../../../components/Combobox';
import { PATHS } from '../../../../utils/constants';

import { classService } from '../../../../services/class.service';
import { shiftService } from '../../../../services/shift.service';
import { roomService } from '../../../../services/room.service';
import { scheduleService } from '../../../../services/schedule.service';

import type { IClass } from '../../../../types/class.type';
import type { IShift } from '../../../../types/shift.type';
import type { IRoom } from '../../../../types/room.type';
import type { ISchedule } from '../../../../types/schedule.type';

const DAYS_WEEK = [
    { label: 'Thứ 2', dow: 1 }, { label: 'Thứ 3', dow: 2 }, { label: 'Thứ 4', dow: 3 },
    { label: 'Thứ 5', dow: 4 }, { label: 'Thứ 6', dow: 5 }, { label: 'Thứ 7', dow: 6 },
];

const SESSION_OPTIONS = [
    { value: 'morning', label: 'Ca sáng' },
    { value: 'afternoon', label: 'Ca chiều' },
    { value: 'evening', label: 'Ca tối' },
] as const;

export default function CreateClassSchedulePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [classData, setClassData] = useState<IClass | null>(null);
    const [shifts, setShifts] = useState<IShift[]>([]);

    // Lịch cũ của giảng viên để phát hiện trùng lặp
    const [teacherSchedules, setTeacherSchedules] = useState<ISchedule[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form inputs cho các trường được phép sửa
    const [roomId, setRoomId] = useState<string>('');
    const [optionalRequirements, setOptionalRequirements] = useState<string[]>([]);

    // Danh sách slot được chọn
    const [slots, setSlots] = useState<{ dow: number, shiftId: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) return;
                setLoading(true);
                const [classRes, shiftRes] = await Promise.all([
                    classService.getClassById(id),
                    shiftService.getShifts({ limit: 100 })
                ]);

                const cls = classRes.data;
                setClassData(cls as any);
                setShifts((shiftRes.data || []).sort((a: any, b: any) => a.startTime.localeCompare(b.startTime)));

                if ((cls as any).roomId) setRoomId(typeof (cls as any).roomId === 'string' ? (cls as any).roomId : (cls as any).roomId._id);
                setOptionalRequirements((cls as any).optionalRequirements || []);

                const teacherId = typeof (cls as any).teacherId === 'string' ? (cls as any).teacherId : (cls as any).teacherId._id;
                if (teacherId) {
                    const schedRes = await scheduleService.getSchedules({ teacherId, limit: 2000 });
                    setTeacherSchedules(schedRes.data || []);
                }
            } catch (err) {
                toast.error('Lỗi khi tải thông tin lớp học');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const teacherBusySlots = useMemo(() => {
        const busy = new Set<string>();
        teacherSchedules.forEach(sched => {
            const date = new Date(sched.date as string | Date);
            let dow = date.getDay();
            // 0=Sun, 1=Mon... 6=Sat
            if (dow === 0) dow = 7;
            const shiftId = typeof sched.shiftId === 'string' ? sched.shiftId : sched.shiftId._id;
            busy.add(`${shiftId}-${dow}`);
        });
        return busy;
    }, [teacherSchedules]);

    const searchRooms = async (q: string) => {
        const r = await roomService.getRooms({ search: q, limit: 10 });
        return r.data || [];
    };

    const toggleRequirement = (req: string) => {
        if (optionalRequirements.includes(req)) {
            setOptionalRequirements(optionalRequirements.filter(r => r !== req));
        } else {
            setOptionalRequirements([...optionalRequirements, req]);
        }
    };

    const handleCellClick = (shiftId: string, dow: number) => {
        setSlots(prev => {
            const exists = prev.find(s => s.shiftId === shiftId && s.dow === dow);
            if (exists) return prev.filter(s => s.shiftId !== shiftId || s.dow !== dow);
            if (prev.length >= (classData?.lessonsPerWeek || 0)) {
                toast.error(`Không thể chọn quá ${classData?.lessonsPerWeek} buổi học/tuần`);
                return prev;
            }
            return [...prev, { shiftId, dow }];
        });
    };

    const generateSchedules = () => {
        if (!classData || !classData.startDate || slots.length === 0) return [];

        const sortedSlots = [...slots].sort((a, b) => a.dow - b.dow);
        const result = [];
        let currentDate = new Date(classData.startDate);
        currentDate.setHours(0, 0, 0, 0);

        let lessonsScheduled = 0;
        const total = classData.totalLessons || 0;
        let iterations = 0;

        while (lessonsScheduled < total && iterations < 1000) {
            iterations++;
            let currentDow = currentDate.getDay();
            if (currentDow === 0) currentDow = 7;

            const matchingSlot = sortedSlots.find(s => s.dow === currentDow);
            if (matchingSlot) {
                result.push({
                    classId: classData._id,
                    teacherId: typeof classData.teacherId === 'string' ? classData.teacherId : classData.teacherId?._id,
                    roomId: roomId || undefined,
                    shiftId: matchingSlot.shiftId,
                    date: new Date(currentDate).toISOString()
                });
                lessonsScheduled++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return result;
    };

    const saveAll = async () => {
        if (!classData) return;
        if (slots.length === 0) {
            toast.warn('Vui lòng chọn ít nhất 1 buổi học trong thời khóa biểu');
            return;
        }
        if (slots.length !== (classData.lessonsPerWeek || 0)) {
            toast.warn(`Bạn cần chọn đúng ${classData.lessonsPerWeek} buổi mỗi tuần. Hiện đang chọn ${slots.length} buổi.`);
            return;
        }

        const schedulesToCreate = generateSchedules();

        setSaving(true);
        try {
            if (roomId || optionalRequirements.length > 0) {
                await classService.updateClass(classData._id as string, {
                    roomId,
                    optionalRequirements
                });
            }

            await scheduleService.createSchedulesBulk(schedulesToCreate as any, classData.startDate as string);

            toast.success('Tạo lịch học thành công');
            navigate(PATHS.TRAINING_CLASSES);
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 flex justify-center text-gray-500">Đang tải dữ liệu...</div>;
    }

    if (!classData) {
        return <div className="p-6 flex justify-center text-red-500">Không tìm thấy thông tin lớp học</div>;
    }

    return (
        <div className="p-6 w-full animate-in fade-in duration-300">
            <div className='flex gap-5 items-center'>
                <button
                    onClick={() => navigate(PATHS.TRAINING_CLASSES)}
                    className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    <ArrowLeft size={14} />
                </button>
                <PageHeader title={`Xếp lịch học ${classData.name}`} />
            </div>


            <div className="flex gap-5" style={{ alignItems: 'flex-start' }}>
                {/* ── LEFT PANEL ── */}
                <div className="w-80 shrink-0 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-primary px-5 py-3 flex items-center gap-2">
                            <span className="text-white font-semibold text-sm">Thông tin lớp học</span>
                        </div>
                        <div className="p-4 space-y-3">
                            <InputField label="Tên lớp" value={classData.name} onChange={() => { }} disabled />

                            <InputField label="Khóa học" value={(classData.courseId as any)?.title || ''} onChange={() => { }} disabled />

                            <InputField label="Giáo viên" value={(classData.teacherId as any)?.fullName || ''} onChange={() => { }} disabled />

                            <div className="grid grid-cols-2 gap-2">
                                <InputField label="Buổi/tuần" value={classData.lessonsPerWeek?.toString()} onChange={() => { }} disabled />
                                <InputField label="Tổng số buổi" value={classData.totalLessons?.toString()} onChange={() => { }} disabled />
                            </div>

                            <InputField label="Sĩ số tối đa" value={classData.maxNumberOfStudents?.toString()} onChange={() => { }} disabled />

                            <InputField label="Ngày bắt đầu" value={classData.startDate ? new Date(classData.startDate).toLocaleDateString('vi-VN') : ''} onChange={() => { }} disabled />

                            <Combobox label="Phòng mong muốn (tùy chọn)" placeholder="Để trống → tự chọn phòng"
                                initialValue={(classData.roomId as any)?.name || ''}
                                onSearch={searchRooms}
                                onSelect={r => setRoomId(r?._id || '')}
                                getDisplayValue={(r: any) => r?.name} />

                            <hr className="border-gray-100 my-4" />

                            {/* Ca học ưu tiên */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1.5">Ca học ưu tiên</label>
                                <div className="flex gap-2 flex-wrap">
                                    {SESSION_OPTIONS.map(s => (
                                        <button key={s.value} onClick={() => toggleRequirement(s.value)}
                                            className={`px-3 py-1 rounded-full text-xs border transition-all ${optionalRequirements.includes(s.value)
                                                ? 'bg-primary text-white border-primary'
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-primary'}`}>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ngày ưu tiên dạy */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1.5">Ngày ưu tiên dạy</label>
                                <div className="flex gap-1 flex-wrap">
                                    {DAYS_WEEK.map(d => (
                                        <button key={d.dow} onClick={() => toggleRequirement(`day.${d.dow}`)}
                                            className={`px-2.5 py-1 rounded-full text-xs border transition-all ${optionalRequirements.includes(`day.${d.dow}`)
                                                ? 'bg-emerald-500 text-white border-emerald-500'
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-400'}`}>
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ngày không muốn dạy */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1.5">Ngày không muốn dạy</label>
                                <div className="flex gap-1 flex-wrap">
                                    {DAYS_WEEK.map(d => (
                                        <button key={d.dow} onClick={() => toggleRequirement(`noDay.${d.dow}`)}
                                            className={`px-2.5 py-1 rounded-full text-xs border transition-all ${optionalRequirements.includes(`noDay.${d.dow}`)
                                                ? 'bg-red-500 text-white border-red-500'
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-red-400'}`}>
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tùy chọn điểm */}
                            <div className="space-y-2 pt-1">
                                <label className="text-xs font-medium text-gray-500 block">Tùy chọn xếp lịch</label>
                                {[
                                    { key: 'preferEarlyWeek', label: 'Ưu tiên đầu tuần', badge: '+5đ' },
                                    { key: 'noSameDay', label: 'Không dạy 2 buổi cùng ngày', badge: '-40đ/buổi' },
                                    { key: 'noConsec', label: 'Không dạy ngày liền – dãn đều', badge: '-35đ/cặp' },
                                ].map(opt => (
                                    <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox"
                                            checked={optionalRequirements.includes(opt.key)}
                                            onChange={() => toggleRequirement(opt.key)}
                                            className="w-3.5 h-3.5 accent-primary" />
                                        <span className="text-xs text-gray-600">{opt.label}</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ml-auto ${opt.badge.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                            {opt.badge}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <Button variant="primary" icon={<Save size={16} />} onClick={saveAll} disabled={slots.length === 0 || saving}>
                                {saving ? 'Đang lưu...' : 'Xác nhận & Tạo lịch học'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL: Timetable ── */}
                <div className="flex-1 min-w-0 mb-4">
                    <div className="bg-white border rounded-2xl border-gray-100 shadow-sm">
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                            <Calendar size={18} className="text-primary" />
                            <span className="font-semibold text-gray-800">Chọn thời khóa biểu</span>
                            {slots.length > 0 && (
                                <span className="ml-auto text-xs text-emerald-600 font-medium">
                                    Đã chọn {slots.length} / {classData.lessonsPerWeek} buổi mỗi tuần
                                </span>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50/30">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse bg-white rounded-xl overflow-hidden ring-1 ring-gray-100 table-fixed">
                                    <thead>
                                        <tr>
                                            <th className="p-3 border-b border-r border-gray-100 bg-gray-50 w-20"></th>
                                            {DAYS_WEEK.map(d => (
                                                <th key={d.dow} className="p-3 border-b border-r border-gray-100 bg-gray-50 text-center font-semibold text-gray-700 text-xs">
                                                    {d.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shifts.map(shift => (
                                            <tr key={shift._id}>
                                                <td className="p-2 border-b border-r border-gray-100 bg-gray-50/80 text-center">
                                                    <div className="font-semibold text-gray-700 text-xs">{shift.name}</div>
                                                    <div className="text-gray-400 text-[10px]">{shift.startTime}–{shift.endTime}</div>
                                                </td>
                                                {DAYS_WEEK.map(d => {
                                                    const isSelected = slots.some(s => s.shiftId === shift._id?.toString() && s.dow === d.dow);
                                                    const isTeacherBusy = teacherBusySlots.has(`${shift._id?.toString()}-${d.dow}`);

                                                    let cellClasses = 'p-1.5 border-b border-r border-gray-100 align-top transition-all duration-150 cursor-pointer ';

                                                    if (isSelected) {
                                                        cellClasses += 'bg-emerald-50 ring-2 ring-emerald-400 ring-inset hover:bg-emerald-100 ';
                                                    } else if (isTeacherBusy) {
                                                        cellClasses += 'bg-red-50/30 ring-2 ring-red-400 ring-inset hover:bg-red-50 ';
                                                    } else {
                                                        cellClasses += 'hover:bg-gray-50 ';
                                                    }

                                                    return (
                                                        <td key={d.dow}
                                                            className={cellClasses}
                                                            style={{ minHeight: 70 }}
                                                            onClick={() => handleCellClick(shift._id?.toString() || "", d.dow)}>

                                                            {isSelected && (
                                                                <div className="flex flex-col items-center justify-center h-full min-h-[4rem] p-1.5 rounded-lg border border-emerald-200 bg-emerald-100 shadow-sm animate-in zoom-in-95">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className="w-2 h-2 rounded-full shrink-0 bg-emerald-500" />
                                                                        <div className="font-semibold text-xs text-emerald-800 truncate text-center max-w-[80px]">{classData.name}</div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {isTeacherBusy && !isSelected && (
                                                                <div className="flex flex-col items-center justify-center h-full min-h-[4rem] p-1.5">
                                                                    <AlertCircle size={14} className="text-red-400 mb-1" />
                                                                    <div className="text-[10px] text-red-500 font-medium text-center">Giáo viên bận</div>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
