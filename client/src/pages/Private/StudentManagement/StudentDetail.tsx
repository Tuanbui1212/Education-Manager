import { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Edit,
  MapPin,
  Users,
  History,
  BookOpen,
  Headset,
} from 'lucide-react';
import { formatDate, getStatusUserStyles } from '../../../utils/format.util';
import useFetch from '../../../hooks/useFetch';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../../services/user.service';
import { classService } from '../../../services/class.service';
import { roleService } from '../../../services/role.service';
import Button from '../../../components/Button';
import StudentModal from './StudentModal';
import ConfirmModal from '../../../components/ConfirmModal';
import type { IUser, IRole } from '../../../types/user.type';
import { PATHS, STATUS_OPTIONS } from '../../../utils/constants';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: student,
    loading,
    error,
    refetch: fetchStudent,
  } = useFetch(userService.getUserById, id as string, [id]);
  const { data: enrolledClasses, loading: loadingClasses } = useFetch(
    classService.getClassesByStudentId,
    id as string,
    [id],
  );

  // Lấy Roles & Consultants để đưa vào Modal và hiển thị tên
  const { data: rolesData } = useFetch(roleService.getRoles, {}, []);
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];
  const consultantRoleId = roles.find((r: any) => r.name?.toLowerCase() === 'consultant')?._id || '';
  const { data: consultants } = useFetch(userService.getUsers, { page: 1, limit: 1000, roleId: consultantRoleId }, [
    consultantRoleId,
  ]);

  const getConsultantName = (consultantData: any) => {
    if (!consultantData) return 'Chưa phân công';
    if (typeof consultantData === 'object') return consultantData.fullName;
    const found = consultants?.find((c: any) => c._id === consultantData);
    return found ? found.fullName : 'Chưa phân công';
  };

  const [showModalEdit, setShowModalEdit] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
  });

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải thông tin...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
  if (!student) return <div className="p-8 text-center text-gray-500">Không tìm thấy học viên.</div>;

  const handleEditStudent = async (formData: Partial<IUser>) => {
    if (!student?._id) return;
    const updateData = {
      fullName: formData.fullName,
      phone: formData.phone,
      date: formData.date,
      status: formData.status,
      roleId: (student.roleId as IRole)._id,
      student_info: {
        parentsName: formData.student_info?.parentsName,
        consultantId: formData.student_info?.consultantId,
        crmHistory: formData.student_info?.crmHistory || student.student_info?.crmHistory || [],
      },
    };
    try {
      const data = await userService.updateUser(student._id, updateData);
      if (data.success) {
        setConfirmConfig({ isOpen: true, title: 'Thành công', message: 'Cập nhật hồ sơ thành công!', type: 'success' });
        fetchStudent();
        setShowModalEdit(false);
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

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {showModalEdit && (
        <StudentModal
          roles={roles}
          consultants={consultants}
          isOpen={showModalEdit}
          onClose={() => setShowModalEdit(false)}
          onSubmit={handleEditStudent}
          initialData={student}
          studentRoleId={(student.roleId as IRole)._id as string}
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
            title="Quay lại"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hồ sơ Học viên</h1>
            <p className="text-sm text-gray-500 mt-1">Chi tiết thông tin liên hệ và quá trình học tập</p>
          </div>
        </div>
        <Button variant="primary" icon={<Edit size={18} />} onClick={() => setShowModalEdit(true)}>
          Chỉnh sửa hồ sơ
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* CỘT TRÁI */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10"></div>
            <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md relative z-10 mt-4">
              {student.fullName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-800 mt-4">{student.fullName}</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">ID: #{student._id?.slice(-6).toUpperCase()}</p>
            <div className="mt-4">
              <span className={getStatusUserStyles(student.status as string)}>
                {STATUS_OPTIONS.find((opt) => opt.value === student.status)?.label || student.status}
              </span>
            </div>

            <div className="w-full h-px bg-gray-100 my-6"></div>

            <div className="w-full space-y-4 text-left">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Phone size={16} className="text-blue-500" />
                </div>
                <span className="font-medium">{student.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Mail size={16} className="text-blue-500" />
                </div>
                <span className="font-medium">{student.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <CalendarIcon size={16} className="text-blue-500" />
                </div>
                <span>
                  Sinh ngày: <span className="font-medium">{formatDate(student.date as string)}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Users size={16} className="text-blue-500" />
                </div>
                <span>
                  Phụ huynh: <span className="font-medium">{student.student_info?.parentsName || 'Chưa cập nhật'}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                  <Headset size={16} className="text-green-600" />
                </div>
                <span>
                  Sale phụ trách:{' '}
                  <span className="font-bold text-green-700">
                    {getConsultantName(student.student_info?.consultantId)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">Lịch sử Chăm sóc (CRM)</h3>
              </div>
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                Tổng: {student.student_info?.crmHistory?.length || 0} bản ghi
              </span>
            </div>
            <div className="space-y-4">
              {student.student_info?.crmHistory && student.student_info.crmHistory.length > 0 ? (
                <div className="relative border-l-2 border-blue-100 ml-3 space-y-6 pb-2">
                  {student.student_info.crmHistory.map((historyItem, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-2 border-blue-400 rounded-full"></div>
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 hover:bg-blue-50 transition-colors">
                        <p className="text-sm text-gray-700 font-medium">{historyItem}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <History size={40} className="mb-3 opacity-20" />
                  <p className="text-sm">Chưa có dữ liệu chăm sóc nào cho học viên này.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <BookOpen size={20} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Lớp học đang tham gia</h3>
              </div>
              <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                {enrolledClasses?.length || 0} Lớp học
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingClasses ? (
                [1, 2].map((i) => (
                  <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-xl border border-gray-100"></div>
                ))
              ) : enrolledClasses && enrolledClasses.length > 0 ? (
                enrolledClasses.map((classItem: any) => (
                  <div
                    key={classItem._id}
                    className="group relative p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-800 line-clamp-1">{classItem.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${classItem.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                        >
                          {classItem.status === 'ACTIVE' ? 'Đang học' : 'Hoàn thành'}
                        </span>
                      </div>
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                          <span className="font-medium">Khóa:</span> {classItem.courseId?.title || 'N/A'}
                        </div>
                      </div>
                      <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between text-[11px]">
                        <div className="flex items-center gap-1 text-gray-400">
                          <MapPin size={12} />
                          <span>{classItem.roomId?.name || 'Online'}</span>
                        </div>
                        <button
                          className="text-indigo-600 font-bold hover:underline"
                          onClick={() => navigate(PATHS.TRAINING_CLASSES_ID.replace(':id', classItem._id))}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                  <BookOpen size={40} className="text-gray-200 mb-2" />
                  <p className="text-gray-400 text-sm">Chưa đăng ký lớp học nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
