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
  Headset,
  IdCard,
  Award,
  Briefcase,
} from 'lucide-react';
import Button from '../../../components/Button';
import InputField from '../../../components/InputField';
import SelectField from '../../../components/SelectField';
import Combobox from '../../../components/Combobox';
import { userService } from '../../../services/user.service';

import type { IUser, UserModalProps, UserStatus } from '../../../types/user.type';

const UserModal = ({ roles = [], consultants = [], isOpen, onClose, onSubmit, initialData }: UserModalProps) => {
  const [formData, setFormData] = useState<Partial<IUser>>(() => {
    if (initialData) {
      return {
        ...initialData,
        password: '',
        roleId: typeof initialData.roleId === 'object' ? (initialData.roleId as any)._id : initialData.roleId,
        gender: initialData.gender || 'MALE',
        degrees: initialData.degrees || [],
        certificates: initialData.certificates || [],
        baseSalary: initialData.baseSalary || 0,
        teacher_info: initialData.teacher_info
          ? {
            type: initialData.teacher_info.type || 'PART_TIME',
            hourlyRate: initialData.teacher_info.hourlyRate || 0,
          }
          : { type: 'PART_TIME', hourlyRate: 0 },
      };
    }
    return {
      fullName: '',
      email: '',
      phone: '',
      gender: 'MALE',
      password: '',
      date: undefined,
      roleId: roles.find((r: any) => r.name === 'Student')?._id || '',
      status: 'ACTIVE',
      degrees: [],
      certificates: [],
      baseSalary: 0,
      student_info: { parentsName: '', consultantId: '' },
      teacher_info: { type: 'PART_TIME', hourlyRate: 0 },
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const selectedRoleName = roles.find((r: any) => r._id === formData.roleId)?.name;

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const roleName = selectedRoleName?.toLowerCase();

    if (!formData.fullName?.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.email?.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải bao gồm đúng 10 số';
    }

    if (!formData.date) newErrors.date = 'Vui lòng chọn ngày sinh';

    if (!initialData && !formData.password?.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (roleName === 'teacher' && (!formData.teacher_info?.hourlyRate || formData.teacher_info.hourlyRate <= 0)) {
      newErrors.hourlyRate = 'Vui lòng nhập mức lương hợp lệ';
    }

    if (roleName === 'student') {
      if (!formData.student_info?.parentsName?.trim()) newErrors.parentsName = 'Vui lòng nhập tên phụ huynh';
      if (!formData.student_info?.consultantId) newErrors.consultantId = 'Vui lòng chọn nhân viên tư vấn';
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

  const handleConsultantSearch = async (query: string) => {
    const consultantRole = roles.find((r: any) => ['consultant', 'sale'].includes(r.name?.toLowerCase()));
    if (!consultantRole) return [];
    try {
      const response = await userService.getUsers({
        search: query,
        roleId: consultantRole._id,
        limit: 10,
        status: 'ACTIVE',
      });
      return response.data || [];
    } catch (error) {
      return [];
    }
  };

  const getInitialConsultantName = () => {
    const consultant = initialData?.student_info?.consultantId;
    if (!consultant) return '';
    if (typeof consultant === 'object') return `${(consultant as any).fullName} (${(consultant as any).email})`;
    const found = consultants.find((c: any) => c._id === consultant);
    return found ? `${found.fullName} (${found.email})` : '';
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl z-10 flex flex-col animate-in zoom-in-95 duration-200 max-h-[95vh]">
        <div className="bg-[var(--color-primary)] px-8 py-5 text-white flex justify-between items-center rounded-t-2xl">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <IdCard size={24} />
            {initialData ? 'Chỉnh sửa hồ sơ tài khoản' : 'Đăng ký người dùng mới'}
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full">
            <X size={22} />
          </button>
        </div>

        <form
          className="flex flex-col flex-1 overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validateForm()) return;
            const submitData = { ...formData };
            if (initialData && !submitData.password) delete submitData.password;
            const roleName = selectedRoleName?.toLowerCase();
            if (roleName !== 'student') delete submitData.student_info;
            if (roleName !== 'teacher') delete submitData.teacher_info;
            onSubmit(submitData);
          }}
        >
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 overflow-y-auto">
            {/* CỘT TRÁI */}
            <div className="space-y-6">
              <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-3 text-base uppercase tracking-wider">
                <User size={18} className="text-primary" /> Thông tin cơ bản
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="Họ tên"
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
                  placeholder="Chọn ngày sinh"
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
              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="Email"
                  icon={<Mail size={18} />}
                  value={formData.email}
                  disabled={!!initialData}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={errors.email}
                  className={initialData ? 'bg-stone-100' : ''}
                  autoComplete="new-password"
                  placeholder="example@gmail.com"
                />
                <InputField
                  label="Mật khẩu"
                  icon={<Lock size={18} />}
                  type="password"
                  placeholder={initialData ? 'Bỏ trống nếu không đổi' : 'Nhập mật khẩu'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  error={errors.password}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* CỘT PHẢI */}
            <div className="space-y-6">
              <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-3 text-base uppercase tracking-wider">
                <ShieldCheck size={18} className="text-primary" /> Phân quyền & Trạng thái
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <SelectField
                  label="Vai trò"
                  icon={<ShieldCheck size={18} />}
                  value={formData.roleId as string}
                  onChange={(e) => handleChange('roleId', e.target.value)}
                >
                  {roles.map((role: any) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Trạng thái"
                  icon={<Activity size={18} />}
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Ngừng kích hoạt</option>
                </SelectField>
              </div>

              {/* TRÌNH ĐỘ (TRỪ STUDENT) */}
              {selectedRoleName?.toLowerCase() !== 'student' && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase">
                    <GraduationCap size={16} /> Trình độ chuyên môn
                  </h4>
                  <InputField
                    label="Bằng cấp"
                    icon={<GraduationCap size={18} />}
                    placeholder="Vd: Thạc sĩ, Cử nhân"
                    value={formData.degrees?.join(', ')}
                    onChange={(e) =>
                      handleChange(
                        'degrees',
                        e.target.value
                          .split(',')
                          .map((d) => d.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                  <InputField
                    label="Chứng chỉ"
                    icon={<Award size={18} />}
                    placeholder="Vd: IELTS, TOEIC"
                    value={formData.certificates?.join(', ')}
                    onChange={(e) =>
                      handleChange(
                        'certificates',
                        e.target.value
                          .split(',')
                          .map((d) => d.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                </div>
              )}

              {/* LƯƠNG NHÂN VIÊN VĂN PHÒNG */}
              {selectedRoleName?.toLowerCase() !== 'student' && selectedRoleName?.toLowerCase() !== 'teacher' && (
                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 space-y-4">
                  <h4 className="font-bold text-emerald-700 flex items-center gap-2 text-sm uppercase">
                    <Banknote size={16} /> Mức lương cơ bản
                  </h4>
                  <InputField
                    label="Lương cứng (VNĐ)"
                    icon={<Banknote size={18} />}
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => handleChange('baseSalary', Number(e.target.value))}
                  />
                </div>
              )}

              {/* CẤU HÌNH GIÁO VIÊN */}
              {selectedRoleName?.toLowerCase() === 'teacher' && (
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                  <h4 className="font-bold text-blue-700 flex items-center gap-2 text-sm uppercase">
                    <Briefcase size={16} /> Hợp đồng & Thù lao
                  </h4>
                  <SelectField
                    label="Loại hợp đồng"
                    value={formData.teacher_info?.type}
                    onChange={(e) => handleTeacherInfoChange('type', e.target.value)}
                  >
                    <option value="PART_TIME">Thỉnh giảng (Theo giờ)</option>
                    <option value="FULL_TIME">Cơ hữu (Lương cứng)</option>
                  </SelectField>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.teacher_info?.type === 'FULL_TIME' && (
                      <InputField
                        label="Lương cứng"
                        type="number"
                        value={formData.baseSalary}
                        onChange={(e) => handleChange('baseSalary', Number(e.target.value))}
                      />
                    )}
                    <InputField
                      label={formData.teacher_info?.type === 'FULL_TIME' ? 'Dạy vượt giờ' : 'Lương mỗi giờ'}
                      type="number"
                      value={formData.teacher_info?.hourlyRate}
                      onChange={(e) => handleTeacherInfoChange('hourlyRate', Number(e.target.value))}
                      error={errors.hourlyRate}
                    />
                  </div>
                </div>
              )}

              {/* THÔNG TIN HỌC VIÊN */}
              {selectedRoleName?.toLowerCase() === 'student' && (
                <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100 space-y-4">
                  <h4 className="font-bold text-green-700 flex items-center gap-2 text-sm uppercase">
                    <Users size={16} /> Thông tin học viên
                  </h4>
                  <InputField
                    label="Tên phụ huynh"
                    value={formData.student_info?.parentsName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        student_info: { ...formData.student_info, parentsName: e.target.value },
                      })
                    }
                    error={errors.parentsName}
                  />
                  <InputField
                    label="Trường đang học"
                    value={formData.degrees?.join(', ')}
                    onChange={(e) =>
                      handleChange(
                        'degrees',
                        e.target.value
                          .split(',')
                          .map((d) => d.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                  <Combobox
                    label="Sale chăm sóc"
                    onSearch={handleConsultantSearch}
                    onSelect={(c) =>
                      setFormData({ ...formData, student_info: { ...formData.student_info, consultantId: c?._id } })
                    }
                    getDisplayValue={(c) => (c ? `${c.fullName} (${c.email})` : '')}
                    initialValue={getInitialConsultantName()}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="px-8 py-5 border-t bg-gray-50 flex justify-end gap-4 rounded-b-2xl">
            <Button variant="outline" className="w-32" onClick={onClose} type="button">
              Hủy
            </Button>
            <Button variant="primary" className="w-44 shadow-lg shadow-primary/20" type="submit">
              {initialData ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
