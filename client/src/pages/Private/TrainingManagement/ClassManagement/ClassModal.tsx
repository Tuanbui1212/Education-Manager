import React, { useState, useMemo, useEffect } from 'react';
import { X, BookOpen, UserCheck, DoorOpen, Activity, FileText, Calendar, Users } from 'lucide-react';

import Button from '../../../../components/Button';
import InputField from '../../../../components/InputField';
import Combobox from '../../../../components/Combobox';
import SelectField from '../../../../components/SelectField';

import { userService } from '../../../../services/user.service';
import { roleService } from '../../../../services/role.service';
import { courseService } from '../../../../services/course.service';
import { roomService } from '../../../../services/room.service';

import type { IClass, ClassModalProps } from '../../../../types/class.type';
import useFetch from '../../../../hooks/useFetch';

const getSafeId = (field: any) => {
  if (!field) return '';
  if (typeof field === 'object' && field._id) return field._id;
  return field;
};

const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<IClass>>({
    name: '',
    courseId: '',
    teacherId: '',
    roomId: '',
    status: 'PENDING',
    totalLessons: 0,
    lessonsPerWeek: 0,
    maxNumberOfStudents: 0,
    startDate: '',
  });

  console.log('Form Data:', formData);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: rolesData } = useFetch(roleService.getRoles, {}, []);
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];

  const teacherRoleId = useMemo(() => {
    return roles.find((r: any) => r.name?.toLowerCase() === 'teacher')?._id || '';
  }, [roles]);

  const currentId = initialData?._id;
  const [prevId, setPrevId] = useState<string | undefined>(currentId);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(isOpen);

  console.log('isOpen:', isOpen, 'prevIsOpen:', prevIsOpen, 'currentId:', currentId, 'prevId:', prevId);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        name: initialData.name || '',
        courseId: getSafeId(initialData.courseId),
        teacherId: getSafeId(initialData.teacherId),
        roomId: getSafeId(initialData.roomId),
        status: initialData.status || 'UPCOMING',
        totalLessons: initialData.totalLessons || 0,
        lessonsPerWeek: initialData.lessonsPerWeek || 0,
        maxNumberOfStudents: initialData.maxNumberOfStudents || 0,
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        name: '',
        courseId: '',
        teacherId: '',
        roomId: '',
        status: 'PENDING',
        totalLessons: 0,
        lessonsPerWeek: 0,
        maxNumberOfStudents: 0,
        startDate: '',
      });
    }

    setErrors({});
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Tên lớp học là bắt buộc';
    if (!formData.courseId) newErrors.courseId = 'Vui lòng chọn khóa học';
    if (!formData.teacherId) newErrors.teacherId = 'Vui lòng chọn giáo viên';
    if (!formData.roomId) newErrors.roomId = 'Vui lòng chọn phòng học';
    if (!formData.totalLessons || formData.totalLessons <= 0 || !Number.isInteger(formData.totalLessons)) {
      newErrors.totalLessons = 'Tổng số bài học phải là số nguyên > 0';
    }
    if (!formData.lessonsPerWeek || formData.lessonsPerWeek <= 0 || !Number.isInteger(formData.lessonsPerWeek)) {
      newErrors.lessonsPerWeek = 'Số buổi/tuần phải là số nguyên > 0';
    }
    if (!formData.maxNumberOfStudents || formData.maxNumberOfStudents <= 0 || !Number.isInteger(formData.maxNumberOfStudents)) {
      newErrors.maxNumberOfStudents = 'Sĩ số tối đa phải là số nguyên > 0';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }

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
    const response = await roomService.getRooms({ search: query, limit: 10, capacity: formData.maxNumberOfStudents });
    return response.data || [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">{initialData ? 'Chỉnh sửa lớp học' : 'Tạo vỏ lớp học mới'}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="p-6 space-y-5 max-h-[80vh] overflow-y-auto" onSubmit={handleSubmit}>
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
            initialValue={
              initialData?.courseId && (initialData.courseId as any).title ? (initialData.courseId as any).title : ''
            }
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
            initialValue={
              initialData?.teacherId && (initialData.teacherId as any).fullName
                ? (initialData.teacherId as any).fullName
                : ''
            }
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
            initialValue={
              initialData?.roomId && (initialData.roomId as any).name ? (initialData.roomId as any).name : ''
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Số buổi học/tuần"
              icon={<Calendar size={16} />}
              type="number"
              value={formData.lessonsPerWeek || ''}
              onChange={(e) => setFormData({ ...formData, lessonsPerWeek: Number(e.target.value) })}
              onFocus={() => clearError('lessonsPerWeek')}
              error={errors.lessonsPerWeek}
              placeholder="Vd: 2"
            />
            <InputField
              label="Tổng số buổi học"
              icon={<FileText size={16} />}
              type="number"
              value={formData.totalLessons || ''}
              onChange={(e) => setFormData({ ...formData, totalLessons: Number(e.target.value) })}
              onFocus={() => clearError('totalLessons')}
              error={errors.totalLessons}
              placeholder="Vd: 24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Sĩ số tối đa"
              icon={<Users size={16} />}
              type="number"
              value={formData.maxNumberOfStudents || ''}
              onChange={(e) => setFormData({ ...formData, maxNumberOfStudents: Number(e.target.value) })}
              onFocus={() => clearError('maxNumberOfStudents')}
              error={errors.maxNumberOfStudents}
              placeholder="Vd: 30"
            />
            <InputField
              label="Ngày bắt đầu"
              icon={<Calendar size={16} />}
              type="date"
              value={formData.startDate as string || ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              onFocus={() => clearError('startDate')}
              error={errors.startDate}
            />
          </div>

          {initialData && (
            <SelectField
              label="Trạng thái lớp"
              icon={<Activity size={16} />}
              value={formData.status || 'PENDING'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="UPCOMING">Sắp diễn ra (UPCOMING)</option>
              <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
              <option value="COMPLETED">Đã kết thúc (COMPLETED)</option>
              <option value="MAINTENANCE">Tạm ngưng / Bảo trì (MAINTENANCE)</option>
              <option value="PENDING">Đang chờ (PENDING)</option>
            </SelectField>
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
