import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, Lock, Activity, Banknote, GraduationCap } from 'lucide-react';
import Button from '../../../components/Button';
import InputField from '../../../components/InputField';
import SelectField from '../../../components/SelectField';
import type { IUser, UserStatus } from '../../../types/user.type';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<IUser>) => void;
  initialData?: IUser;
  teacherRoleId: string;
}

const TeacherModal = ({ isOpen, onClose, onSubmit, initialData, teacherRoleId }: TeacherModalProps) => {
  const [formData, setFormData] = useState<Partial<IUser>>(() => {
    if (initialData) {
      return {
        ...initialData,
        password: '',
        roleId: teacherRoleId,
        teacher_info: {
          hourlyRate: initialData.teacher_info?.hourlyRate || 0,
          degrees: initialData.teacher_info?.degrees || [],
        },
      };
    }

    return {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      date: undefined,
      roleId: teacherRoleId,
      status: 'ACTIVE' as UserStatus,
      teacher_info: { hourlyRate: 0, degrees: [] },
    };
  });

  const [degreeInput, setDegreeInput] = useState(() => {
    return initialData?.teacher_info?.degrees?.join(', ') || '';
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName?.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.email?.trim()) newErrors.email = 'Vui lòng nhập email';
    if (!formData.phone?.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.date) newErrors.date = 'Vui lòng chọn ngày sinh';
    if (!initialData && !formData.password?.trim()) newErrors.password = 'Vui lòng nhập mật khẩu';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleTeacherInfoChange = (field: 'hourlyRate' | 'degrees', value: any) => {
    setFormData({
      ...formData,
      teacher_info: { ...formData.teacher_info, [field]: value },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = { ...formData };
    if (initialData && !submitData.password) delete submitData.password;
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">{initialData ? 'Chỉnh sửa hồ sơ Giáo viên' : 'Thêm Giáo viên mới'}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Họ tên Giáo viên"
              icon={<User size={16} />}
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              error={errors.fullName}
              placeholder="Nhập họ và tên..."
            />
            <InputField
              label="Ngày sinh"
              icon={<Calendar size={16} />}
              type="date"
              value={formData.date ? String(formData.date).split('T')[0] : ''}
              onChange={(e) => handleChange('date', e.target.value)}
              error={errors.date}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Email"
              icon={<Mail size={16} />}
              placeholder="gv.name@edu.vn"
              value={formData.email}
              disabled={!!initialData}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              className={initialData ? 'bg-stone-200 cursor-not-allowed' : ''}
            />
            <InputField
              label="Mật khẩu"
              icon={<Lock size={16} />}
              type="password"
              placeholder={initialData ? 'Bỏ trống nếu không đổi...' : 'Nhập mật khẩu...'}
              value={formData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Số điện thoại"
              icon={<Phone size={16} />}
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
              error={errors.phone}
            />
            <SelectField
              label="Trạng thái"
              icon={<Activity size={16} />}
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="ACTIVE">Đang giảng dạy (Active)</option>
              <option value="INACTIVE">Ngừng công tác (Inactive)</option>
            </SelectField>
          </div>

          <hr className="border-gray-100 my-4" />
          <h4 className="text-sm font-semibold text-indigo-600 mb-2 uppercase tracking-wider">Thông tin nghiệp vụ</h4>

          <div className="grid grid-cols-1 gap-4">
            <InputField
              label="Lương theo giờ (VNĐ)"
              icon={<Banknote size={16} />}
              type="number"
              value={formData.teacher_info?.hourlyRate || ''}
              onChange={(e) => handleTeacherInfoChange('hourlyRate', Number(e.target.value))}
              placeholder="Vd: 250000"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              label="Bằng cấp / Chứng chỉ"
              icon={<GraduationCap size={16} />}
              value={degreeInput}
              onChange={(e) => {
                setDegreeInput(e.target.value);
                handleTeacherInfoChange(
                  'degrees',
                  e.target.value
                    .split(',')
                    .map((d) => d.trim())
                    .filter(Boolean),
                );
              }}
              placeholder="Cách nhau bởi dấu phẩy (Vd: Thạc sĩ, IELTS 8.0)"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t mt-6">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} type="button">
              Hủy
            </Button>
            <Button variant="primary" className="flex-1 rounded-xl bg-primary hover:bg-primary-btn" type="submit">
              {initialData ? 'Lưu thay đổi' : 'Tạo hồ sơ'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherModal;
