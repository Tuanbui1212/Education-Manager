import { useState } from 'react';
import { Plus, Edit2, Trash2, Lock, ShieldAlert } from 'lucide-react';
import { formatDate } from '../../../utils/format.util';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';

import RoleModal from './RoleModal';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';
import { roleService } from '../../../services/role.service';

import type { IRole } from '../../../types/role.type';

const RoleManager = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);

  const debouncedSearch = useDebounce(searchInput, 500);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
    action: () => {},
  });

  const queryParams = {
    page,
    limit,
    search: debouncedSearch,
  };

  const {
    data: roles,
    loading,
    error,
    totalCount,
    refetch: fetchRoles,
  } = useFetch(roleService.getRoles, queryParams, [page, debouncedSearch, limit]);

  const sortedRoles = roles?.sort((a: any, b: any) => {
    const isASuperAdmin = a.name?.toLowerCase() === 'super admin';
    const isBSuperAdmin = b.name?.toLowerCase() === 'super admin';

    if (isASuperAdmin && !isBSuperAdmin) return -1;
    if (!isASuperAdmin && isBSuperAdmin) return 1;
    return 0;
  });

  const handleAddRole = async (formData: Partial<IRole>) => {
    try {
      const data: any = await roleService.createRole(formData);
      if (data.success) {
        setConfirmConfig({
          ...confirmConfig,
          isOpen: true,
          title: 'Thông báo',
          message: data.message || 'Thêm vai trò thành công!',
          type: 'success',
        });
        fetchRoles();
        setShowModalAdd(false);
        setPage(1);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : null;
      setConfirmConfig({
        ...confirmConfig,
        isOpen: true,
        title: 'Lỗi',
        message: (detailError as string) || 'Có lỗi xảy ra khi thêm mới!',
        type: 'danger',
      });
    }
  };

  const handleEditRole = async (formData: Partial<IRole>) => {
    if (!selectedRole?._id) return;

    try {
      const data: any = await roleService.updateRole(selectedRole._id, formData);
      if (data.success) {
        setConfirmConfig({
          ...confirmConfig,
          isOpen: true,
          title: 'Thông báo',
          message: data.message || 'Cập nhật thành công!',
          type: 'success',
        });
        fetchRoles();
        setShowModalAdd(false);
        setSelectedRole(null);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : null;
      setConfirmConfig({
        ...confirmConfig,
        isOpen: true,
        title: 'Lỗi',
        message: (detailError as string) || 'Có lỗi xảy ra khi thay đổi!',
        type: 'danger',
      });
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      const data: any = await roleService.deleteRole(id);
      if (data.success) {
        setConfirmConfig({
          ...confirmConfig,
          isOpen: true,
          title: 'Thông báo',
          message: 'Xóa vai trò thành công!',
          type: 'success',
        });
        fetchRoles();
      }
    } catch (error: any) {
      setConfirmConfig({
        ...confirmConfig,
        isOpen: true,
        title: 'Lỗi',
        message: error.response?.data?.message || 'Không thể xóa vai trò này!',
        type: 'danger',
      });
    }
  };

  const openDeleteConfirm = (role: IRole) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa vai trò "${role.name}" không? Hành động này không thể hoàn tác.`,
      type: 'warning',
      action: () => handleDeleteRole(role._id!),
    });
  };

  const openEditModal = async (role: IRole) => {
    try {
      const response = await roleService.getRoleById(role._id!);

      if (response.success) {
        setSelectedRole(response.data);
        setShowModalAdd(true);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin vai trò:', error);
    }
  };

  const totalPages = Math.ceil((totalCount || 0) / limit);

  if (error) return <div className="p-8 text-red-500 text-center">Lỗi: {error}</div>;

  return (
    <div className="p-8 w-full">
      {showModalAdd && (
        <RoleModal
          isOpen={showModalAdd}
          onClose={() => {
            setShowModalAdd(false);
            setSelectedRole(null);
          }}
          onSubmit={selectedRole?._id ? handleEditRole : handleAddRole}
          initialData={selectedRole || undefined}
        />
      )}

      <PageHeader title="Quản lý Vai trò & Phân quyền" />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={() => {
          if (confirmConfig.type === 'warning') {
            confirmConfig.action();
          }
          setConfirmConfig({ ...confirmConfig, isOpen: false });
        }}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText={confirmConfig.type === 'warning' ? 'Xóa' : 'Đóng'}
        cancelText={confirmConfig.type === 'warning' ? 'Hủy' : ''}
      />

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex gap-4 items-center flex-1 max-w-sm">
          <SearchInput
            type="text"
            placeholder="Tìm kiếm tên vai trò..."
            value={searchInput}
            setSearchInput={setSearchInput}
            setPage={setPage}
          />
        </div>

        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => {
            setSelectedRole(null);
            setShowModalAdd(true);
          }}
        >
          Thêm Vai trò
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm sticky top-0 z-10">
              <th className="p-4 font-semibold w-16 text-center rounded-tl-xl">No.</th>
              <th className="p-4 font-semibold">Tên Vai Trò</th>
              <th className="p-4 font-semibold">Mô tả</th>
              <th className="p-4 font-semibold text-center">Số lượng Quyền</th>
              <th className="p-4 font-semibold">Ngày tạo</th>
              <th className="p-4 font-semibold text-center rounded-tr-xl">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedRoles && sortedRoles.length > 0 ? (
              sortedRoles.map((role: any, index: number) => {
                // TÍNH NĂNG KHÓA SUPER ADMIN: Bất khả xâm phạm
                const isSuperAdmin = role.name?.toLowerCase() === 'super admin';

                return (
                  <tr key={role._id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="p-4 text-text-secondary font-medium text-center">
                      {index + 1 + (page - 1) * limit}
                    </td>
                    <td className="p-4 font-semibold text-blue-600">
                      <div className="flex items-center gap-2">
                        {isSuperAdmin && <ShieldAlert size={16} className="text-orange-500" />}
                        {role.name}
                      </div>
                    </td>
                    <td className="p-4 text-text-main text-sm max-w-xs truncate">
                      {role.description || 'Không có mô tả'}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-xs">
                        {role.permissions?.length || 0} quyền
                      </span>
                    </td>
                    <td className="p-4 text-text-main text-sm">
                      {role.createdAt ? formatDate(role.createdAt) : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(role)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
                          title="Sửa"
                        >
                          <Edit2 size={18} />
                        </button>

                        {/* KIỂM TRA SUPER ADMIN ĐỂ HIỂN THỊ NÚT XÓA HOẶC KHÓA */}
                        {isSuperAdmin ? (
                          <button
                            disabled
                            className="p-2 text-gray-300 cursor-not-allowed rounded-xl"
                            title="Vai trò này không thể xóa"
                          >
                            <Lock size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => openDeleteConfirm(role)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : !loading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500">
                  Không tìm thấy vai trò nào.
                </td>
              </tr>
            ) : (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="p-8 bg-gray-50/50"></td>
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

export default RoleManager;
