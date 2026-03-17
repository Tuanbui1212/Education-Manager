import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Briefcase,
  GraduationCap,
  Banknote,
  Clock,
  CheckCircle2,
  Edit,
  BookOpen,
} from 'lucide-react';

import { formatCurrency, formatDate } from '../../../utils/format.util';
import useFetch from '../../../hooks/useFetch';
import { userService } from '../../../services/user.service';
import { shiftService } from '../../../services/shift.service';
import { scheduleService } from '../../../services/schedule.service';
import Button from '../../../components/Button';
import TeacherModal from './TeacherModal';
import ConfirmModal from '../../../components/ConfirmModal';
import type { IUser } from '../../../types/user.type';

const TeacherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: teacherData, loading, error, refetch } = useFetch(userService.getUserById, id as string, [id]);
  const { data: shiftsData } = useFetch(shiftService.getShifts, { limit: 100 }, []);

  const { data: schedulesResponse, loading: loadingSchedules } = useFetch(
    scheduleService.getSchedules,
    { teacherId: id, limit: 1000 },
    [id],
  );

  const shiftsList = Array.isArray(shiftsData) ? shiftsData : (shiftsData as any)?.data || [];
  const schedulesList = Array.isArray(schedulesResponse) ? schedulesResponse : (schedulesResponse as any)?.data || [];

  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', type: 'success' as any });

  const teacher = teacherData as IUser;

  const weeklySchedule = useMemo(() => {
    const days = [
      { label: 'Thứ 2', value: 1 },
      { label: 'Thứ 3', value: 2 },
      { label: 'Thứ 4', value: 3 },
      { label: 'Thứ 5', value: 4 },
      { label: 'Thứ 6', value: 5 },
      { label: 'Thứ 7', value: 6 },
      { label: 'Chủ Nhật', value: 0 },
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

  if (loading) return <div className="p-8 text-center animate-pulse text-gray-500">Đang tải hồ sơ giáo viên...</div>;
  if (error || !teacher)
    return <div className="p-8 text-center text-red-500">Lỗi: {error || 'Không tìm thấy dữ liệu'}</div>;

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

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-indigo-50">
              <ArrowLeft size={20} />
            </div>
            <span className="font-semibold">Quay lại danh sách</span>
          </button>
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="bg-indigo-600 hover:bg-indigo-700"
              icon={<Edit size={18} />}
              onClick={() => setShowEditModal(true)}
            >
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div className="px-6 pb-8 -mt-16 text-center">
                <div className="inline-block p-1 bg-white rounded-full shadow-xl mb-4">
                  <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600 border-4 border-white uppercase">
                    {teacher.fullName.charAt(0)}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{teacher.fullName}</h2>
                <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mt-1">
                  {(teacher.roleId as any).name}
                </p>
                <div className="mt-4 flex justify-center">
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-bold ${teacher.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
                  >
                    {teacher.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-50 p-6 space-y-4">
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-400 font-medium uppercase">Email</p>
                    <p className="font-semibold truncate">{teacher.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase">Số điện thoại</p>
                    <p className="font-semibold">{teacher.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                    <CalendarIcon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase">Ngày sinh</p>
                    <p className="font-semibold">{formatDate(teacher.date as any)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Banknote size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Lương theo giờ</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatCurrency(teacher.teacher_info?.hourlyRate || 0)}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Lịch dạy trong tuần</p>
                  <p className="text-2xl font-bold text-gray-800">{schedulesList.length} Buổi</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <Clock className="text-indigo-600" /> Thời khóa biểu giảng dạy
                </h3>
                <span className="text-xs text-gray-400 italic">Lịch thực tế từ các lớp đang phụ trách</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {weeklySchedule.map((day, index) => (
                  <div
                    key={index}
                    className="flex flex-col rounded-2xl border bg-white border-gray-100 overflow-hidden shadow-sm"
                  >
                    <div className="py-2.5 text-center text-xs font-bold text-gray-700 bg-gray-50 border-b border-gray-100">
                      {day.label}
                    </div>
                    <div className="p-2 flex flex-col gap-2 flex-grow min-h-[220px]">
                      {day.items.map((item, iIdx) => {
                        if (item.className) {
                          return (
                            <div
                              key={iIdx}
                              onClick={() => navigate(`/training/classes/${item.classId}`)}
                              className="p-2 bg-indigo-600 text-white rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform"
                            >
                              <p className="text-[10px] font-bold opacity-80 uppercase flex items-center gap-1">
                                <BookOpen size={10} /> {item.shiftName}
                              </p>
                              <p className="text-[11px] font-bold mt-1 line-clamp-2 leading-tight">{item.className}</p>
                            </div>
                          );
                        }
                        return null;
                      })}
                      {day.items.every((item) => !item.className) && (
                        <span className="text-[10px] text-gray-300 italic text-center my-auto uppercase font-bold tracking-tighter">
                          Trống
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-wider border-t pt-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm shadow-indigo-200"></span>{' '}
                  <span>Lịch dạy thực tế</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-200"></span> <span>Thời gian chưa có lịch</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <GraduationCap className="text-indigo-600" /> Bằng cấp & Chứng chỉ
              </h3>
              <div className="flex flex-wrap gap-3">
                {teacher.teacher_info?.degrees?.length ? (
                  teacher.teacher_info.degrees.map((degree, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100 shadow-sm"
                    >
                      {degree}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 italic">Chưa cập nhật bằng cấp</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;
