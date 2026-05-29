import { useState } from 'react';
import { X, Shield, FileText } from 'lucide-react';
import Button from '../../../../components/Button';
import InputField from '../../../../components/InputField';

import type { IRole } from '../../../../types/role.type';

import { PERMISSION_LIST_UI } from '../../../../utils/permission.constant';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: IRole;
}

const RoleModal = ({ isOpen, onClose, onSubmit, initialData }: RoleModalProps) => {
  const [formData, setFormData] = useState<Partial<IRole>>(() => {
    if (initialData) {
      return {
        ...initialData,
        permissions: initialData.permissions || [],
      };
    }
    return {
      name: '',
      description: '',
      permissions: [],
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSuperAdmin = initialData?.name?.toLowerCase() === 'super admin';

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Vui lòng nhập tên vai trò';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof IRole, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: '' }));
    }
  };

  // Hàm xử lý khi check/uncheck quyền hạn
  const handleTogglePermission = (permissionCode: string) => {
    setFormData((prev) => {
      const currentPermissions = prev.permissions || [];
      const hasPermission = currentPermissions.includes(permissionCode);

      const newPermissions = hasPermission
        ? currentPermissions.filter((code) => code !== permissionCode)
        : [...currentPermissions, permissionCode];

      return { ...prev, permissions: newPermissions };
    });
  };

  // Chọn tất cả quyền (Lấy tất cả code từ các module gom thành 1 mảng)
  const handleSelectAll = () => {
    const allPermissionCodes = PERMISSION_LIST_UI.flatMap((module) => module.permissions.map((p) => p.code));
    setFormData((prev) => ({ ...prev, permissions: allPermissionCodes }));
  };

  // Bỏ chọn tất cả quyền
  const handleDeselectAll = () => {
    setFormData((prev) => ({ ...prev, permissions: [] }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-[var(--color-primary)] p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">{initialData ? 'Chỉnh sửa Phân quyền' : 'Thêm Vai trò mới'}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form
          className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validateForm()) return;
            onSubmit(formData);
          }}
        >
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Tên Vai Trò"
              icon={<Shield size={16} />}
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="Vd: Quản lý chi nhánh..."
              disabled={isSuperAdmin} // Không cho đổi tên Super Admin
              className={isSuperAdmin ? 'bg-stone-200 cursor-not-allowed' : ''}
              autoComplete="off"
            />

            <InputField
              label="Mô tả"
              icon={<FileText size={16} />}
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Nhập mô tả cho vai trò này..."
              autoComplete="off"
            />
          </div>

          <hr className="border-gray-100" />

          {/* Cấu hình phân quyền */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cấp quyền truy cập hệ thống</label>
                <p className="text-xs text-gray-500">Chọn các chức năng mà vai trò này được phép sử dụng.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  disabled={isSuperAdmin}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 disabled:opacity-50"
                >
                  Chọn tất cả
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  disabled={isSuperAdmin}
                  className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline px-2 py-1 disabled:opacity-50"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>

            {/* RENDER DYNAMIC THEO TỪNG MODULE TỪ BACKEND */}
            <div className="space-y-6">
              {PERMISSION_LIST_UI.map((moduleGroup, index) => (
                <div key={index} className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h4 className="font-semibold text-blue-800 mb-3 border-b border-gray-200 pb-2">
                    {moduleGroup.module}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {moduleGroup.permissions.map((permission) => {
                      const isChecked = formData.permissions?.includes(permission.code) || isSuperAdmin;

                      return (
                        <label
                          key={permission.code}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${isChecked
                              ? 'bg-white border-blue-300 shadow-sm'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                            } ${isSuperAdmin ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={isChecked}
                            disabled={isSuperAdmin}
                            onChange={() => handleTogglePermission(permission.code)}
                          />
                          <span className={`text-sm ${isChecked ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                            {permission.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nút Submit */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} type="button">
              Hủy
            </Button>
            {!isSuperAdmin && (
              <Button variant="primary" className="flex-1 rounded-xl" type="submit">
                {initialData ? 'Lưu thay đổi' : 'Tạo Vai Trò'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;
