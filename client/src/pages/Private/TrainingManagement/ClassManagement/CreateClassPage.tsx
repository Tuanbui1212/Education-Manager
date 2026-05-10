import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import PageHeader from '../../../../components/PageHeader';
import Button from '../../../../components/Button';
import InputField from '../../../../components/InputField';
import Combobox from '../../../../components/Combobox';
import { PATHS } from '../../../../utils/constants';
import { toast } from 'react-toastify';
import { classService } from '../../../../services/class.service';
import { courseService } from '../../../../services/course.service';
import { userService } from '../../../../services/user.service';
import { roomService } from '../../../../services/room.service';
import { roleService } from '../../../../services/role.service';
import useFetch from '../../../../hooks/useFetch';

const DAYS_WEEK = [
    { label: 'Thứ 2', dow: 1 }, { label: 'Thứ 3', dow: 2 }, { label: 'Thứ 4', dow: 3 },
    { label: 'Thứ 5', dow: 4 }, { label: 'Thứ 6', dow: 5 }, { label: 'Thứ 7', dow: 6 },
];

const SESSION_OPTIONS = [
    { value: 'morning', label: 'Ca sáng' },
    { value: 'afternoon', label: 'Ca chiều' },
    { value: 'evening', label: 'Ca tối' },
] as const;

interface ClassForm {
    name: string;
    courseId: string;
    teacherId: string;
    roomId: string;
    lessonsPerWeek: number;
    totalLessons: number;
    maxNumberOfStudents: number;
    startDate: string;
    optionalRequirements?: string[];
}

const EMPTY_FORM: ClassForm = {
    name: '',
    courseId: '',
    teacherId: '',
    roomId: '',
    lessonsPerWeek: 1,
    totalLessons: 0,
    maxNumberOfStudents: 30,
    startDate: '',
    optionalRequirements: [],
};

