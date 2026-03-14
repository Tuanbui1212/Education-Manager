import { useState } from 'react';
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
  MapPin,
} from 'lucide-react';

import { formatCurrency, formatDate } from '../../../utils/format.util';
import useFetch from '../../../hooks/useFetch';
import { useParams } from 'react-router-dom';
import { userService } from '../../../services/user.service';
import Button from '../../../components/Button';
import TeacherModal from './TeacherModal';
import type { IUser, IRole } from '../../../types/user.type';
import ConfirmModal from '../../../components/ConfirmModal';

const MOCK_TEACHER = {
  schedule: [
    { day: 'Thứ 2', shifts: ['Sáng', 'Tối'] },
    { day: 'Thứ 3', shifts: ['Tối'] },
    { day: 'Thứ 4', shifts: ['Sáng', 'Chiều', 'Tối'] },
    { day: 'Thứ 5', shifts: ['Tối'] },
    { day: 'Thứ 6', shifts: ['Chiều', 'Tối'] },
    { day: 'Thứ 7', shifts: ['Sáng', 'Chiều'] },
    { day: 'Chủ Nhật', shifts: [] },
  ],
};

const TeacherDetail = () => {
  const { id } = useParams();

  const {
    data: teacher,
    loading,
    error,
    refetch: fetchTeachers,
  } = useFetch(userService.getUserById, id as string, [id]);

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<IUser | null>(null);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
  });

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải thông tin...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
  if (!teacher) return <div className="p-8 text-center text-gray-500">Không tìm thấy giáo viên.</div>;

  console.log(teacher);

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE')
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
          Đang giảng dạy
        </span>
      );
    if (status === 'INACTIVE')
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
          Đã nghỉ
        </span>
      );
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">
        Không rõ
      </span>
    );
  };

  const handleEditTeacher = async (formData: Partial<IUser>) => {
    if (!selectedTeacher?._id) return;
    console.log(formData);
    delete formData.email;
    try {
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        status: formData.status,
        roleId: (teacher.roleId as IRole)._id,
        date: formData.date,
        teacher_info: {
          hourlyRate: Number(formData.teacher_info?.hourlyRate || 0),
          degrees: formData.teacher_info?.degrees || [],
        },
      };
      const data = await userService.updateUser(selectedTeacher._id, updateData);
      if (data.success) {
        setConfirmConfig({ isOpen: true, title: 'Thành công', message: 'Cập nhật hồ sơ thành công!', type: 'success' });
        fetchTeachers();
        setShowModalAdd(false);
        setSelectedTeacher(null);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : null;
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: (detailError as string) || 'Có lỗi xảy ra!',
        type: 'danger',
      });
    }
  };

  const openEditModal = async (id: string) => {
    try {
      const response = await userService.getUserById(id);
      if (response.success) {
        setSelectedTeacher(response.data || null);
        setShowModalAdd(true);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin giáo viên:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {showModalAdd && (
        <TeacherModal
          isOpen={showModalAdd}
          onClose={() => {
            setShowModalAdd(false);
            setSelectedTeacher(null);
          }}
          onSubmit={handleEditTeacher}
          initialData={selectedTeacher || undefined}
          teacherRoleId={(teacher.roleId as IRole)._id as string}
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
        cancelText=""
      />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
            title="Quay lại danh sách"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hồ sơ Giáo viên</h1>
            <p className="text-sm text-gray-500 mt-1">Chi tiết thông tin, bằng cấp và lịch trình</p>
          </div>
        </div>

        <Button
          variant="primary"
          icon={<Edit size={18} />}
          onClick={() => {
            openEditModal(teacher._id!);
          }}
        >
          Chỉnh sửa hồ sơ
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10"></div>

            <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md relative z-10 mt-4">
              {teacher.fullName.charAt(0)}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mt-4">{teacher.fullName}</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">ID: #{teacher._id?.slice(-6).toUpperCase() || '-'}</p>

            <div className="mt-4">{getStatusBadge(teacher.status)}</div>

            <div className="w-full h-px bg-gray-100 my-6"></div>

            <div className="w-full space-y-4 text-left">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Phone size={16} className="text-indigo-500" />
                </div>
                <span className="font-medium">{teacher.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Mail size={16} className="text-indigo-500" />
                </div>
                <span className="font-medium">{teacher.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <CalendarIcon size={16} className="text-indigo-500" />
                </div>
                <span>
                  Sinh ngày: <span className="font-medium">{formatDate(teacher.date)}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <MapPin size={16} className="text-indigo-500" />
                </div>
                <span className="truncate">Hà Nội</span>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          {/* Card Nghiệp vụ & Lương */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase size={20} className="text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-800">Thông tin Nghiệp vụ</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box Lương */}
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-700 mb-2">
                  <Banknote size={18} />
                  <span className="font-semibold">Mức lương (Theo giờ)</span>
                </div>
                <div className="text-3xl font-bold text-emerald-600">
                  {formatCurrency(teacher.teacher_info?.hourlyRate as number)}
                  <span className="text-lg font-medium text-emerald-500/70"> / giờ</span>
                </div>
                <p className="text-xs text-emerald-600/70 mt-2">* Áp dụng cho mọi lớp học tiêu chuẩn</p>
              </div>

              {/* Box Bằng cấp */}
              <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-700 mb-3">
                  <GraduationCap size={18} />
                  <span className="font-semibold">Bằng cấp & Chứng chỉ</span>
                </div>
                <div className="flex flex-col gap-2">
                  {teacher.teacher_info?.degrees?.map((degree, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-indigo-900 font-medium bg-white px-3 py-2 rounded-lg border border-indigo-100/50 shadow-sm"
                    >
                      <CheckCircle2 size={16} className="text-indigo-500" />
                      {degree}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card Lịch rảnh / bận */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-800">Đăng ký lịch rảnh (Availability)</h3>
              </div>
              <button className="text-sm text-indigo-600 font-medium hover:underline">Cập nhật lịch</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {MOCK_TEACHER.schedule.map((item, idx) => {
                const isOff = item.shifts.length === 0;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-center flex flex-col h-full ${
                      isOff ? 'bg-gray-50 border-gray-100' : 'bg-white border-indigo-100 shadow-sm'
                    }`}
                  >
                    <div className={`text-sm font-bold mb-3 ${isOff ? 'text-gray-400' : 'text-gray-700'}`}>
                      {item.day}
                    </div>

                    <div className="flex flex-col gap-1.5 flex-grow">
                      {isOff ? (
                        <span className="text-xs text-gray-400 italic my-auto">Nghỉ</span>
                      ) : (
                        item.shifts.map((shift, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded"
                          >
                            Ca {shift}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-4 text-xs text-gray-500 border-t pt-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-50 border border-indigo-100"></span>
                <span>Có thể nhận lớp</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gray-50 border border-gray-100"></span>
                <span>Không có lịch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;
