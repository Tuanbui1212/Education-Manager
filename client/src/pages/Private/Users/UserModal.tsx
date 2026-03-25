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
      };
    }
    return {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      date: undefined,
      roleId: roles.find((r: any) => r.name === 'Student')?._id || '',
      status: 'ACTIVE',
      student_info: { parentsName: '', consultantId: '' },
      teacher_info: { hourlyRate: 0, degrees: [] },
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
    } else {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Số điện thoại phải bao gồm đúng 10 số';
      }
    }
    if (!formData.date) newErrors.date = 'Vui lòng chọn ngày sinh';

    if (!initialData && !formData.password?.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (roleName === 'student') {
      if (!formData.student_info?.parentsName?.trim()) {
        newErrors.parentsName = 'Vui lòng nhập tên phụ huynh';
      }
      if (!formData.student_info?.consultantId) {
        newErrors.consultantId = 'Vui lòng chọn nhân viên tư vấn/Sale';
      }
    }

    if (roleName === 'teacher') {
      if (!formData.teacher_info?.hourlyRate || formData.teacher_info.hourlyRate <= 0) {
        newErrors.hourlyRate = 'Vui lòng nhập mức lương hợp lệ (>0)';
      }
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

  const handleConsultantSearch = async (query: string) => {
    const consultantRole = roles.find(
      (r: any) => r.name?.toLowerCase() === 'consultant' || r.name?.toLowerCase() === 'sale',
    );

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
      console.error('Lỗi khi tìm Consultant:', error);
      return [];
    }
  };

  const getInitialConsultantName = () => {
    const consultant = initialData?.student_info?.consultantId;
    if (!consultant) return '';

    if (typeof consultant === 'object' && consultant !== null) {
      return `${(consultant as any).fullName} (${(consultant as any).email})`;
    }

    const foundConsultant = consultants.find((c: any) => c._id === consultant);
    if (foundConsultant) {
      return `${foundConsultant.fullName} (${foundConsultant.email})`;
    }

    return '';
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl z-10 flex flex-col animate-in zoom-in-95 duration-200">
        <div className="bg-[var(--color-primary)] px-8 py-5 text-white flex justify-between items-center shrink-0 rounded-t-2xl">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <IdCard size={24} />
            {initialData ? 'Chỉnh sửa hồ sơ tài khoản' : 'Đăng ký người dùng mới'}
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
            <X size={22} />
          </button>
        </div>

        <form
          className="flex flex-col flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validateForm()) return;

            const submitData = { ...formData };
            if (initialData && !submitData.password) {
              delete submitData.password;
            }

            const roleName = selectedRoleName?.toLowerCase();

            if (roleName !== 'student') {
              delete submitData.student_info;
            } else {
              if (submitData.student_info && !submitData.student_info.consultantId) {
                delete submitData.student_info.consultantId;
              }
            }

            if (roleName !== 'teacher') {
              delete submitData.teacher_info;
            }

            onSubmit(submitData);
          }}
        >
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
            <div className="space-y-6">
              <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3 text-base uppercase tracking-wider">
                <User size={18} className="text-primary" />
                Thông tin cơ bản
              </h4>

              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="Họ tên"
                  icon={<User size={18} />}
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  error={errors.fullName}
                  placeholder="Nhập họ tên..."
                />

                <InputField
                  label="Ngày sinh"
                  icon={<Calendar size={18} />}
                  type="date"
                  value={formData.date ? String(formData.date).split('T') : ''}
                  onChange={(e) => handleChange('date', e.target.value)}
                  error={errors.date}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="Email"
                  icon={<Mail size={18} />}
                  placeholder="Email..."
                  value={formData.email}
                  disabled={!!initialData}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={errors.email}
                  className={initialData ? 'bg-stone-100 cursor-not-allowed text-gray-500' : ''}
                  autoComplete="off"
                />

                <InputField
                  label="Số điện thoại"
                  icon={<Phone size={18} />}
                  type="tel"
                  placeholder="SĐT..."
                  value={formData.phone}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, '');
                    handleChange('phone', onlyNumbers);
                  }}
                  error={errors.phone}
                />
              </div>

              <InputField
                label="Mật khẩu"
                icon={<Lock size={18} />}
                type="password"
                placeholder={initialData ? 'Bỏ trống nếu không đổi mật khẩu...' : 'Nhập mật khẩu...'}
                value={formData.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                autoComplete="new-password"
              />
            </div>

            {/* CỘT PHẢI: QUYỀN & THÔNG TIN ROLE CỤ THỂ */}
            <div className="space-y-6">
              <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3 text-base uppercase tracking-wider">
                <ShieldCheck size={18} className="text-primary" />
                Phân quyền & Trạng thái
              </h4>

              <div className="grid grid-cols-2 gap-6">
                <SelectField
                  label="Vai trò (Role)"
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
                  onChange={(e) => handleChange('status', e.target.value as UserStatus)}
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Ngừng kích hoạt</option>
                </SelectField>
              </div>

              {selectedRoleName?.toLowerCase() === 'teacher' && (
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-5 animate-in fade-in duration-300">
                  <h4 className="font-bold text-blue-700 flex items-center gap-2 text-base">
                    <GraduationCap size={18} /> Thông tin Giáo viên
                  </h4>

                  <div className="grid grid-cols-1 gap-5">
                    <InputField
                      label="Lương mỗi giờ"
                      icon={<Banknote size={18} className="text-blue-500" />}
                      type="number"
                      className="bg-white border-blue-200"
                      placeholder="Vd: 200000"
                      value={formData.teacher_info?.hourlyRate || ''}
                      error={errors.hourlyRate}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          teacher_info: { ...formData.teacher_info, hourlyRate: Number(e.target.value) },
                        });
                        if (errors.hourlyRate) setErrors({ ...errors, hourlyRate: '' });
                      }}
                    />

                    <InputField
                      label="Bằng cấp (cách nhau dấu phẩy)"
                      icon={<GraduationCap size={18} className="text-blue-500" />}
                      className="bg-white border-blue-200"
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
                </div>
              )}

              {selectedRoleName?.toLowerCase() === 'student' && (
                <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100 space-y-5 animate-in fade-in duration-300">
                  <h4 className="font-bold text-green-700 flex items-center gap-2 text-base">
                    <Users size={18} /> Thông tin Học viên
                  </h4>

                  <div className="grid grid-cols-1 gap-5">
                    <InputField
                      label="Tên phụ huynh"
                      icon={<Users size={18} className="text-green-500" />}
                      className="bg-white border-green-200"
                      placeholder="Vd: Nguyễn Văn A"
                      value={formData.student_info?.parentsName || ''}
                      error={errors.parentsName}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          student_info: { ...formData.student_info, parentsName: e.target.value },
                        });
                        if (errors.parentsName) setErrors({ ...errors, parentsName: '' });
                      }}
                    />

                    <div className="space-y-1">
                      <Combobox
                        label="Nhân viên Sale chăm sóc"
                        icon={<Headset size={18} className="text-green-500" />}
                        placeholder="Tìm kiếm Sale..."
                        onSearch={handleConsultantSearch}
                        onSelect={(consultant) => {
                          setFormData({
                            ...formData,
                            student_info: { ...formData.student_info, consultantId: consultant?._id },
                          });
                          if (errors.consultantId) setErrors({ ...errors, consultantId: '' });
                        }}
                        getDisplayValue={(consultant) =>
                          consultant ? `${consultant.fullName} (${consultant.email})` : ''
                        }
                        direction="up"
                        initialValue={getInitialConsultantName()}
                      />
                      {errors.consultantId && <p className="text-sm text-red-500 mt-1 pl-1">{errors.consultantId}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-4 shrink-0 rounded-b-2xl">
            <Button variant="outline" className="w-32 rounded-xl py-2.5" onClick={onClose} type="button">
              Hủy
            </Button>
            <Button variant="primary" className="w-44 rounded-xl py-2.5 shadow-lg shadow-primary/20" type="submit">
              {initialData ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
