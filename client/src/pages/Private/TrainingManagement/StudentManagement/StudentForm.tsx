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
  GraduationCap,
  Save,
  XCircle,
  Users,
  Headset,
  ClipboardList,
} from 'lucide-react';

import Button from '../../../../components/Button';
import InputField from '../../../../components/InputField';
import SelectField from '../../../../components/SelectField';
import Combobox from '../../../../components/Combobox';
import ConfirmModal from '../../../../components/ConfirmModal';

import { userService } from '../../../../services/user.service';
import { roleService } from '../../../../services/role.service';
import type { IUser, UserStatus } from '../../../../types/user.type';

import { STATUS_OPTIONS } from '../../../../utils/constants';
import { se } from 'date-fns/locale';

// ─── Component ───────────────────────────────────────────────────────────────
const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [studentRoleId, setStudentRoleId] = useState('');
  const [nameConsultant, setNameConsultant] = useState('');

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
    onConfirm: () => { },
  });

  const [formData, setFormData] = useState<Partial<IUser>>({
    fullName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    password: '',
    date: undefined,
    roleId: '',
    status: 'POTENTIAL' as UserStatus,
    student_info: { parentsName: '', consultantId: '' },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const rolesRes = await roleService.getRoles({});
        const rolesList = Array.isArray(rolesRes) ? rolesRes : (rolesRes as any)?.data || [];
        setRoles(rolesList);

        const studentRole = rolesList.find((r: any) => r.name?.toLowerCase() === 'student');
        const resolvedStudentRoleId = studentRole?._id || '';
        setStudentRoleId(resolvedStudentRoleId);

        if (id) {
          const userRes = await userService.getUserById(id);
          getInitialConsultantName();
          if (userRes.success && userRes.data) {
            const d = userRes.data;
            setFormData({
              ...d,
              password: '',
              roleId: resolvedStudentRoleId,
              gender: d.gender || 'MALE',
              student_info: d.student_info || { parentsName: '', consultantId: '' },
            });
          }
        } else {
          setFormData((prev) => ({ ...prev, roleId: resolvedStudentRoleId }));
        }
      } catch (error) {
        console.error('Lỗi khởi tạo dữ liệu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [id]);

  // ─── Validate ───────────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải đúng 10 chữ số';
    }

    if (!formData.date) {
      newErrors.date = 'Vui lòng chọn ngày sinh';
    }

    if (!id && !formData.password?.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.student_info?.parentsName?.trim()) {
      newErrors.parentsName = 'Vui lòng nhập tên phụ huynh';
    }

    if (!formData.student_info?.consultantId) {
      newErrors.consultantId = 'Vui lòng chọn nhân viên tư vấn';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    return Object.keys(newErrors).length === 0;
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (field: keyof IUser, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors((prev) => ({ ...prev, [field as string]: '' }));
  };

  const handleStudentInfoChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      student_info: { ...prev.student_info, [field]: value },
    }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
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
    } catch {
      return [];
    }
  };

  const getInitialConsultantName = async () => {
    const consultant = formData.student_info?.consultantId;
    if (!consultant) return '';
    const userRes = await userService.getUserById(consultant as string);
    setNameConsultant(userRes.data?.fullName || '');
    return userRes.data?.fullName || '';
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const submitData = { ...formData };
      if (id && !submitData.password) delete submitData.password;

      const { _id, email: _email, createdAt, updatedAt, role, ...cleanData } = submitData as any;

      if (id) {
        const updatePayload = {
          fullName: cleanData.fullName,
          phone: cleanData.phone,
          gender: cleanData.gender,
          date: cleanData.date,
          status: cleanData.status,
          roleId: studentRoleId,
          student_info: {
            parentsName: cleanData.student_info?.parentsName,
            consultantId: cleanData.student_info?.consultantId,
          },
          ...(cleanData.password ? { password: cleanData.password } : {}),
        };
        await userService.updateUser(id, updatePayload);
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          message: 'Đã cập nhật hồ sơ học viên!',
          type: 'success',
          onConfirm: () => navigate(-1),
        });
      } else {
        await userService.createUser(submitData);
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          message: 'Đã thêm học viên mới!',
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

  // ─── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading && id && !formData.email) {
    return <div className="p-8 text-center animate-pulse text-gray-500">Đang tải dữ liệu...</div>;
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Đóng"
        cancelText=""
      />

      <div className="max-w-5xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 bg-white text-gray-600 rounded-xl shadow-sm hover:bg-green-50 hover:text-green-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <GraduationCap className="text-green-600" size={26} />
              {id ? 'Chỉnh sửa hồ sơ Học viên' : 'Thêm Học viên mới'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {id
                ? 'Cập nhật thông tin cá nhân và học tập của học viên.'
                : 'Điền đầy đủ thông tin để tạo hồ sơ học viên mới.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* ════════ CỘT TRÁI (2/3) ════════ */}
            <div className="xl:col-span-2 space-y-6">
              {/* ── Thông tin cá nhân ── */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
                  <User className="text-green-600" size={20} /> Thông tin cá nhân
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InputField
                      label="Họ tên học viên"
                      placeholder="Nhập họ và tên đầy đủ..."
                      icon={<User size={18} />}
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      error={errors.fullName}
                    />
                  </div>

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
                    placeholder="Nhập số điện thoại (10 số)..."
                    icon={<Phone size={18} />}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                    error={errors.phone}
                  />

                  <InputField
                    label="Email liên hệ"
                    placeholder="example@gmail.com"
                    icon={<Mail size={18} />}
                    value={formData.email}
                    disabled={!!id}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    className={id ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}
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

              {/* ── Thông tin học viên (phụ huynh + sale) ── */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
                  <Users className="text-green-600" size={20} /> Phụ huynh & Người chăm sóc
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Tên phụ huynh / Giám hộ"
                    placeholder="Nhập tên phụ huynh..."
                    icon={<Users size={18} />}
                    value={formData.student_info?.parentsName || ''}
                    onChange={(e) => handleStudentInfoChange('parentsName', e.target.value)}
                    error={errors.parentsName}
                  />

                  <div>
                    <Combobox
                      label="Sale / Tư vấn viên"
                      icon={<Headset size={18} />}
                      placeholder="Tìm kiếm tên hoặc email..."
                      onSearch={handleConsultantSearch}
                      onSelect={(consultant) => handleStudentInfoChange('consultantId', consultant?._id)}
                      getDisplayValue={(consultant) =>
                        consultant ? `${consultant.fullName} (${consultant.email})` : ''
                      }
                      initialValue={nameConsultant}
                    />
                    {errors.consultantId && (
                      <span className="text-xs text-red-500 font-medium ml-1 mt-1 block">{errors.consultantId}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ════════ CỘT PHẢI (1/3) ════════ */}
            <div className="space-y-6">
              {/* ── Trạng thái học tập ── */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
                  <ClipboardList className="text-green-600" size={18} /> Trạng thái học tập
                </h3>
                <SelectField
                  label="Trạng thái"
                  icon={<Activity size={18} />}
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as UserStatus)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </SelectField>
              </div>

              {/* ── Tóm tắt hồ sơ (readonly preview) ── */}
              <div className="bg-green-50/60 p-6 rounded-3xl border border-green-100">
                <h3 className="text-md font-bold text-green-800 mb-4 flex items-center gap-2 border-b border-green-200 pb-3">
                  <GraduationCap className="text-green-600" size={18} /> Tóm tắt hồ sơ
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2 text-gray-600">
                    <User size={14} className="mt-0.5 text-green-500 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Họ tên</p>
                      <p className="font-medium text-gray-800 break-words">{formData.fullName || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <Phone size={14} className="mt-0.5 text-green-500 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Điện thoại</p>
                      <p className="font-medium text-gray-800">{formData.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <Users size={14} className="mt-0.5 text-green-500 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Phụ huynh</p>
                      <p className="font-medium text-gray-800">{formData.student_info?.parentsName || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <Activity size={14} className="mt-0.5 text-green-500 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Trạng thái</p>
                      <p className="font-medium text-gray-800">
                        {STATUS_OPTIONS.find((o) => o.value === formData.status)?.label || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Action bar (sticky bottom) ── */}
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
              className="rounded-xl py-3 shadow-lg shadow-green-600/20"
              type="submit"
              disabled={isLoading}
              icon={<Save size={18} />}
            >
              {isLoading ? 'Đang xử lý...' : id ? 'Lưu thay đổi' : 'Thêm Học viên'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
