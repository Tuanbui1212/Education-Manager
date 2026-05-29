import { ArrowLeft, Edit2, Trash2, Copy, Lock, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/Button';
import type { IRole } from '../../../../types/role.type';
import { NAME_ROLES } from '../../../../utils/constants';

interface RoleDetailHeaderProps {
  role: IRole;
  onEdit: () => void;
  onDelete: () => void;
  onClone: () => void;
}

const RoleDetailHeader = ({ role, onEdit, onDelete, onClone }: RoleDetailHeaderProps) => {
  const navigate = useNavigate();
  const isSuperAdmin = role.name?.toLowerCase() === 'super admin';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Breadcrumb + Tiêu đề */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-xl transition-all duration-200"
          title="Quay lại danh sách"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
            Quản lý Vai trò &rsaquo; Chi tiết
          </p>
          <div className="flex items-center gap-2">
            {isSuperAdmin && <ShieldAlert size={18} className="text-orange-500" />}
            <h1 className="text-2xl font-bold text-gray-800">
              {NAME_ROLES.find((r) => r.value.toUpperCase() === role.name.toUpperCase())?.label || role.name}
            </h1>
            {isSuperAdmin && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full border border-orange-200">
                Bất khả xâm phạm
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Clone — luôn hiện */}
        <Button variant="outline" icon={<Copy size={16} />} onClick={onClone} className="rounded-xl text-sm">
          Nhân bản
        </Button>

        {/* Edit */}
        <Button
          variant="outline"
          icon={<Edit2 size={16} />}
          onClick={onEdit}
          className="rounded-xl text-sm text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          Chỉnh sửa
        </Button>

        {/* Delete hoặc khóa nếu Super Admin */}
        {isSuperAdmin ? (
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 border border-gray-200 rounded-xl cursor-not-allowed"
            title="Vai trò này không thể xóa"
          >
            <Lock size={16} />
            Xóa
          </button>
        ) : (
          <Button variant="danger" icon={<Trash2 size={16} />} onClick={onDelete} className="rounded-xl text-sm">
            Xóa
          </Button>
        )}
      </div>
    </div>
  );
};

export default RoleDetailHeader;
