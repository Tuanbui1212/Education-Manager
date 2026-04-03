import { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Activity,
  Users,
  GraduationCap,
  ClipboardList,
  Headset,
} from 'lucide-react';
import Button from '../../../components/Button';
import InputField from '../../../components/InputField';
import SelectField from '../../../components/SelectField';
import Combobox from '../../../components/Combobox';
import { userService } from '../../../services/user.service';
import type { IUser, UserStatus } from '../../../types/user.type';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<IUser>) => void;
  initialData?: IUser;
  studentRoleId: string;
  roles?: any[];
  consultants?: any[];
}

const StudentModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  studentRoleId,
  roles = [],
  consultants = [],
}: StudentModalProps) => {
  const [formData, setFormData] = useState<Partial<IUser>>(() => {
    if (initialData) {
      return {
        ...initialData,
        password: '',
        roleId: studentRoleId,
        student_info: {
          parentsName: initialData.student_info?.parentsName || '',
          consultantId: initialData.student_info?.consultantId || '',
        },
      };
    }

    return {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      date: undefined,
      roleId: studentRoleId,
      status: 'POTENTIAL' as UserStatus,
      student_info: { parentsName: '', consultantId: '' },
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
      });
      return response.data || [];
    } catch (error) {
      return [];
    }
  };

  const getInitialConsultantName = () => {
    const consultant = initialData?.student_info?.consultantId;
    if (!consultant) return '';
    if (typeof consultant === 'object' && consultant !== null) {
      return `${(consultant as any).fullName} (${(consultant as any).email})`;
    }
    const found = consultants.find((c: any) => c._id === consultant);
    return found ? `${found.fullName} (${found.email})` : '';
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
            <GraduationCap size={24} />
            {initialData ? 'Chỉnh sửa hồ sơ Học viên' : 'Thêm Học viên mới'}
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
            <X size={22} />
          </button>
        </div>

        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* CỘT TRÁI */}
            <div className="space-y-6">
              <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3 text-base uppercase tracking-wider">
                <User size={18} className="text-primary" />
                Thông tin cá nhân
              </h4>

              <InputField
                label="Họ tên học viên"
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
                placeholder="example@gmail.com"
                value={formData.email}
                disabled={!!initialData}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                className={initialData ? 'bg-stone-100 cursor-not-allowed text-gray-500' : ''}
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

            {/* CỘT PHẢI */}
            <div className="space-y-6">
              <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3 text-base uppercase tracking-wider">
                <ClipboardList size={18} className="text-primary" />
                Thông tin nhập học
              </h4>

              <SelectField
                label="Trạng thái học tập"
                icon={<Activity size={18} />}
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="POTENTIAL">Tiềm năng (Potential)</option>
                <option value="ACTIVE">Đang học (Active)</option>
                <option value="RESERVED">Bảo lưu (Reserved)</option>
                <option value="INACTIVE">Đã nghỉ (Inactive)</option>
              </SelectField>

              <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100 space-y-5 animate-in fade-in duration-300">
                <h4 className="font-bold text-green-700 flex items-center gap-2 text-base">
                  <Users size={18} /> Phụ huynh & Người chăm sóc
                </h4>

                {/* Sửa grid-cols-1 để các ô input nằm xếp chồng lên nhau, không bị phình to */}
                <div className="grid grid-cols-1 gap-5">
                  <InputField
                    label="Tên phụ huynh / Giám hộ"
                    icon={<Users size={18} className="text-green-500" />}
                    className="bg-white border-green-200 focus:border-green-500"
                    value={formData.student_info?.parentsName || ''}
                    onChange={(e) => handleChange('parentsName', e.target.value)}
                    placeholder="Nhập tên phụ huynh..."
                  />

                  <Combobox
                    label="Sale / Tư vấn viên"
                    icon={<Headset size={18} className="text-green-500" />}
                    placeholder="Tìm kiếm Sale..."
                    onSearch={handleConsultantSearch}
                    onSelect={(consultant) => {
                      setFormData({
                        ...formData,
                        student_info: { ...formData.student_info, consultantId: consultant?._id },
                      });
                    }}
                    getDisplayValue={(consultant) => (consultant ? `${consultant.fullName} (${consultant.email})` : '')}
                    initialValue={getInitialConsultantName()}
                    direction="up"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-4 shrink-0 rounded-b-2xl">
            <Button variant="outline" className="w-32 rounded-xl py-2.5" onClick={onClose} type="button">
              Hủy
            </Button>
            <Button variant="primary" className="w-44 rounded-xl py-2.5 shadow-lg shadow-primary/20" type="submit">
              {initialData ? 'Lưu thay đổi' : 'Thêm Học viên'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
