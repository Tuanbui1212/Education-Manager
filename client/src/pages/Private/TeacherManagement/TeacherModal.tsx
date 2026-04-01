import { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Activity,
  Banknote,
  GraduationCap,
  BookOpen,
  Briefcase,
  Award,
} from 'lucide-react';
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
        gender: initialData.gender || 'MALE',
        degrees: initialData.degrees || [],
        certificates: initialData.certificates || [],
        baseSalary: initialData.baseSalary || 0,
        teacher_info: {
          type: initialData.teacher_info?.type || 'PART_TIME',
          hourlyRate: initialData.teacher_info?.hourlyRate || 0,
        },
      };
    }

    return {
      fullName: '',
      email: '',
      phone: '',
      gender: 'MALE',
      password: '',
      date: undefined,
      roleId: teacherRoleId,
      status: 'ACTIVE' as UserStatus,
      degrees: [],
      certificates: [],
      baseSalary: 0,
      teacher_info: { type: 'PART_TIME', hourlyRate: 0 },
    };
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
    if (!formData.teacher_info?.hourlyRate || formData.teacher_info.hourlyRate <= 0) {
      newErrors.hourlyRate = 'Vui lòng nhập thù lao hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof IUser, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as string]) setErrors({ ...errors, [field as string]: '' });
  };

  const handleTeacherInfoChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      teacher_info: { ...formData.teacher_info, [field]: value },
    });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = { ...formData };
    if (initialData && !submitData.password) delete submitData.password;

    // Nếu chuyển từ Fulltime về Partime, có thể reset baseSalary về 0 (tuỳ logic của bạn)
    if (submitData.teacher_info?.type === 'PART_TIME') {
      submitData.baseSalary = 0;
    }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl z-10 flex flex-col animate-in zoom-in-95 duration-200">
        <div className="bg-[var(--color-primary)] px-8 py-5 text-white flex justify-between items-center shrink-0 rounded-t-2xl">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={24} />
            {initialData ? 'Chỉnh sửa hồ sơ Giáo viên' : 'Thêm Giáo viên mới'}
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
            <X size={22} />
          </button>
        </div>

        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
            <div className="space-y-6">
              <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3 text-base uppercase tracking-wider">
                <User size={18} className="text-primary" />
                Thông tin cá nhân
              </h4>

              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="Họ tên Giáo viên"
                  icon={<User size={18} />}
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  error={errors.fullName}
                  placeholder="Vd: Nguyễn Văn A"
                />
                <SelectField
                  label="Giới tính"
                  icon={<User size={18} />}
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </SelectField>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="Ngày sinh"
                  icon={<Calendar size={18} />}
                  type="date"
                  value={formData.date ? String(formData.date).split('T') : ''}
                  onChange={(e) => handleChange('date', e.target.value)}
                  error={errors.date}
                />
                <InputField
                  label="Số điện thoại"
                  icon={<Phone size={18} />}
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                  error={errors.phone}
                  placeholder="Vd: 0912345678"
                />
              </div>

              <InputField
                label="Email liên hệ"
                icon={<Mail size={18} />}
                placeholder="example@gmail.com"
                value={formData.email}
                disabled={!!initialData}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                className={initialData ? 'bg-stone-100 cursor-not-allowed text-gray-500' : ''}
                autoComplete="none"
              />

              <InputField
                label="Mật khẩu"
                icon={<Lock size={18} />}
                type="password"
                placeholder={initialData ? 'Bỏ trống nếu không đổi...' : 'Nhập mật khẩu...'}
                value={formData.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                autoComplete="new-password"
              />
            </div>

            {/* CỘT PHẢI: CHUYÊN MÔN & HỢP ĐỒNG */}
            <div className="space-y-6">
              <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3 text-base uppercase tracking-wider">
                <Briefcase size={18} className="text-primary" />
                Công tác & Chuyên môn
              </h4>

              <SelectField
                label="Trạng thái hoạt động"
                icon={<Activity size={18} />}
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="ACTIVE">Đang giảng dạy (Active)</option>
                <option value="INACTIVE">Ngừng công tác (Inactive)</option>
              </SelectField>

              {/* Bằng cấp & Chứng chỉ */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase">
                  <GraduationCap size={16} /> Bằng cấp & Chứng chỉ
                </h4>
                <InputField
                  label="Bằng cấp"
                  icon={<GraduationCap size={18} className="text-slate-500" />}
                  className="bg-white border-slate-200"
                  value={formData.degrees?.join(', ') || ''}
                  onChange={(e) =>
                    handleChange(
                      'degrees',
                      e.target.value
                        .split(',')
                        .map((d) => d.trim())
                        .filter(Boolean),
                    )
                  }
                  placeholder="Vd: Thạc sĩ Ngôn ngữ Anh"
                />
                <InputField
                  label="Chứng chỉ"
                  icon={<Award size={18} className="text-amber-500" />}
                  className="bg-white border-slate-200"
                  value={formData.certificates?.join(', ') || ''}
                  onChange={(e) =>
                    handleChange(
                      'certificates',
                      e.target.value
                        .split(',')
                        .map((d) => d.trim())
                        .filter(Boolean),
                    )
                  }
                  placeholder="Vd: IELTS 8.0, TESOL"
                />
              </div>

              {/* Hợp đồng & Lương */}
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                <h4 className="font-bold text-blue-700 flex items-center gap-2 text-sm uppercase">
                  <Banknote size={16} /> Cấu hình Lương
                </h4>
                <SelectField
                  label="Loại hợp đồng"
                  value={formData.teacher_info?.type || 'PART_TIME'}
                  onChange={(e) => handleTeacherInfoChange('type', e.target.value)}
                >
                  <option value="PART_TIME">Giáo viên PartTime (Chỉ lương theo giờ)</option>
                  <option value="FULL_TIME">Giáo viên FullTime (Có lương cứng)</option>
                </SelectField>

                <div className="grid grid-cols-2 gap-4">
                  {formData.teacher_info?.type === 'FULL_TIME' && (
                    <InputField
                      label="Lương cứng (VNĐ)"
                      type="number"
                      className="bg-white border-blue-200"
                      value={formData.baseSalary}
                      onChange={(e) => handleChange('baseSalary', Number(e.target.value))}
                      placeholder="Vd: 8000000"
                    />
                  )}
                  <InputField
                    label={formData.teacher_info?.type === 'FULL_TIME' ? 'Thù lao dạy vượt giờ' : 'Lương mỗi giờ'}
                    type="number"
                    className="bg-white border-blue-200"
                    value={formData.teacher_info?.hourlyRate || ''}
                    error={errors.hourlyRate}
                    onChange={(e) => handleTeacherInfoChange('hourlyRate', Number(e.target.value))}
                    placeholder="Vd: 200000"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-4 shrink-0 rounded-b-2xl">
            <Button variant="outline" className="w-32 rounded-xl py-2.5" onClick={onClose} type="button">
              Hủy
            </Button>
            <Button variant="primary" className="w-46 rounded-xl py-2.5 shadow-lg shadow-primary/20" type="submit">
              {initialData ? 'Lưu thay đổi' : 'Thêm Giáo viên'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherModal;
