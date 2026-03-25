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

      {/* Mở rộng form ra max-w-4xl để hiển thị 2 cột thoáng đãng */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl z-10 flex flex-col animate-in zoom-in-95 duration-200">
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
            {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
            <div className="space-y-6">
              <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3 text-base uppercase tracking-wider">
                <User size={18} className="text-primary" />
                Thông tin cá nhân
              </h4>

              <InputField
                label="Họ tên Giáo viên"
                icon={<User size={18} />}
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                error={errors.fullName}
                placeholder="Nhập họ và tên..."
              />

              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="Ngày sinh"
                  icon={<Calendar size={18} />}
                  type="date"
                  value={formData.date ? String(formData.date).split('T')[0] : ''}
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
                  placeholder="SĐT..."
                />
              </div>

              <InputField
                label="Email liên hệ"
                icon={<Mail size={18} />}
                placeholder="gv.name@edu.vn"
                value={formData.email}
                disabled={!!initialData}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                className={initialData ? 'bg-stone-100 cursor-not-allowed text-gray-500' : ''}
                autoComplete="off"
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

            {/* CỘT PHẢI: NGHIỆP VỤ & TRẠNG THÁI */}
            <div className="space-y-6">
              <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3 text-base uppercase tracking-wider">
                <Briefcase size={18} className="text-primary" />
                Công tác & Nghiệp vụ
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

              {/* KHỐI HIGHLIGHT DÀNH RIÊNG CHO LƯƠNG & BẰNG CẤP */}
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-5 animate-in fade-in duration-300">
                <h4 className="font-bold text-blue-700 flex items-center gap-2 text-base">
                  <GraduationCap size={18} /> Chuyên môn & Thù lao
                </h4>

                <InputField
                  label="Lương theo giờ (VNĐ)"
                  icon={<Banknote size={18} className="text-blue-500" />}
                  type="number"
                  className="bg-white border-blue-200 focus:border-blue-500"
                  value={formData.teacher_info?.hourlyRate || ''}
                  onChange={(e) => handleTeacherInfoChange('hourlyRate', Number(e.target.value))}
                  placeholder="Vd: 250000"
                />

                <InputField
                  label="Bằng cấp / Chứng chỉ"
                  icon={<GraduationCap size={18} className="text-blue-500" />}
                  className="bg-white border-blue-200 focus:border-blue-500"
                  value={degreeInput}
                  onChange={(e) => {
                    setDegreeInput(e.target.value);
                    handleTeacherInfoChange(
                      'degrees',
                      e.target.value
                        .split(',')
                        .map((d) => d.trim())
                        .filter(Boolean), // Loại bỏ các chuỗi rỗng nếu người dùng gõ dư dấu phẩy
                    );
                  }}
                  placeholder="Cách nhau bởi dấu phẩy (Vd: Thạc sĩ, IELTS 8.0)"
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}
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
