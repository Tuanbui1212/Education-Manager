import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, Lock, Activity, Users } from 'lucide-react';
import Button from '../../../components/Button';
import InputField from '../../../components/InputField';
import SelectField from '../../../components/SelectField';
import type { IUser, UserStatus } from '../../../types/user.type';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<IUser>) => void;
  initialData?: IUser;
  studentRoleId: string;
}

const StudentModal = ({ isOpen, onClose, onSubmit, initialData, studentRoleId }: StudentModalProps) => {
  const [formData, setFormData] = useState<Partial<IUser>>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    date: undefined,
    roleId: studentRoleId,
    status: 'LEAD' as UserStatus, // Mặc định tạo mới là Tiềm năng
    student_info: { parentsName: '' },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        ...initialData,
        password: '',
        roleId: studentRoleId,
        student_info: {
          parentsName: initialData.student_info?.parentsName || '',
        },
      });
    } else if (!isOpen) {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        date: undefined,
        roleId: studentRoleId,
        status: 'LEAD' as UserStatus,
        student_info: { parentsName: '' },
      });
      setErrors({});
    }
  }, [initialData, isOpen, studentRoleId]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName?.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.email?.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }
    if (!formData.phone?.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.date) newErrors.date = 'Vui lòng chọn ngày sinh';
    if (!initialData && !formData.password?.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    if (field === 'parentsName') {
      setFormData({ ...formData, student_info: { ...formData.student_info, parentsName: value } });
    } else {
      setFormData({ ...formData, [field]: value });
    }
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = { ...formData };
    if (initialData && !submitData.password) {
      delete submitData.password;
    }
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-[var(--color-primary)] p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">{initialData ? 'Chỉnh sửa hồ sơ Học viên' : 'Thêm Học viên mới'}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Họ tên học viên"
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
              placeholder="example@gmail.com"
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
            <InputField
              label="Tên phụ huynh"
              icon={<Users size={16} />}
              value={formData.student_info?.parentsName || ''}
              onChange={(e) => handleChange('parentsName', e.target.value)}
              placeholder="Tên phụ huynh/người giám hộ..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* ĐÃ CẬP NHẬT ĐỦ 4 TRẠNG THÁI */}
            <SelectField
              label="Trạng thái"
              icon={<Activity size={16} />}
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="LEAD">Tiềm năng (Lead)</option>
              <option value="ACTIVE">Đang học (Active)</option>
              <option value="RESERVED">Bảo lưu (Reserved)</option>
              <option value="INACTIVE">Đã nghỉ (Inactive)</option>
            </SelectField>
          </div>

          <div className="flex gap-3 pt-4 border-t mt-6">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} type="button">
              Hủy
            </Button>
            <Button variant="primary" className="flex-1 rounded-xl" type="submit">
              {initialData ? 'Lưu thay đổi' : 'Tạo hồ sơ'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
