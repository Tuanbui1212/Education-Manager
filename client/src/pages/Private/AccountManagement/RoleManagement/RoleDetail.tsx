import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import ConfirmModal from '../../../../components/ConfirmModal';
import RoleModal from './RoleModal';

import RoleDetailHeader from './RoleDetailHeader';
import RoleDetailInfo from './RoleDetailInfo';
import RolePermissionList from './RolePermissionList';

import useFetch from '../../../../hooks/useFetch';
import { roleService } from '../../../../services/role.service';

import type { IRole } from '../../../../types/role.type';

const RoleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
    action: () => { },
  });

  // Fetch role detail
  const { data: role, loading, error, refetch: fetchRole } = useFetch(() => roleService.getRoleById(id!), {}, [id]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleEdit = async (formData: Partial<IRole>) => {
    if (!id) return;
    try {
      const data: any = await roleService.updateRole(id, formData);
      if (data.success) {
        setConfirmConfig({
          ...confirmConfig,
          isOpen: true,
          title: 'Thông báo',
          message: data.message || 'Cập nhật vai trò thành công!',
          type: 'success',
        });
        fetchRole();
        setShowEditModal(false);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : null;
      setConfirmConfig({
        ...confirmConfig,
        isOpen: true,
        title: 'Lỗi',
        message: (detailError as string) || 'Có lỗi xảy ra khi cập nhật!',
        type: 'danger',
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      const data: any = await roleService.deleteRole(id);
      if (data.success) {
        // Thông báo rồi điều hướng về danh sách
        setConfirmConfig({
          isOpen: true,
          title: 'Thông báo',
          message: 'Đã xóa vai trò thành công!',
          type: 'success',
          action: () => navigate(-1),
        });
        navigate(-1);
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

  const openDeleteConfirm = () => {
    if (!role) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa vai trò "${role.name}" không? Hành động này không thể hoàn tác.`,
      type: 'warning',
      action: handleDelete,
    });
  };

  const handleClone = async () => {
    if (!role) return;
    try {
      const cloneData: Partial<IRole> = {
        name: `${role.name} (Bản sao)`,
        description: role.description,
        permissions: role.permissions,
      };
      const data: any = await roleService.createRole(cloneData);
      if (data.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thông báo',
          message: `Đã nhân bản thành công! Vai trò mới: "${cloneData.name}"`,
          type: 'success',
          action: () => { },
        });
      }
    } catch (error: any) {
      setConfirmConfig({
        ...confirmConfig,
        isOpen: true,
        title: 'Lỗi',
        message: error.response?.data?.message || 'Có lỗi xảy ra khi nhân bản!',
        type: 'danger',
      });
    }
  };

  // ─── Render states ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-8 w-full space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse h-10 bg-gray-100 rounded-xl w-1/3" />
        {/* Info card skeleton */}
        <div className="animate-pulse bg-white rounded-xl border border-gray-200 p-6 grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
          ))}
        </div>
        {/* Permission list skeleton */}
        <div className="animate-pulse bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="p-8 w-full flex flex-col items-center justify-center gap-3 text-gray-500">
        <p className="text-red-500 font-medium">Không thể tải thông tin vai trò.</p>
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────────

  return (
    <div className="p-8 w-full">
      {/* Edit Modal */}
      {showEditModal && (
        <RoleModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEdit}
          initialData={role}
        />
      )}

      {/* Confirm Modal (delete / success / error) */}
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

      {/* Header */}
      <RoleDetailHeader
        role={role}
        onEdit={() => setShowEditModal(true)}
        onDelete={openDeleteConfirm}
        onClone={handleClone}
      />

      {/* Info card */}
      <RoleDetailInfo role={role} />

      {/* Permissions */}
      <RolePermissionList role={role} />
    </div>
  );
};

export default RoleDetail;
