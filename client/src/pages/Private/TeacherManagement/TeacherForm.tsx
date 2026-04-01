import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Activity,
  Banknote,
  GraduationCap,
  Briefcase,
  Award,
  Save,
  XCircle,
  CreditCard,
} from 'lucide-react';

import Button from '../../../components/Button';
import InputField from '../../../components/InputField';
import SelectField from '../../../components/SelectField';
import ConfirmModal from '../../../components/ConfirmModal';

import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import type { IUser, UserStatus } from '../../../types/user.type';

interface IVietQRBank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
}

const TeacherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [teacherRoleId, setTeacherRoleId] = useState<string>('');

  const [bankList, setBankList] = useState<IVietQRBank[]>([]);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState<Partial<IUser>>({
    fullName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    password: '',
    date: undefined,
    roleId: '',
    status: 'ACTIVE' as UserStatus,
    degrees: [],
    certificates: [],
    baseSalary: 0,
    teacher_info: { type: 'PART_TIME', hourlyRate: 0 },
    bankInfo: { bankName: '', bankBin: '', accountNo: '', accountName: '' },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch('https://api.vietqr.io/v2/banks');
        const data = await response.json();
        if (data.code === '00') {
          setBankList(data.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách ngân hàng VietQR:', error);
      }
    };

    fetchBanks();

    const initData = async () => {
      setIsLoading(true);
      try {
        const rolesRes = await roleService.getRoles({});
        const roles = Array.isArray(rolesRes) ? rolesRes : (rolesRes as any)?.data || [];
        const tRole = roles.find((r: any) => r.name?.toLowerCase() === 'teacher');

        if (tRole) {
          setTeacherRoleId(tRole._id);
          setFormData((prev) => ({ ...prev, roleId: tRole._id }));
        }

        if (id) {
          const userRes = await userService.getUserById(id);
          if (userRes.success && userRes.data) {
            const initialData = userRes.data;
            setFormData({
              ...initialData,
              password: '',
              roleId: typeof initialData.roleId === 'object' ? (initialData.roleId as any)._id : initialData.roleId,
              gender: initialData.gender || 'MALE',
              degrees: initialData.degrees || [],
              certificates: initialData.certificates || [],
              baseSalary: initialData.baseSalary || 0,
              teacher_info: {
                type: initialData.teacher_info?.type || 'PART_TIME',
                hourlyRate: initialData.teacher_info?.hourlyRate || 0,
              },
              bankInfo: initialData.bankInfo || { bankName: '', bankBin: '', accountNo: '', accountName: '' },
            });
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName?.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.email?.trim()) newErrors.email = 'Vui lòng nhập email';
    if (!formData.phone?.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.date) newErrors.date = 'Vui lòng chọn ngày sinh';
    if (!id && !formData.password?.trim()) newErrors.password = 'Vui lòng nhập mật khẩu';
    if (!formData.teacher_info?.hourlyRate || formData.teacher_info.hourlyRate <= 0) {
      newErrors.hourlyRate = 'Vui lòng nhập thù lao hợp lệ';
    }
    if (!formData.bankInfo?.bankBin?.trim()) newErrors.bankBin = 'Vui lòng chọn ngân hàng';
    if (!formData.bankInfo?.accountNo?.trim()) newErrors.accountNo = 'Vui lòng nhập số tài khoản';
    if (!formData.bankInfo?.accountName?.trim()) newErrors.accountName = 'Vui lòng nhập tên chủ tài khoản';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof IUser, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as string]) setErrors({ ...errors, [field as string]: '' });
  };

  const handleTeacherInfoChange = (field: string, value: any) => {
    setFormData({ ...formData, teacher_info: { ...formData.teacher_info, [field]: value } });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleBankInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankInfo: {
        ...(prev.bankInfo || { bankName: '', bankBin: '', accountNo: '', accountName: '' }),
        [field]: value,
      },
    }));
  };

  const handleBankSelect = (bin: string) => {
    const selectedBank = bankList.find((b) => b.bin === bin);
    setFormData((prev) => ({
      ...prev,
      bankInfo: {
        ...(prev.bankInfo || { accountNo: '', accountName: '' }),
        bankBin: selectedBank?.bin || '',
        bankName: selectedBank?.shortName || '',
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const submitData = { ...formData };
      if (id && !submitData.password) delete submitData.password;
      if (submitData.teacher_info?.type === 'PART_TIME') submitData.baseSalary = 0;

      

      if (id) {
        const { _id, email, createdAt, updatedAt, role, ...cleanData } = submitData;
        await userService.updateUser(id, cleanData);
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          message: 'Đã cập nhật hồ sơ!',
          type: 'success',
          onConfirm: () => navigate(-1),
        });
      } else {
        await userService.createUser(submitData);
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          message: 'Đã thêm giáo viên mới!',
          type: 'success',
          onConfirm: () => navigate(-1),
        });
      }
    } catch (error: any) {
      const detailError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat() : null;
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: (detailError?.[0] as string) || error.response?.data?.message || 'Có lỗi xảy ra!',
        type: 'danger',
        onConfirm: () => setConfirmConfig((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && id && !formData.email) {
    return <div className="p-8 text-center animate-pulse text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Đóng"
        cancelText=""
      />

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white text-gray-600 rounded-xl shadow-sm hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {id ? 'Chỉnh sửa hồ sơ Giáo viên' : 'Thêm Giáo viên mới'}
              </h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* CỘT TRÁI */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
                  <User className="text-indigo-600" size={20} /> Thông tin cá nhân
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Họ tên Giáo viên"
                    placeholder="Nhập họ tên..."
                    icon={<User size={18} />}
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    error={errors.fullName}
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
                  />
                  <InputField
                    label="Email liên hệ"
                    placeholder="Nhập email..."
                    icon={<Mail size={18} />}
                    value={formData.email}
                    disabled={!!id}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    className={id ? 'bg-gray-100 cursor-not-allowed' : ''}
                    autoComplete="off"
                  />
                  <InputField
                    label="Mật khẩu"
                    icon={<Lock size={18} />}
                    type="password"
                    placeholder={id ? 'Bỏ trống nếu không đổi...' : 'Nhập ít nhất 6 ký tự'}
                    value={formData.password || ''}
                    onChange={(e) => handleChange('password', e.target.value)}
                    error={errors.password}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
                  <GraduationCap className="text-indigo-600" size={20} /> Bằng cấp & Chứng chỉ
                </h3>
                <div className="space-y-6">
                  <InputField
                    label="Bằng cấp đào tạo"
                    icon={<GraduationCap size={18} className="text-gray-400" />}
                    value={formData.degrees?.join(', ') || ''}
                    placeholder="Vd: Thạc sĩ Ngôn ngữ Anh, Cử nhân Sư phạm..."
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
                    label="Chứng chỉ chuyên môn"
                    icon={<Award size={18} className="text-gray-400" />}
                    value={formData.certificates?.join(', ') || ''}
                    placeholder="Vd: Chứng chỉ tiếng Anh, Chứng chỉ Tin học..."
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
              </div>

              {/* THÔNG TIN THANH TOÁN */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
                  <CreditCard className="text-indigo-600" size={20} /> Thông tin Thanh toán (Tùy chọn)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <SelectField
                      label="Ngân hàng thụ hưởng"
                      icon={<CreditCard size={18} />}
                      value={formData.bankInfo?.bankBin || ''}
                      onChange={(e) => handleBankSelect(e.target.value)}
                    >
                      <option value="">-- Chọn ngân hàng --</option>
                      {bankList.map((bank) => (
                        <option key={bank.bin} value={bank.bin}>
                          {bank.shortName} ({bank.code})
                        </option>
                      ))}
                    </SelectField>
                    {errors.bankBin && <span className="text-xs text-red-500 font-medium ml-1">{errors.bankBin}</span>}
                  </div>

                  <InputField
                    label="Số tài khoản"
                    icon={<CreditCard size={18} />}
                    value={formData.bankInfo?.accountNo || ''}
                    onChange={(e) => handleBankInfoChange('accountNo', e.target.value.replace(/\D/g, ''))}
                    placeholder="Vd: 0987654321"
                    error={errors.accountNo}
                  />

                  <div className="md:col-span-2">
                    <InputField
                      label="Tên chủ tài khoản"
                      icon={<User size={18} />}
                      value={formData.bankInfo?.accountName || ''}
                      onChange={(e) => handleBankInfoChange('accountName', e.target.value.toUpperCase())}
                      placeholder="Vd: NGUYEN VAN A (Viết hoa không dấu)"
                      error={errors.accountName}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
                  <Activity className="text-indigo-600" size={18} /> Trạng thái làm việc
                </h3>
                <SelectField
                  label="Trạng thái"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="ACTIVE">Đang giảng dạy (Active)</option>
                  <option value="INACTIVE">Ngừng công tác (Inactive)</option>
                </SelectField>
              </div>

              <div className="bg-indigo-50/50 p-6 rounded-3xl shadow-sm border border-indigo-100">
                <h3 className="text-md font-bold text-indigo-800 mb-4 flex items-center gap-2 border-b border-indigo-200 pb-3">
                  <Briefcase className="text-indigo-600" size={18} /> Hợp đồng & Lương
                </h3>
                <div className="space-y-5">
                  <SelectField
                    label="Loại hợp đồng"
                    value={formData.teacher_info?.type || 'PART_TIME'}
                    onChange={(e) => handleTeacherInfoChange('type', e.target.value)}
                  >
                    <option value="PART_TIME">Part-time (Lương theo giờ)</option>
                    <option value="FULL_TIME">Full-time (Có lương cứng)</option>
                  </SelectField>

                  {formData.teacher_info?.type === 'FULL_TIME' && (
                    <InputField
                      label="Lương cứng (VNĐ/Tháng)"
                      icon={<Banknote size={18} className="text-indigo-400" />}
                      type="number"
                      className="bg-white"
                      value={formData.baseSalary}
                      onChange={(e) => handleChange('baseSalary', Number(e.target.value) || 0)}
                    />
                  )}

                  <InputField
                    label={
                      formData.teacher_info?.type === 'FULL_TIME'
                        ? 'Thù lao dạy vượt giờ (VNĐ/h)'
                        : 'Lương mỗi giờ (VNĐ/h)'
                    }
                    placeholder="Vd: 200000"
                    icon={<Banknote size={18} className="text-indigo-400" />}
                    type="number"
                    className="bg-white"
                    value={formData.teacher_info?.hourlyRate || ''}
                    error={errors.hourlyRate}
                    onChange={(e) => handleTeacherInfoChange('hourlyRate', Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 sticky bottom-6 z-10">
            <Button
              variant="outline"
              className="w-36 rounded-xl py-3"
              onClick={() => navigate(-1)}
              type="button"
              icon={<XCircle size={18} />}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              className="rounded-xl py-3 shadow-lg shadow-indigo-600/20"
              type="submit"
              disabled={isLoading}
              icon={<Save size={18} />}
            >
              {isLoading ? 'Đang xử lý...' : id ? 'Lưu thay đổi' : 'Thêm Giáo viên'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
