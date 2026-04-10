import { Plus, Edit2, Trash2, Mail, Phone, Briefcase, Filter, Shield } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';
import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';

import { formatDate, getStatusUserStyles, translateRole } from '../../../utils/format.util';
import { PATHS, STATUS_USER_OPTIONS } from '../../../utils/constants';

const StaffManager = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [openStatus, setOpenStatus] = useState(false);
  const [openRole, setOpenRole] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 500);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
  });

  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger' as 'success' | 'danger' | 'warning' | 'info',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
  });

  const { data: rolesData } = useFetch(roleService.getRoles, {}, []);
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];

  const officeRoles = useMemo(
    () => roles.filter((r: any) => !['student', 'teacher', 'potential', 'super admin'].includes(r.name?.toLowerCase())),
    [roles],
  );

  const queryParams: any = {
    page,
    limit,
    search: debouncedSearch,
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(roleFilter && { roleId: roleFilter }),
  };

  const {
    data: staffs,
    loading,
    error,
    totalCount,
    refetch: fetchStaffs,
  } = useFetch(userService.getStaff, queryParams, [page, debouncedSearch, roleFilter, limit, statusFilter]);

  // ─── Xóa nhân sự ──────────────────────────────────────────────────────────
  const handleDeleteStaff = async (id: string) => {
    try {
      const data = await userService.deleteUser(id);
      if (data.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          message: data.message || 'Xóa hồ sơ thành công!',
          type: 'success',
        });
        fetchStaffs();
        setPage(1);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat() : null;
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: (detailError?.[0] as string) || 'Có lỗi xảy ra khi xóa!',
        type: 'danger',
      });
    }
  };

  const totalPages = Math.ceil((totalCount || 0) / limit);

  if (error) return <div className="p-8 text-red-500 text-center">Lỗi: {error}</div>;

  return (
    <div className="p-8 w-full">
      <PageHeader title="Quản lý Nhân sự (Phòng ban / Văn phòng)" />

      {/* Modal thông báo */}
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

      {/* Modal xác nhận xóa */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={confirmDelete.onConfirm}
        title={confirmDelete.title}
        message={confirmDelete.message}
        type={confirmDelete.type}
        confirmText={confirmDelete.confirmText}
        cancelText={confirmDelete.cancelText}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex gap-4 items-center flex-1 max-w-[800px]">
          <SearchInput
            type="text"
            placeholder="Tìm kiếm tên, email, sđt nhân sự..."
            value={searchInput}
            setSearchInput={setSearchInput}
            setPage={setPage}
          />

          <div className="flex items-center gap-3">
            {/* Lọc theo Chức vụ */}
            <div className="relative inline-block w-48">
              <Button
                variant="outline"
                icon={<Shield size={18} />}
                onClick={() => {
                  setOpenRole(!openRole);
                  setOpenStatus(false);
                }}
              >
                <span className="truncate max-w-[120px]">
                  {roleFilter === ''
                    ? 'Tất cả phòng ban'
                    : officeRoles.find((r: any) => r._id === roleFilter)?.name || 'Phòng ban'}
                </span>
              </Button>
              {openRole && (
                <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <div
                    onClick={() => {
                      setRoleFilter('');
                      setPage(1);
                      setOpenRole(false);
                    }}
                    className={`px-4 py-2 hover:bg-violet-50 cursor-pointer text-sm transition-colors ${roleFilter === '' ? 'bg-violet-50 font-semibold text-violet-700' : 'text-gray-700'}`}
                  >
                    Tất cả phòng ban
                  </div>
                  {officeRoles.map((role: any) => (
                    <div
                      key={role._id}
                      onClick={() => {
                        setRoleFilter(role._id);
                        setPage(1);
                        setOpenRole(false);
                      }}
                      className={`px-4 py-2 hover:bg-violet-50 cursor-pointer text-sm transition-colors ${roleFilter === role._id ? 'bg-violet-50 font-semibold text-violet-700' : 'text-gray-700'}`}
                    >
                      {role.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lọc theo Trạng thái */}
            <div className="relative inline-block w-44">
              <Button
                variant="outline"
                icon={<Filter size={18} />}
                onClick={() => {
                  setOpenStatus(!openStatus);
                  setOpenRole(false);
                }}
              >
                Trạng thái
              </Button>
              {openStatus && (
                <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  {STATUS_USER_OPTIONS.map((option: any) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setPage(1);
                        setOpenStatus(false);
                      }}
                      className={`px-4 py-2 hover:bg-violet-50 cursor-pointer text-sm transition-colors ${statusFilter === option.value ? 'bg-violet-50 font-semibold text-violet-700' : 'text-gray-700'}`}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nút thêm mới — điều hướng sang StaffForm */}
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate(PATHS.HR_STAFFS_CREATE)}>
          Thêm Nhân sự
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm sticky top-0 z-10">
              <th className="p-4 font-semibold w-16 text-center">No.</th>
              <th className="p-4 font-semibold">Thông tin Nhân sự</th>
              <th className="p-4 font-semibold">Liên hệ</th>
              <th className="p-4 font-semibold">Phòng ban / Chức vụ</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staffs && staffs.length > 0 ? (
              staffs.map((staff: any, index: number) => {
                const roleName = (staff.roleId as any)?.name || 'N/A';
                return (
                  <tr key={staff._id} className="hover:bg-violet-50/50 transition-colors group">
                    <td className="p-4 text-gray-500 font-medium text-center">{index + 1 + (page - 1) * limit}</td>
                    <td className="p-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate(PATHS.HR_STAFFS_ID.replace(':id', staff._id || ''))}
                      >
                        <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold shrink-0">
                          {staff.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-violet-700 group-hover:underline">{staff.fullName}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{formatDate(staff.date as string)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          <span>{staff.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          <span>{staff.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 w-fit px-2.5 py-1 rounded-md font-medium border border-slate-200">
                        <Briefcase size={14} className="text-slate-500" />
                        <span>{translateRole(roleName) || roleName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={getStatusUserStyles(staff.status as string)}>
                        {STATUS_USER_OPTIONS.find((opt: any) => opt.value === staff.status)?.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => navigate(PATHS.HR_STAFFS_EDIT.replace(':id', staff._id!))}
                          className="p-2 text-violet-600 hover:bg-violet-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
                          title="Sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        {/* Nút xóa */}
                        <button
                          onClick={() => {
                            setConfirmDelete({
                              isOpen: true,
                              title: 'Xác nhận xóa',
                              message: `Bạn có chắc chắn muốn xóa hồ sơ của ${staff.fullName}?`,
                              type: 'danger',
                              confirmText: 'Xác nhận',
                              cancelText: 'Hủy',
                              onConfirm: () => {
                                setConfirmDelete((prev) => ({ ...prev, isOpen: false }));
                                handleDeleteStaff(staff._id);
                              },
                            });
                          }}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : !loading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500">
                  Không tìm thấy nhân sự nào.
                </td>
              </tr>
            ) : (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="p-8 bg-gray-50/50" />
                </tr>
              ))
            )}
          </tbody>
        </table>
        <TablePagination totalPages={totalPages} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
      </div>
    </div>
  );
};

export default StaffManager;