export default function CreateClassPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState<ClassForm>(EMPTY_FORM);
    const [loading, setLoading] = useState(false);

    // Lấy roleId của teacher
    const { data: rolesData } = useFetch(roleService.getRoles, {}, []);
    const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];
    const teacherRoleId = useMemo(() => roles.find((r: any) => r.name?.toLowerCase() === 'teacher')?._id || '', [roles]);

    const toggleRequirement = (req: string) => {
        const cur = form.optionalRequirements || [];
        setForm({ ...form, optionalRequirements: cur.includes(req) ? cur.filter(x => x !== req) : [...cur, req] });
    };

    const searchTeachers = useCallback(async (q: string) => {
        if (!teacherRoleId) return [];
        const r = await userService.getUsers({ search: q, roleId: teacherRoleId as string, limit: 10, status: 'ACTIVE' });
        return r.data || [];
    }, [teacherRoleId]);

    const searchCourses = useCallback(async (q: string) => {
        const r = await courseService.getCourses({ search: q, limit: 10 });
        return r.data || [];
    }, []);

    const searchRooms = useCallback(async (q: string) => {
        const r = await roomService.getRooms({ search: q, limit: 20, status: 'ACTIVE' });
        return (r.data || []).filter((room: any) => room.capacity >= form.maxNumberOfStudents);
    }, [form.maxNumberOfStudents]);

    const handleSubmit = async () => {
        if (!form.name) {
            toast.warn('Vui lòng điền tên lớp'); return;
        }
        if (!form.courseId) {
            toast.warn('Vui lòng chọn khóa học'); return;
        }
        if (!form.teacherId) {
            toast.warn('Vui lòng chọn giáo viên'); return;
        }
        if (!form.startDate) {
            toast.warn('Vui lòng chọn ngày bắt đầu'); return;
        }
        if (!form.totalLessons || form.totalLessons <= 0 || !Number.isInteger(form.totalLessons)) {
            toast.warn('Tổng số buổi học phải là số nguyên > 0'); return;
        }

        setLoading(true);
        try {
            const startDateISO = new Date(form.startDate).toISOString();

            const res = await classService.createClass({
                name: form.name,
                courseId: form.courseId,
                teacherId: form.teacherId,
                roomId: form.roomId || undefined, // Tùy chọn
                maxNumberOfStudents: form.maxNumberOfStudents,
                lessonsPerWeek: form.lessonsPerWeek,
                totalLessons: form.totalLessons,
                startDate: startDateISO as any,
                optionalRequirements: form.optionalRequirements,
                status: 'UPCOMING' as any,
                documents: [],
                studentIds: []
            } as any);

            if (!res.success) {
                throw new Error(res.message || 'Có lỗi xảy ra khi tạo lớp');
            }

            toast.success(`Đã tạo lớp ${form.name} thành công!`);
            setTimeout(() => {
                navigate(PATHS.TRAINING_CLASSES);
            }, 1500);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 w-full animate-in fade-in duration-300">
            <div className='flex gap-5 items-center'>
                <button
                    onClick={() => navigate(PATHS.TRAINING_CLASSES)}
                    className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    <ArrowLeft size={14} />
                </button>
                <PageHeader title="Tạo lớp học mới" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-2/3 mx-auto mt-4">
                <div className="p-6 space-y-4">
                    <InputField label="Tên lớp *" value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Vd: IELTS-K01" />

                    <Combobox label="Khóa học *" placeholder="Tìm khóa học..."
                        onSearch={searchCourses}
                        onSelect={(c: any) => setForm({ ...form, courseId: c?._id || '', totalLessons: c?.totalLessons || form.totalLessons })}
                        getDisplayValue={(c: any) => c?.title} />

                    <Combobox label="Giáo viên *" placeholder="Tìm giáo viên..."
                        onSearch={searchTeachers}
                        onSelect={(t: any) => setForm({ ...form, teacherId: t?._id || '' })}
                        getDisplayValue={(t: any) => t?.fullName} />

                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Buổi/tuần *" type="number" min={1} step={1} value={form.lessonsPerWeek}
                            onChange={e => setForm({ ...form, lessonsPerWeek: +e.target.value })} />
                        <InputField label="Tổng số buổi *" type="number" min={1} step={1}
                            value={form.totalLessons || ''} placeholder="Vd: 24"
                            onChange={e => setForm({ ...form, totalLessons: +e.target.value })} />
                    </div>

                    <InputField label="Sĩ số tối đa *" type="number" min={1} step={1} value={form.maxNumberOfStudents}
                        onChange={e => setForm({ ...form, maxNumberOfStudents: +e.target.value })} />

                    <InputField label="Ngày bắt đầu *" type="date" value={form.startDate}
                        onChange={e => setForm({ ...form, startDate: e.target.value })} />

                    <Combobox label="Phòng mong muốn (tùy chọn)" placeholder="Tìm phòng học..."
                        onSearch={searchRooms}
                        onSelect={(r: any) => setForm({ ...form, roomId: r?._id || '' })}
                        getDisplayValue={(r: any) => r?.name} />

                    {/* Ca học ưu tiên */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1.5">Ca học ưu tiên</label>
                        <div className="flex gap-2 flex-wrap">
                            {SESSION_OPTIONS.map(s => (
                                <button key={s.value} onClick={() => toggleRequirement(s.value)}
                                    className={`px-3 py-1 rounded-full text-xs border transition-all ${(form.optionalRequirements || []).includes(s.value)
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
                                    className={`px-2.5 py-1 rounded-full text-xs border transition-all ${(form.optionalRequirements || []).includes(`day.${d.dow}`)
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
                                    className={`px-2.5 py-1 rounded-full text-xs border transition-all ${(form.optionalRequirements || []).includes(`noDay.${d.dow}`)
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
                            { key: 'preferEarlyWeek', label: 'Ưu tiên đầu tuần' },
                            { key: 'noSameDay', label: 'Không dạy 2 buổi cùng ngày' },
                            { key: 'noConsec', label: 'Không dạy ngày liền - dãn đều' },
                        ].map(opt => (
                            <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox"
                                    checked={(form.optionalRequirements || []).includes(opt.key)}
                                    onChange={() => toggleRequirement(opt.key)}
                                    className="w-3.5 h-3.5 accent-primary" />
                                <span className="text-xs text-gray-600">{opt.label}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={() => navigate(PATHS.TRAINING_CLASSES)}>
                            Hủy
                        </Button>
                        <Button variant="primary" icon={<Save size={16} />} onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Thêm lớp học'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
