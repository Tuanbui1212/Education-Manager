import { useState } from 'react';
import { X, User, Mail, Phone, Calendar, Lock, Activity, Briefcase, ShieldCheck, Building } from 'lucide-react';
import Button from '../../../../components/Button';
import InputField from '../../../../components/InputField';
import SelectField from '../../../../components/SelectField';
import type { IUser, UserStatus } from '../../../../types/user.type';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<IUser>) => void;
  initialData?: IUser;
  officeRoles: any[];
}

const StaffModal = ({ isOpen, onClose, onSubmit, initialData, officeRoles = [] }: StaffModalProps) => {
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
      roleId: officeRoles.length > 0 ? officeRoles[0]._id : '',
      status: 'ACTIVE' as UserStatus,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!formData.roleId) newErrors.roleId = 'Vui lòng chọn vị trí/chức vụ';
    if (!initialData && !formData.password?.trim()) newErrors.password = 'Vui lòng nhập mật khẩu';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
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

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl z-10 flex flex-col animate-in zoom-in-95 duration-200">
        <div className="bg-[var(--color-primary)] px-8 py-5 text-white flex justify-between items-center shrink-0 rounded-t-2xl">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Building size={24} />
            {initialData ? 'Chỉnh sửa hồ sơ Nhân sự' : 'Thêm Nhân sự mới'}
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
                label="Họ và tên"
                icon={<User size={18} />}
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                error={errors.fullName}
                placeholder="Nhập họ tên nhân viên..."
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
                label="Email công việc"
                icon={<Mail size={18} />}
                placeholder="nv.name@edu.vn"
                value={formData.email}
                disabled={!!initialData}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                className={initialData ? 'bg-stone-100 cursor-not-allowed text-gray-500' : ''}
                autoComplete="off"
              />

              <InputField
                label="Mật khẩu hệ thống"
                icon={<Lock size={18} />}
                type="password"
                placeholder={initialData ? 'Bỏ trống nếu không đổi...' : 'Nhập mật khẩu...'}
                value={formData.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                autoComplete="new-password"
              />
            </div>

            {/* CỘT PHẢI: CHỨC VỤ & TRẠNG THÁI */}
            <div className="space-y-6">
              <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3 text-base uppercase tracking-wider">
                <Briefcase size={18} className="text-primary" />
                Vị trí công tác
              </h4>

              <SelectField
                label="Trạng thái tài khoản"
                icon={<Activity size={18} />}
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="ACTIVE">Đang công tác (Active)</option>
                <option value="INACTIVE">Đã nghỉ việc (Inactive)</option>
              </SelectField>

              {/* KHỐI HIGHLIGHT DÀNH RIÊNG CHO PHÂN QUYỀN */}
              <div className="bg-violet-50/50 p-6 rounded-2xl border border-violet-100 space-y-5 animate-in fade-in duration-300">
                <h4 className="font-bold text-violet-700 flex items-center gap-2 text-base">
                  <ShieldCheck size={18} /> Phân quyền hệ thống
                </h4>

                <SelectField
                  label="Phòng ban / Chức vụ"
                  icon={<Briefcase size={18} className="text-violet-500" />}
                  value={formData.roleId as string}
                  onChange={(e) => handleChange('roleId', e.target.value)}
                  className="bg-white border-violet-200 focus:border-violet-500"
                >
                  <option value="" disabled>
                    -- Chọn chức vụ --
                  </option>
                  {officeRoles.map((role: any) => (
                    <option key={role._id} value={role._id}>
                      {role.name} - {role.description?.split('-')[0]}
                    </option>
                  ))}
                </SelectField>

                <p className="text-xs text-violet-600/80 bg-white p-3 rounded-lg border border-violet-100">
                  <strong className="font-semibold text-violet-700">Lưu ý:</strong> Quyền hạn truy cập các tính năng sẽ
                  tự động được cấp theo chức vụ được chọn.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-4 shrink-0 rounded-b-2xl">
            <Button variant="outline" className="w-32 rounded-xl py-2.5" onClick={onClose} type="button">
              Hủy
            </Button>
            <Button variant="primary" className="w-44 rounded-xl py-2.5 shadow-lg shadow-primary/20" type="submit">
              {initialData ? 'Lưu thay đổi' : 'Thêm Nhân sự'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
