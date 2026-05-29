import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  GraduationCap,
  Banknote,
  Clock,
  CheckCircle2,
  Edit,
  BookOpen,
  User as UserIcon,
  Award,
  Building,
} from 'lucide-react';

import { formatCurrency, formatDate, getStatusUserStyles } from '../../../../utils/format.util';
import useFetch from '../../../../hooks/useFetch';
import { userService } from '../../../../services/user.service';
import { shiftService } from '../../../../services/shift.service';
import { scheduleService } from '../../../../services/schedule.service';
import Button from '../../../../components/Button';
import TeacherModal from './TeacherModal';
import ConfirmModal from '../../../../components/ConfirmModal';
import type { IUser } from '../../../../types/user.type';
import { STATUS_OPTIONS } from '../../../../utils/constants';

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label?: string; value?: string }) => (
  <div className="flex items-center gap-3 text-gray-600">
    <div className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg shrink-0">{icon}</div>
    <span className="text-sm">
      {label && <span className="text-gray-400">{label}: </span>}
      <span className="font-medium">{value || '—'}</span>
    </span>
  </div>
);

const StatCard = ({ label, value, icon, bg }: { label: string; value: string; icon: React.ReactNode; bg: string }) => (
  <div className={`${bg} rounded-xl p-4 flex flex-col gap-2`}>
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-bold text-gray-800 break-words">{value}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const TeacherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: teacherData, loading, error, refetch } = useFetch(userService.getUserById, id as string, [id]);
  const { data: shiftsData } = useFetch(shiftService.getShifts, { limit: 100 }, []);

  const getCurrentWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { monday, sunday };
  };

  const { monday, sunday } = getCurrentWeekRange();

  const { data: schedulesResponse, loading: loadingSchedules } = useFetch(
    scheduleService.getSchedules,
    { teacherId: id, limit: 1000, startDateTime: monday, endDateTime: sunday },
    [id],
  );

  const shiftsList = Array.isArray(shiftsData) ? shiftsData : (shiftsData as any)?.data || [];
  const schedulesList = Array.isArray(schedulesResponse) ? schedulesResponse : (schedulesResponse as any)?.data || [];

  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as any,
  });

  const teacher = teacherData as IUser;

  const weeklySchedule = useMemo(() => {
    const days = [
      { label: 'Thứ 2', value: 1 },
      { label: 'Thứ 3', value: 2 },
      { label: 'Thứ 4', value: 3 },
      { label: 'Thứ 5', value: 4 },
      { label: 'Thứ 6', value: 5 },
      { label: 'Thứ 7', value: 6 },
      { label: 'CN', value: 0 },
    ];

    return days.map((day) => {
      const dayItems = shiftsList.map((shift: any) => {
        const assignedClass = schedulesList.find((s: any) => {
          const sDate = new Date(s.date);
          const sDay = sDate.getDay();
          const sShiftId = typeof s.shiftId === 'object' ? s.shiftId._id : s.shiftId;
          return sDay === day.value && sShiftId === shift._id;
        });
        return {
          shiftId: shift._id,
          shiftName: shift.name,
          className: assignedClass?.classId?.name || null,
          classId: assignedClass?.classId?._id || null,
        };
      });
      return { label: day.label, items: dayItems };
    });
  }, [shiftsList, schedulesList]);

  const handleUpdateInfo = async (formData: Partial<IUser>) => {
    try {
      const res = await userService.updateUser(id!, formData);
      if (res.success) {
        setConfirmConfig({ isOpen: true, title: 'Thành công', message: 'Cập nhật hồ sơ thành công!', type: 'success' });
        refetch();
        setShowEditModal(false);
      }
    } catch (err: any) {
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: err.response?.data?.message || 'Có lỗi xảy ra',
        type: 'danger',
      });
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải thông tin...</div>;
  if (error || !teacher)
    return <div className="p-8 text-center text-red-500">Lỗi: {error || 'Không tìm thấy dữ liệu'}</div>;

  const hasDegrees = (teacher.degrees?.length ?? 0) > 0;
  const hasCertificates = (teacher.certificates?.length ?? 0) > 0;
  const genderLabel = teacher.gender === 'MALE' ? 'Nam' : teacher.gender === 'FEMALE' ? 'Nữ' : 'Khác';
  const teacherType = teacher.teacher_info?.type === 'FULL_TIME' ? 'Cơ hữu' : 'Thỉnh giảng';

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {showEditModal && (
        <TeacherModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateInfo}
          initialData={teacher}
          teacherRoleId={(teacher.roleId as any)._id}
        />
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Đóng"
      />

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
            onClick={() => navigate(-1)}
            title="Quay lại"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hồ sơ Giáo viên</h1>
            <p className="text-sm text-gray-500 mt-0.5">Chi tiết thông tin và lịch giảng dạy</p>
          </div>
        </div>
        <Button variant="primary" icon={<Edit size={18} />} onClick={() => setShowEditModal(true)}>
          Chỉnh sửa hồ sơ
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ════════ CỘT TRÁI ════════ */}
        <div className="space-y-6">
          {/* Card Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-20 bg-primary" />

            <div className="px-6 pb-6 -mt-10">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-primary mb-3">
                {teacher.fullName.charAt(0).toUpperCase()}
              </div>

              <h2 className="text-xl font-bold text-gray-800">{teacher.fullName}</h2>

              {/* Type badge */}
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-600 font-medium bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg w-fit">
                <Building size={13} className="text-slate-400" />
                Giáo viên {teacherType}
              </div>

              {/* Status badge */}
              <div className="mt-3">
                <span className={getStatusUserStyles(teacher.status as string)}>
                  {STATUS_OPTIONS.find((opt) => opt.value === teacher.status)?.label || teacher.status}
                </span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-100 my-5" />

              {/* Thông tin liên hệ */}
              <div className="space-y-3">
                <InfoRow icon={<Phone size={15} className="text-gray-400" />} value={teacher.phone} />
                <InfoRow icon={<Mail size={15} className="text-gray-400" />} value={teacher.email} />
                <InfoRow
                  icon={<CalendarIcon size={15} className="text-gray-400" />}
                  label="Ngày sinh"
                  value={formatDate(teacher.date as any)}
                />
                <InfoRow
                  icon={<UserIcon size={15} className="text-gray-400" />}
                  label="Giới tính"
                  value={genderLabel}
                />
              </div>
            </div>
          </div>

          {/* Card Bằng cấp & Chứng chỉ */}
          {(hasDegrees || hasCertificates) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b pb-3 mb-4">
                <GraduationCap size={16} className="text-gray-500" /> Bằng cấp & Chứng chỉ
              </h3>
              {hasDegrees && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bằng cấp</p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.degrees!.map((d, i) => (
                      <span
                        key={i}
                        className="text-xs bg-info-bg text-info border border-blue-100 px-2.5 py-1 rounded-lg font-medium"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hasCertificates && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Award size={12} /> Chứng chỉ
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.certificates!.map((c, i) => (
                      <span
                        key={i}
                        className="text-xs bg-warning-bg text-warning-text border border-amber-100 px-2.5 py-1 rounded-lg font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ════════ CỘT PHẢI ════════ */}
        <div className="xl:col-span-2 space-y-6">
          {/* Card Thông tin công tác */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-3 mb-5">
              <Banknote size={18} className="text-gray-500" /> Thông tin công tác
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                label="Loại hợp đồng"
                value={`Giáo viên ${teacherType}`}
                icon={<Building size={18} className="text-gray-500" />}
                bg="bg-gray-50"
              />
              {teacher.teacher_info?.type === 'FULL_TIME' ? (
                <>
                  <StatCard
                    label="Lương cứng"
                    value={formatCurrency(teacher.baseSalary || 0) + '/tháng'}
                    icon={<Banknote size={18} className="text-success" />}
                    bg="bg-success-bg"
                  />
                  <StatCard
                    label="Lương theo giờ"
                    value={formatCurrency(teacher.teacher_info?.hourlyRate || 0) + '/h'}
                    icon={<Banknote size={18} className="text-info" />}
                    bg="bg-info-bg"
                  />
                </>
              ) : (
                <StatCard
                  label="Lương theo giờ"
                  value={formatCurrency(teacher.teacher_info?.hourlyRate || 0) + '/h'}
                  icon={<Banknote size={18} className="text-success" />}
                  bg="bg-success-bg"
                />
              )}
              <StatCard
                label="Lịch dạy tuần này"
                value={`${schedulesList.length} Buổi`}
                icon={<CheckCircle2 size={18} className="text-warning" />}
                bg="bg-warning-bg"
              />
            </div>
          </div>

          {/* Card Thời khóa biểu */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-5">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Clock size={18} className="text-gray-500" /> Thời khóa biểu giảng dạy
              </h3>
              <span className="text-xs text-gray-400 italic">Lịch thực tế tuần hiện tại</span>
            </div>

            {loadingSchedules ? (
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {weeklySchedule.map((day, index) => (
                  <div
                    key={index}
                    className="flex flex-col rounded-xl border border-gray-100 overflow-hidden shadow-sm bg-white"
                  >
                    <div className="py-2 text-center text-xs font-bold text-gray-700 bg-gray-50 border-b border-gray-100">
                      {day.label}
                    </div>
                    <div className="p-2 flex flex-col gap-2 flex-grow min-h-[200px]">
                      {day.items.map((item: any, iIdx: number) =>
                        item.className ? (
                          <div
                            key={iIdx}
                            onClick={() => navigate(`/training/classes/${item.classId}`)}
                            className="p-2 bg-primary text-white rounded-lg shadow-sm cursor-pointer hover:bg-primary-btn transition-colors"
                          >
                            <p className="text-[10px] font-bold opacity-75 uppercase flex items-center gap-1">
                              <BookOpen size={10} /> {item.shiftName}
                            </p>
                            <p className="text-[11px] font-bold mt-0.5 line-clamp-2 leading-tight">{item.className}</p>
                          </div>
                        ) : null,
                      )}
                      {day.items.every((item: any) => !item.className) && (
                        <span className="text-[10px] text-gray-300 italic text-center my-auto font-bold tracking-tight">
                          Trống
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;
