import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  BookOpen,
  User,
  CalendarDays,
  Building2,
  Settings2,
  Clock,
  BanIcon,
  ChevronRight,
} from 'lucide-react';
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

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS_WEEK = [
  { label: 'T2', dow: 1 },
  { label: 'T3', dow: 2 },
  { label: 'T4', dow: 3 },
  { label: 'T5', dow: 4 },
  { label: 'T6', dow: 5 },
  { label: 'T7', dow: 6 },
];

const SESSION_OPTIONS = [
  { value: 'morning', label: 'Ca sáng' },
  { value: 'afternoon', label: 'Ca chiều' },
  { value: 'evening', label: 'Ca tối' },
] as const;

const SCHEDULE_OPTS = [
  { key: 'preferEarlyWeek', label: 'Ưu tiên đầu tuần' },
  { key: 'noSameDay', label: 'Không dạy 2 buổi cùng ngày' },
  { key: 'noConsec', label: 'Không dạy ngày liền – dãn đều' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Tiêu đề nhóm trường trong form */
function SectionHeading({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-primary">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Pill toggle dùng chung cho ca học, ngày ưu tiên, ngày cấm */
function PillToggle({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: 'primary' | 'emerald' | 'red';
  onClick: () => void;
}) {
  const colorMap = {
    primary: {
      active: 'bg-primary text-white border-primary',
      idle: 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary',
    },
    emerald: {
      active: 'bg-emerald-500 text-white border-emerald-500',
      idle: 'bg-white text-gray-500 border-gray-200 hover:border-emerald-400 hover:text-emerald-600',
    },
    red: {
      active: 'bg-red-500 text-white border-red-500',
      idle: 'bg-white text-gray-500 border-gray-200 hover:border-red-400 hover:text-red-500',
    },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all select-none ${active ? colorMap[color].active : colorMap[color].idle}`}
    >
      {label}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
    setForm({
      ...form,
      optionalRequirements: cur.includes(req) ? cur.filter((x) => x !== req) : [...cur, req],
    });
  };

  const has = (req: string) => (form.optionalRequirements || []).includes(req);

  // Search callbacks
  const searchTeachers = useCallback(
    async (q: string) => {
      if (!teacherRoleId) return [];
      const r = await userService.getUsers({ search: q, roleId: teacherRoleId as string, limit: 10, status: 'ACTIVE' });
      return r.data || [];
    },
    [teacherRoleId],
  );

  const searchCourses = useCallback(async (q: string) => {
    const r = await courseService.getCourses({ search: q, limit: 10 });
    return r.data || [];
  }, []);

  const searchRooms = useCallback(
    async (q: string) => {
      const r = await roomService.getRooms({ search: q, limit: 20, status: 'ACTIVE' });
      return (r.data || []).filter((room: any) => room.capacity >= form.maxNumberOfStudents);
    },
    [form.maxNumberOfStudents],
  );

  const handleSubmit = async () => {
    if (!form.name) {
      toast.warn('Vui lòng điền tên lớp');
      return;
    }
    if (!form.courseId) {
      toast.warn('Vui lòng chọn khóa học');
      return;
    }
    if (!form.teacherId) {
      toast.warn('Vui lòng chọn giáo viên');
      return;
    }
    if (!form.startDate) {
      toast.warn('Vui lòng chọn ngày bắt đầu');
      return;
    }
    if (!form.totalLessons || form.totalLessons <= 0 || !Number.isInteger(form.totalLessons)) {
      toast.warn('Tổng số buổi học phải là số nguyên > 0');
      return;
    }

    setLoading(true);
    try {
      const res = await classService.createClass({
        name: form.name,
        courseId: form.courseId,
        teacherId: form.teacherId,
        roomId: form.roomId || undefined,
        maxNumberOfStudents: form.maxNumberOfStudents,
        lessonsPerWeek: form.lessonsPerWeek,
        totalLessons: form.totalLessons,
        startDate: new Date(form.startDate).toISOString() as any,
        optionalRequirements: form.optionalRequirements,
        status: 'UPCOMING' as any,
        documents: [],
        studentIds: [],
      } as any);

      if (!res.success) throw new Error(res.message || 'Có lỗi xảy ra khi tạo lớp');

      toast.success(`Đã tạo lớp ${form.name} thành công!`);
      setTimeout(() => navigate(PATHS.TRAINING_CLASSES), 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 w-full animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="flex gap-4 items-center mb-6">
        <button
          onClick={() => navigate(PATHS.TRAINING_CLASSES)}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} />
        </button>
        <PageHeader title="Tạo lớp học mới" />
      </div>

      {/* ── 2-column layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5 items-start">
        {/* ════ CỘT TRÁI — Thông tin lớp học ════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {/* Nhóm 1: Thông tin cơ bản */}
          <div className="p-6 space-y-4">
            <SectionHeading
              icon={<BookOpen size={14} />}
              title="Thông tin cơ bản"
              subtitle="Tên lớp, khóa học và giáo viên phụ trách"
            />
            <InputField
              label="Tên lớp *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: IELTS-K01"
            />
            <Combobox
              label="Khóa học *"
              placeholder="Tìm khóa học..."
              onSearch={searchCourses}
              onSelect={(c: any) =>
                setForm({
                  ...form,
                  courseId: c?._id || '',
                  totalLessons: c?.totalLessons || form.totalLessons,
                })
              }
              getDisplayValue={(c: any) => c?.title}
            />
            <Combobox
              label="Giáo viên *"
              placeholder="Tìm giáo viên..."
              onSearch={searchTeachers}
              onSelect={(t: any) => setForm({ ...form, teacherId: t?._id || '' })}
              getDisplayValue={(t: any) => t?.fullName}
            />
          </div>

          {/* Nhóm 2: Lịch học */}
          <div className="p-6 space-y-4">
            <SectionHeading
              icon={<CalendarDays size={14} />}
              title="Lịch học"
              subtitle="Thời lượng và ngày khai giảng"
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Buổi / tuần *"
                type="number"
                min={1}
                step={1}
                value={form.lessonsPerWeek}
                onChange={(e) => setForm({ ...form, lessonsPerWeek: +e.target.value })}
              />
              <InputField
                label="Tổng số buổi *"
                type="number"
                min={1}
                step={1}
                value={form.totalLessons || ''}
                placeholder="VD: 24"
                onChange={(e) => setForm({ ...form, totalLessons: +e.target.value })}
              />
            </div>
            <InputField
              label="Ngày bắt đầu *"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>

          {/* Nhóm 3: Phòng & Sĩ số */}
          <div className="p-6 space-y-4">
            <SectionHeading
              icon={<Building2 size={14} />}
              title="Phòng học & Sĩ số"
              subtitle="Phòng sẽ được tự động xếp nếu bỏ trống"
            />
            <InputField
              label="Sĩ số tối đa *"
              type="number"
              min={1}
              step={1}
              value={form.maxNumberOfStudents}
              onChange={(e) => setForm({ ...form, maxNumberOfStudents: +e.target.value })}
            />
            <Combobox
              label="Phòng mong muốn (tùy chọn)"
              placeholder="Tìm phòng học..."
              onSearch={searchRooms}
              onSelect={(r: any) => setForm({ ...form, roomId: r?._id || '' })}
              getDisplayValue={(r: any) => r?.name}
            />
          </div>

          {/* ── Actions ── */}
          <div className="px-6 py-4 flex justify-end gap-3 bg-gray-50/60 rounded-b-2xl">
            <Button variant="outline" icon={<ArrowLeft size={15} />} onClick={() => navigate(PATHS.TRAINING_CLASSES)}>
              Hủy
            </Button>
            <Button variant="primary" icon={<Save size={15} />} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang lưu...' : 'Thêm lớp học'}
            </Button>
          </div>
        </div>

        {/* ════ CỘT PHẢI — Tùy chọn xếp lịch ════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 xl:sticky xl:top-6">
          {/* Header card phải */}
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Settings2 size={14} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Tùy chọn xếp lịch</p>
              <p className="text-xs text-gray-400">Gợi ý cho hệ thống, không bắt buộc</p>
            </div>
          </div>

          {/* Ca học ưu tiên */}
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <Clock size={12} /> Ca học ưu tiên
            </p>
            <div className="flex gap-2 flex-wrap">
              {SESSION_OPTIONS.map((s) => (
                <PillToggle
                  key={s.value}
                  label={s.label}
                  active={has(s.value)}
                  color="primary"
                  onClick={() => toggleRequirement(s.value)}
                />
              ))}
            </div>
          </div>

          {/* Ngày ưu tiên dạy */}
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <CalendarDays size={12} /> Ngày ưu tiên dạy
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS_WEEK.map((d) => (
                <PillToggle
                  key={d.dow}
                  label={d.label}
                  active={has(`day.${d.dow}`)}
                  color="emerald"
                  onClick={() => toggleRequirement(`day.${d.dow}`)}
                />
              ))}
            </div>
          </div>

          {/* Ngày không muốn dạy */}
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <BanIcon size={12} /> Ngày không muốn dạy
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS_WEEK.map((d) => (
                <PillToggle
                  key={d.dow}
                  label={d.label}
                  active={has(`noDay.${d.dow}`)}
                  color="red"
                  onClick={() => toggleRequirement(`noDay.${d.dow}`)}
                />
              ))}
            </div>
          </div>

          {/* Tùy chọn nâng cao */}
          <div className="px-5 py-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <ChevronRight size={12} /> Tùy chọn nâng cao
            </p>
            {SCHEDULE_OPTS.map((opt) => (
              <label key={opt.key} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={has(opt.key)}
                  onChange={() => toggleRequirement(opt.key)}
                  className="w-3.5 h-3.5 accent-primary rounded"
                />
                <span className="text-xs text-gray-600 group-hover:text-gray-800 transition-colors">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
