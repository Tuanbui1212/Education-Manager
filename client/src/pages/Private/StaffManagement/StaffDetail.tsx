import { useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar as CalendarIcon, Edit, ShieldCheck, Briefcase, KeyRound } from 'lucide-react';
import { formatDate, getStatusUserStyles } from '../../../utils/format.util';
import useFetch from '../../../hooks/useFetch';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import Button from '../../../components/Button';
import StaffModal from './StaffModal';
import ConfirmModal from '../../../components/ConfirmModal';
import type { IUser, IRole } from '../../../types/user.type';
import { STATUS_OPTIONS } from '../../../utils/constants';

const StaffDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: staff, loading, error, refetch: fetchStaff } = useFetch(userService.getUserById, id as string, [id]);

  // Lấy Roles để đưa vào Modal
  const { data: rolesData } = useFetch(roleService.getRoles, {}, []);
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];
  const officeRoles = roles.filter((r: any) => !['student', 'teacher'].includes(r.name?.toLowerCase()));

  const [showModalEdit, setShowModalEdit] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
  });

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải thông tin...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
  if (!staff) return <div className="p-8 text-center text-gray-500">Không tìm thấy hồ sơ nhân sự.</div>;

  const handleEditStaff = async (formData: Partial<IUser>) => {
    if (!staff?._id) return;
    const updateData = {
      fullName: formData.fullName,
      phone: formData.phone,
      date: formData.date,
      status: formData.status,
      roleId: formData.roleId,
    };
    try {
      const data = await userService.updateUser(staff._id, updateData);
      if (data.success) {
        setConfirmConfig({ isOpen: true, title: 'Thành công', message: 'Cập nhật hồ sơ thành công!', type: 'success' });
        fetchStaff();
        setShowModalEdit(false);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : null;
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: (detailError as string) || 'Có lỗi xảy ra!',
        type: 'danger',
      });
    }
  };

  const staffRole = staff.roleId as IRole;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {showModalEdit && (
        <StaffModal
          officeRoles={officeRoles}
          isOpen={showModalEdit}
          onClose={() => setShowModalEdit(false)}
          onSubmit={handleEditStaff}
          initialData={staff}
        />
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Đóng"
        cancelText=""
      />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
            title="Quay lại"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hồ sơ Nhân sự</h1>
            <p className="text-sm text-gray-500 mt-1">Chi tiết thông tin nhân viên khối văn phòng</p>
          </div>
        </div>
        <Button
          variant="primary"
          className="bg-violet-600 hover:bg-violet-700 border-violet-600"
          icon={<Edit size={18} />}
          onClick={() => setShowModalEdit(true)}
        >
          Chỉnh sửa hồ sơ
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* CỘT TRÁI */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-violet-500 to-fuchsia-600 opacity-10"></div>
            <div className="w-24 h-24 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md relative z-10 mt-4">
              {staff.fullName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-800 mt-4">{staff.fullName}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium mt-2 bg-slate-50 border border-slate-100 px-3 py-1 rounded-md">
              <Briefcase size={14} className="text-slate-400" />
              {staffRole?.name || 'N/A'}
            </div>
            <div className="mt-4">
              <span className={getStatusUserStyles(staff.status as string)}>
                {STATUS_OPTIONS.find((opt) => opt.value === staff.status)?.label || staff.status}
              </span>
            </div>

            <div className="w-full h-px bg-gray-100 my-6"></div>

            <div className="w-full space-y-4 text-left">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-violet-50 rounded-lg">
                  <Phone size={16} className="text-violet-500" />
                </div>
                <span className="font-medium">{staff.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-violet-50 rounded-lg">
                  <Mail size={16} className="text-violet-500" />
                </div>
                <span className="font-medium">{staff.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-violet-50 rounded-lg">
                  <CalendarIcon size={16} className="text-violet-500" />
                </div>
                <span>
                  Sinh ngày: <span className="font-medium">{formatDate(staff.date as string)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={22} className="text-violet-600" />
                <h3 className="text-lg font-bold text-gray-800">Quyền hạn hệ thống</h3>
              </div>
              <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
                {staffRole?.permissions?.length || 0} quyền
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Nhân viên này đang được cấp các quyền thao tác dựa trên chức vụ <strong>{staffRole?.name}</strong>. Dưới
                đây là các Module được phép truy cập:
              </p>

              {staffRole?.permissions && staffRole.permissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {staffRole.permissions.map((perm, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl"
                    >
                      <KeyRound size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-slate-700 break-all">{perm}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <ShieldCheck size={40} className="mb-3 opacity-20" />
                  <p className="text-sm">Chưa có quyền hạn nào được cấp.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetail;
