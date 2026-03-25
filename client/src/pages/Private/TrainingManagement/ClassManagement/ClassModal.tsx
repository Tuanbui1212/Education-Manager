import React, { useState, useMemo } from 'react';
import { X, BookOpen, UserCheck, DoorOpen, Activity } from 'lucide-react';

import Button from '../../../../components/Button';
import InputField from '../../../../components/InputField';
import SelectField from '../../../../components/SelectField';
import Combobox from '../../../../components/Combobox';

import { userService } from '../../../../services/user.service';
import { roleService } from '../../../../services/role.service';
import { courseService } from '../../../../services/course.service';
import { roomService } from '../../../../services/room.service';

import type { IClass, ClassModalProps } from '../../../../types/class.type';
import { ClassStatus } from '../../../../types/class.type';

import useFetch from '../../../../hooks/useFetch';

const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<IClass>>({
    name: '',
    courseId: '',
    teacherId: '',
    roomId: '',
    status: 'UPCOMING' as ClassStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  const { data: rolesData } = useFetch(roleService.getRoles, {}, []);
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];

  const teacherRoleId = useMemo(() => {
    return roles.find((r: any) => r.name?.toLowerCase() === 'teacher')?._id || '';
  }, [roles]);

  if (isOpen !== prevIsOpen || initialData !== prevInitialData) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);

    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          courseId: typeof initialData.courseId === 'object' ? initialData.courseId._id : initialData.courseId,
          teacherId: typeof initialData.teacherId === 'object' ? initialData.teacherId._id : initialData.teacherId,
          roomId: typeof initialData.roomId === 'object' ? initialData.roomId._id : initialData.roomId,
        });
      } else {
        setFormData({
          name: '',
          courseId: '',
          teacherId: '',
          roomId: '',
          status: 'UPCOMING' as ClassStatus,
        });
      }
      setErrors({});
    }
  }

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Tên lớp học là bắt buộc';
    if (!formData.courseId) newErrors.courseId = 'Vui lòng chọn khóa học';
    if (!formData.teacherId) newErrors.teacherId = 'Vui lòng chọn giáo viên';
    if (!formData.roomId) newErrors.roomId = 'Vui lòng chọn phòng học';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTeacherSearch = async (query: string) => {
    const response = await userService.getUsers({
      search: query,
      roleId: teacherRoleId as string,
      limit: 10,
      status: 'ACTIVE',
    });
    return response.data;
  };

  const handleCourseSearch = async (query: string) => {
    const response = await courseService.getCourses({ search: query, limit: 10 });
    return response.data || [];
  };

  const handleRoomSearch = async (query: string) => {
    const response = await roomService.getRooms({ search: query, limit: 10 });
    return response.data || [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">{initialData ? 'Chỉnh sửa lớp học' : 'Tạo vỏ lớp học mới'}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          <InputField
            label="Tên lớp học"
            icon={<BookOpen size={16} />}
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onFocus={() => clearError('name')}
            error={errors.name}
            placeholder="Vd: Lớp ReactJS nâng cao - K12"
          />

          <Combobox
            label="Khóa học"
            icon={<BookOpen size={16} />}
            placeholder="Tìm kiếm khóa học..."
            onSearch={handleCourseSearch}
            onSelect={(course) => setFormData({ ...formData, courseId: course?._id })}
            onFocus={() => clearError('courseId')}
            getDisplayValue={(course) => course?.title}
            error={errors.courseId}
            initialValue={typeof initialData?.courseId === 'object' ? initialData.courseId.title : ''}
          />

          <Combobox
            label="Giáo viên"
            icon={<UserCheck size={16} />}
            placeholder="Tìm kiếm giáo viên..."
            onSearch={handleTeacherSearch}
            onSelect={(teacher) => setFormData({ ...formData, teacherId: teacher?._id })}
            onFocus={() => clearError('teacherId')}
            getDisplayValue={(teacher) => teacher?.fullName}
            error={errors.teacherId}
            initialValue={typeof initialData?.teacherId === 'object' ? initialData.teacherId.fullName : ''}
          />

          <Combobox
            label="Phòng học mặc định"
            icon={<DoorOpen size={16} />}
            placeholder="Tìm kiếm phòng học..."
            onSearch={handleRoomSearch}
            onSelect={(room) => setFormData({ ...formData, roomId: room?._id })}
            onFocus={() => clearError('roomId')}
            getDisplayValue={(room) => room?.name}
            error={errors.roomId}
            initialValue={typeof initialData?.roomId === 'object' ? initialData.roomId.name : ''}
          />

          {initialData && (
            <SelectField
              label="Trạng thái lớp"
              icon={<Activity size={16} />}
              value={formData.status || 'UPCOMING'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ClassStatus })}
            >
              <option value="UPCOMING">Sắp diễn ra</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="COMPLETED">Đã kết thúc</option>
              <option value="MAINTENANCE">Tạm ngưng / Bảo trì</option>
            </SelectField>
          )}

          {!initialData && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-xl border border-blue-100 text-sm">
              Lớp học mới sẽ được tự động thiết lập trạng thái <strong>Sắp diễn ra (UPCOMING)</strong>.
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} type="button">
              Hủy bỏ
            </Button>
            <Button variant="primary" className="flex-1 rounded-xl" type="submit">
              {initialData ? 'Lưu thay đổi' : 'Tạo vỏ lớp'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassModal;
