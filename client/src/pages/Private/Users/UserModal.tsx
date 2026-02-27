import { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Activity,
  Calendar,
  Banknote,
  GraduationCap,
  Users,
  Lock,
} from 'lucide-react';
import Button from '../../../components/Button';
import InputField from '../../../components/InputField';
import SelectField from '../../../components/SelectField';

import type { IUser, UserRole, UserModalProps, UserStatus } from '../../../types/user.type';

const UserModal = ({ isOpen, onClose, onSubmit, initialData }: UserModalProps) => {
  const [formData, setFormData] = useState<Partial<IUser>>(
    initialData
      ? { ...initialData, password: '' }
      : {
          fullName: '',
          email: '',
          phone: '',
          password: '',
          date: undefined,
          role: 'STUDENT' as UserRole,
          status: 'ACTIVE',
          student_info: { parentsName: '' },
          teacher_info: { hourlyRate: 0, degrees: [] },
        },
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (isOpen !== prevIsOpen || initialData !== prevInitialData) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);

    if (isOpen) {
      setFormData(
        initialData
          ? { ...initialData, password: '' }
          : {
              fullName: '',
              email: '',
              phone: '',
              password: '',
              date: undefined,
              role: 'STUDENT' as UserRole,
              status: 'ACTIVE',
              student_info: { parentsName: '' },
              teacher_info: { hourlyRate: 0, degrees: [] },
            },
      );
      setErrors({});
    }
  }

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.email?.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Vui lòng nhập số điện thoại';
      } else {
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!phoneRegex.test(formData.phone)) {
          newErrors.phone = 'Số điện thoại không hợp lệ (Ví dụ: 0987654321)';
        }
      }
    }
    if (!formData.date) newErrors.date = 'Vui lòng chọn ngày sinh';

    if (!initialData && !formData.password?.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (!initialData && (formData.password?.length || 0) < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof IUser, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as string]) {
      setErrors({ ...errors, [field as string]: '' });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-[var(--color-primary)] p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">{initialData ? 'Chỉnh sửa hồ sơ' : 'Đăng ký người dùng mới'}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validateForm()) return;

            const submitData = { ...formData };
            if (initialData && !submitData.password) {
              delete submitData.password;
            }
            onSubmit(submitData);
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Họ tên"
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
              className="bg-white"
              value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange('date', e.target.value)}
              error={errors.date}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Email"
              icon={<Mail size={16} />}
              placeholder="example@gmail.com"
              value={formData.email}
              disabled={!!initialData}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              className={!initialData ? '' : 'bg-stone-200 cursor-not-allowed'}
            />

            <InputField
              label="Mật khẩu"
              icon={<Lock size={16} />}
              type="password"
              placeholder={initialData ? 'Bỏ trống nếu không đổi...' : 'Nhập mật khẩu...'}
              value={formData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Phone"
              icon={<Phone size={16} />}
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, '');
                handleChange('phone', onlyNumbers);
              }}
              error={errors.phone}
            />

            <SelectField
              label="Vai trò"
              icon={<ShieldCheck size={16} />}
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value as UserRole)}
            >
              <option value="ADMIN">Quản trị viên (Admin)</option>
              <option value="TEACHER">Giáo viên (Teacher)</option>
              <option value="STUDENT">Học sinh (Student)</option>
              <option value="SALE">Tư vấn viên (Sale)</option>
            </SelectField>
          </div>

          {/* Hàng 4: Trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Trạng thái"
              icon={<Activity size={16} />}
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as UserStatus)}
            >
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Ngừng kích hoạt</option>
            </SelectField>
          </div>

          <hr className="border-gray-100" />

          {/* Thông tin cho Giáo viên */}
          {formData.role === 'TEACHER' && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 text-blue-600">
              <InputField
                label="Lương mỗi giờ"
                icon={<Banknote size={16} />}
                type="number"
                className="border-blue-200 focus:ring-blue-400 text-gray-800"
                placeholder="Vd: 200000"
                value={formData.teacher_info?.hourlyRate || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    teacher_info: { ...formData.teacher_info, hourlyRate: Number(e.target.value) },
                  })
                }
              />

              <InputField
                label="Bằng cấp"
                icon={<GraduationCap size={16} />}
                className="border-blue-200 focus:ring-blue-400 text-gray-800"
                placeholder="Vd: Thạc sĩ, IELTS 8.0"
                value={formData.teacher_info?.degrees?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    teacher_info: {
                      ...formData.teacher_info,
                      degrees: e.target.value.split(',').map((d) => d.trim()),
                    },
                  })
                }
              />
            </div>
          )}

          {/* Thông tin cho Học sinh */}
          {formData.role === 'STUDENT' && (
            <div className="animate-in slide-in-from-top-2 text-green-600">
              <InputField
                label="Tên phụ huynh"
                icon={<Users size={16} />}
                className="border-green-200 focus:ring-green-400 text-gray-800"
                placeholder="Vd: Nguyễn Văn A"
                value={formData.student_info?.parentsName || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    student_info: { ...formData.student_info, parentsName: e.target.value },
                  })
                }
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} type="button">
              Hủy
            </Button>
            <Button variant="primary" className="flex-1 rounded-xl" type="submit">
              {initialData ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
