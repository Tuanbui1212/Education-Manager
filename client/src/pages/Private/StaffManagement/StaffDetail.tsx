import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Edit,
  ShieldCheck,
  Briefcase,
  KeyRound,
  CreditCard,
  Banknote,
  GraduationCap,
  Award,
  User,
  CheckCircle2,
  XCircle,
  Building,
} from 'lucide-react';
import { formatDate, getStatusUserStyles } from '../../../utils/format.util';
import useFetch from '../../../hooks/useFetch';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../../services/user.service';
import Button from '../../../components/Button';
import type { IRole } from '../../../types/user.type';
import { PATHS, STATUS_OPTIONS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/format.util';

const StaffDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: staff, loading, error } = useFetch(userService.getUserById, id as string, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải thông tin...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
  if (!staff) return <div className="p-8 text-center text-gray-500">Không tìm thấy hồ sơ nhân sự.</div>;

  const staffRole = staff.roleId as IRole;
  const hasBankInfo = staff.bankInfo?.accountNo && staff.bankInfo?.bankName;
  const hasDegrees = (staff.degrees?.length ?? 0) > 0;
  const hasCertificates = (staff.certificates?.length ?? 0) > 0;
  const genderLabel = staff.gender === 'MALE' ? 'Nam' : staff.gender === 'FEMALE' ? 'Nữ' : 'Khác';

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
            onClick={() => navigate(-1)}
            title="Quay lại"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hồ sơ Nhân sự</h1>
            <p className="text-sm text-gray-500 mt-0.5">Chi tiết thông tin nhân viên khối văn phòng</p>
          </div>
        </div>
        <Button
          variant="primary"
          className="bg-primary hover:bg-primary-btn border-primary"
          icon={<Edit size={18} />}
          onClick={() => navigate(PATHS.HR_STAFFS_EDIT.replace(':id', id || ''))}
        >
          Chỉnh sửa hồ sơ
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ════════ CỘT TRÁI ════════ */}
        <div className="space-y-6">
          {/* Card Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Banner */}
            <div className="h-20 bg-gradient-to-br bg-primary" />

            <div className="px-6 pb-6 -mt-10">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-primary mb-3">
                {staff.fullName.charAt(0).toUpperCase()}
              </div>

              <h2 className="text-xl font-bold text-gray-800">{staff.fullName}</h2>

              {/* Role badge */}
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-600 font-medium bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg w-fit">
                <Building size={13} className="text-slate-400" />
                {staffRole?.name || 'N/A'}
              </div>

              {/* Status badge */}
              <div className="mt-3">
                <span className={getStatusUserStyles(staff.status as string)}>
                  {STATUS_OPTIONS.find((opt) => opt.value === staff.status)?.label || staff.status}
                </span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-100 my-5" />

              {/* Thông tin liên hệ */}
              <div className="space-y-3">
                <InfoRow icon={<Phone size={15} className="text-gray-400" />} value={staff.phone} />
                <InfoRow icon={<Mail size={15} className="text-gray-400" />} value={staff.email} />
                <InfoRow
                  icon={<CalendarIcon size={15} className="text-gray-400" />}
                  label="Ngày sinh"
                  value={formatDate(staff.date as string)}
                />
                <InfoRow icon={<User size={15} className="text-gray-400" />} label="Giới tính" value={genderLabel} />
                <InfoRow
                  icon={<CalendarIcon size={15} className="text-gray-400" />}
                  label="Ngày tạo TK"
                  value={formatDate(staff.createdAt as string)}
                />
              </div>
            </div>
          </div>

          {/* Card Bằng cấp & Chứng chỉ */}
          {(hasDegrees || hasCertificates) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b pb-3 mb-4">
                <GraduationCap size={16} className="text-gray-400" /> Bằng cấp & Chứng chỉ
              </h3>
              {hasDegrees && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bằng cấp</p>
                  <div className="flex flex-wrap gap-2">
                    {staff.degrees!.map((d, i) => (
                      <span
                        key={i}
                        className="text-xs bg-info-bg text-info border border-blue-100 px-2.5 py-1 rounded-lg font-medium"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hasCertificates && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Award size={12} /> Chứng chỉ
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {staff.certificates!.map((c, i) => (
                      <span
                        key={i}
                        className="text-xs bg-success-bg text-success border border-green-100 px-2.5 py-1 rounded-lg font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ════════ CỘT PHẢI ════════ */}
        <div className="xl:col-span-2 space-y-6">
          {/* Card Thông tin công tác */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-3 mb-5">
              <Briefcase size={18} className="text-gray-500" /> Thông tin công tác
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                label="Phòng ban"
                value={staffRole?.name || 'N/A'}
                icon={<Building size={18} className="text-gray-400" />}
                bg="bg-gray-50"
              />
              <StatCard
                label="Mức lương"
                value={formatCurrency(staff.baseSalary as number)}
                icon={<Banknote size={18} className="text-success" />}
                bg="bg-success-bg"
              />
              <StatCard
                label="Số quyền hạn"
                value={`${staffRole?.permissions?.length || 0} quyền`}
                icon={<ShieldCheck size={18} className="text-blue-500" />}
                bg="bg-blue-50"
              />
            </div>
          </div>

          {/* Card Thông tin Ngân hàng */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-3 mb-5">
              <CreditCard size={18} className="text-gray-500" /> Thông tin Thanh toán
            </h3>
            {hasBankInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BankInfoItem label="Ngân hàng" value={staff.bankInfo!.bankName || '—'} />
                <BankInfoItem label="Số tài khoản" value={staff.bankInfo!.accountNo || '—'} mono />
                <BankInfoItem label="Chủ tài khoản" value={staff.bankInfo!.accountName || '—'} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                <CreditCard size={36} className="opacity-20" />
                <p className="text-sm">Chưa có thông tin ngân hàng.</p>
                <button
                  onClick={() => navigate(PATHS.HR_STAFFS_EDIT.replace(':id', id || ''))}
                  className="text-xs text-gray-500 hover:underline mt-1"
                >
                  Thêm thông tin ngân hàng →
                </button>
              </div>
            )}
          </div>

          {/* Card Quyền hạn hệ thống */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-5">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <ShieldCheck size={18} className="text-gray-500" /> Quyền hạn hệ thống
              </h3>
              <span className="text-xs font-semibold bg-info-bg text-info px-3 py-1 rounded-full">
                {staffRole?.permissions?.length || 0} quyền
              </span>
            </div>

            {staffRole?.permissions && staffRole.permissions.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Các module nhân viên <strong className="text-gray-700">{staffRole.name}</strong> được phép truy cập:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {staffRole.permissions.map((perm, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-colors"
                    >
                      <CheckCircle2 size={15} className="text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-slate-700 break-all">{perm}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
                <XCircle size={40} className="opacity-20" />
                <p className="text-sm">Chức vụ này chưa được cấp quyền hạn nào.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label?: string; value?: string }) => (
  <div className="flex items-center gap-3 text-gray-600">
    <div className="p-1.5 bg-gray-50 rounded-lg shrink-0">{icon}</div>
    <span className="text-sm">
      {label && <span className="text-gray-400">{label}: </span>}
      <span className="font-medium">{value || '—'}</span>
    </span>
  </div>
);

const StatCard = ({ label, value, icon, bg }: { label: string; value: string; icon: React.ReactNode; bg: string }) => (
  <div className={`${bg} rounded-xl p-4 flex flex-col gap-2`}>
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-bold text-gray-800 break-words">{value}</p>
  </div>
);

const BankInfoItem = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-sm font-bold text-gray-800 ${mono ? 'font-mono tracking-widest' : ''}`}>{value}</p>
  </div>
);

export default StaffDetail;
