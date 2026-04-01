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
  Award,
  Save,
  XCircle,
  CreditCard,
  ShieldCheck,
  Briefcase,
  Building,
} from 'lucide-react';

import Button from '../../../components/Button';
import InputField from '../../../components/InputField';
import SelectField from '../../../components/SelectField';
import ConfirmModal from '../../../components/ConfirmModal';

import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import type { IUser, UserStatus } from '../../../types/user.type';
import { translateRole } from '../../../utils/format.util';

interface IVietQRBank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
}

const StaffForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [officeRoles, setOfficeRoles] = useState<any[]>([]);
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
    bankInfo: { bankName: '', bankBin: '', accountNo: '', accountName: '' },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Khởi tạo dữ liệu ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch('https://api.vietqr.io/v2/banks');
        const data = await res.json();
        if (data.code === '00') setBankList(data.data);
      } catch (e) {
        console.error('Lỗi tải danh sách ngân hàng:', e);
      }
    };

    fetchBanks();

    const initData = async () => {
      setIsLoading(true);
      try {
        const rolesRes = await roleService.getRoles({});
        const allRoles = Array.isArray(rolesRes) ? rolesRes : (rolesRes as any)?.data || [];
        const filtered = allRoles.filter(
          (r: any) => !['student', 'teacher', 'potential', 'super admin'].includes(r.name?.toLowerCase()),
        );
        setOfficeRoles(filtered);

        if (id) {
          const userRes = await userService.getUserById(id);
          if (userRes.success && userRes.data) {
            const d = userRes.data;
            setFormData({
              ...d,
              password: '',
              roleId: typeof d.roleId === 'object' ? (d.roleId as any)._id : d.roleId,
              gender: d.gender || 'MALE',
              degrees: d.degrees || [],
              certificates: d.certificates || [],
              baseSalary: d.baseSalary || 0,
              bankInfo: d.bankInfo || { bankName: '', bankBin: '', accountNo: '', accountName: '' },
            });
          }
        } else {
          // Mặc định chọn role đầu tiên trong danh sách
          if (filtered.length > 0) {
            setFormData((prev) => ({ ...prev, roleId: filtered[0]._id }));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [id]);

  // ─── Validate ──────────────────────────────────────────────────────────────
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
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải bao gồm đúng 10 số';
    }

    if (!formData.date) newErrors.date = 'Vui lòng chọn ngày sinh';
    if (!formData.roleId) newErrors.roleId = 'Vui lòng chọn chức vụ';

    if (!id && !formData.password?.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.bankInfo?.bankBin?.trim()) newErrors.bankBin = 'Vui lòng chọn ngân hàng';
    if (!formData.bankInfo?.accountNo?.trim()) newErrors.accountNo = 'Vui lòng nhập số tài khoản';
    if (!formData.bankInfo?.accountName?.trim()) newErrors.accountName = 'Vui lòng nhập tên chủ tài khoản';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    return Object.keys(newErrors).length === 0;
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (field: keyof IUser, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as string]) setErrors({ ...errors, [field as string]: '' });
  };

  const handleBankInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankInfo: {
        ...(prev.bankInfo || { bankName: '', bankBin: '', accountNo: '', accountName: '' }),
        [field]: value,
      },
    }));
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleBankSelect = (bin: string) => {
    const bank = bankList.find((b) => b.bin === bin);
    setFormData((prev) => ({
      ...prev,
      bankInfo: {
        ...(prev.bankInfo || { accountNo: '', accountName: '' }),
        bankBin: bank?.bin || '',
        bankName: bank?.shortName || '',
      },
    }));
    if (errors.bankBin) setErrors({ ...errors, bankBin: '' });
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const submitData = { ...formData };
      if (id && !submitData.password) delete submitData.password;

      const { _id, email: _email, createdAt, updatedAt, role, ...cleanData } = submitData as any;

      if (id) {
        await userService.updateUser(id, cleanData);
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          message: 'Đã cập nhật hồ sơ nhân sự!',
          type: 'success',
          onConfirm: () => navigate(-1),
        });
      } else {
        await userService.createUser(cleanData);
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          message: 'Đã thêm nhân sự mới!',
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

  // ─── Render ────────────────────────────────────────────────────────────────
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white text-gray-600 rounded-xl shadow-sm hover:bg-violet-50 hover:text-violet-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{id ? 'Chỉnh sửa hồ sơ Nhân sự' : 'Thêm Nhân sự mới'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Nhân viên khối văn phòng / phòng ban</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* ════════ CỘT TRÁI (2/3) ════════ */}
            <div className="xl:col-span-2 space-y-6">
              {/* Thông tin cá nhân */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
                  <User className="text-violet-600" size={20} /> Thông tin cá nhân
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Họ và tên"
                    placeholder="Nhập họ tên nhân viên..."
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
                    placeholder="Vd: 0912345678"
                    icon={<Phone size={18} />}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                    error={errors.phone}
                  />
                  <InputField
                    label="Email công việc"
                    placeholder="nv.name@edu.vn"
                    icon={<Mail size={18} />}
                    value={formData.email}
                    disabled={!!id}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    className={id ? 'bg-gray-100 cursor-not-allowed' : ''}
                    autoComplete="off"
                  />
                  <InputField
                    label="Mật khẩu hệ thống"
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

              {/* Bằng cấp & Chứng chỉ */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
                  <GraduationCap className="text-violet-600" size={20} /> Bằng cấp & Chứng chỉ
                </h3>
                <div className="space-y-6">
                  <InputField
                    label="Bằng cấp đào tạo"
                    icon={<GraduationCap size={18} className="text-gray-400" />}
                    value={formData.degrees?.join(', ') || ''}
                    placeholder="Vd: Thạc sĩ Quản trị, Cử nhân Kinh tế... (phân cách bởi dấu phẩy)"
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
                    placeholder="Vd: Chứng chỉ kế toán, Chứng chỉ nhân sự... (phân cách bởi dấu phẩy)"
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

              {/* Thông tin Thanh toán */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
                  <CreditCard className="text-violet-600" size={20} /> Thông tin Thanh toán
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
                    {errors.bankBin && (
                      <span className="text-xs text-red-500 font-medium ml-1 mt-1 block">{errors.bankBin}</span>
                    )}
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

            <div className="space-y-6">
              {/* Trạng thái */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
                  <Activity className="text-violet-600" size={18} /> Trạng thái
                </h3>
                <SelectField
                  label="Trạng thái tài khoản"
                  icon={<Activity size={18} />}
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="ACTIVE">Đang công tác (Active)</option>
                  <option value="INACTIVE">Đã nghỉ việc (Inactive)</option>
                </SelectField>
              </div>

              {/* Phân quyền */}
              <div className="bg-violet-50/50 p-6 rounded-3xl shadow-sm border border-violet-100">
                <h3 className="text-md font-bold text-violet-800 mb-4 flex items-center gap-2 border-b border-violet-200 pb-3">
                  <ShieldCheck className="text-violet-600" size={18} /> Phân quyền hệ thống
                </h3>
                <div className="space-y-4">
                  <SelectField
                    label="Phòng ban / Chức vụ"
                    icon={<Briefcase size={18} className="text-violet-500" />}
                    value={formData.roleId as string}
                    onChange={(e) => handleChange('roleId', e.target.value)}
                    className="bg-white border-violet-200"
                  >
                    <option value="" disabled>
                      -- Chọn chức vụ --
                    </option>
                    {officeRoles.map((role: any) => (
                      <option key={role._id} value={role._id}>
                        {translateRole(role.name as string)}
                      </option>
                    ))}

                    {errors.roleId && (
                      <span className="text-xs text-red-500 font-medium ml-1 mt-1 block">{errors.roleId}</span>
                    )}
                  </SelectField>
                  <p className="text-xs text-violet-600/80 bg-white p-3 rounded-xl border border-violet-100">
                    <strong className="font-semibold text-violet-700">Lưu ý:</strong> Quyền hạn truy cập các tính năng
                    sẽ tự động được cấp theo chức vụ được chọn.
                  </p>
                </div>
              </div>

              {/* Lương cứng */}
              <div className="bg-emerald-50/50 p-6 rounded-3xl shadow-sm border border-emerald-100">
                <h3 className="text-md font-bold text-emerald-800 mb-4 flex items-center gap-2 border-b border-emerald-200 pb-3">
                  <Banknote className="text-emerald-600" size={18} /> Mức lương cơ bản
                </h3>
                <InputField
                  label="Lương cứng (VNĐ/Tháng)"
                  icon={<Banknote size={18} />}
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => handleChange('baseSalary', Number(e.target.value) || 0)}
                  placeholder="Vd: 15000000"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
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
              className="rounded-xl py-3 shadow-lg shadow-violet-600/20"
              type="submit"
              disabled={isLoading}
              icon={<Save size={18} />}
            >
              {isLoading ? 'Đang xử lý...' : id ? 'Lưu thay đổi' : 'Thêm Nhân sự'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffForm;
