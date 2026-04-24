import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { PERMISSION_LIST_UI } from '../../../utils/permission.constant';
import type { IRole } from '../../../types/role.type';

interface RolePermissionListProps {
  role: IRole;
}

const RolePermissionList = ({ role }: RolePermissionListProps) => {
  const isSuperAdmin = role.name?.toLowerCase() === 'super admin';
  const grantedPermissions = new Set(role.permissions || []);

  const totalPermissions = PERMISSION_LIST_UI.flatMap((m) => m.permissions).length;
  const grantedCount = isSuperAdmin ? totalPermissions : grantedPermissions.size;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          <h2 className="text-base font-bold text-gray-700">Danh sách quyền truy cập</h2>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-green-500" />
            Được cấp:
            <strong className="text-green-600">{grantedCount}</strong>
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1.5">
            <XCircle size={13} className="text-gray-300" />
            Không có:
            <strong className="text-gray-500">{totalPermissions - grantedCount}</strong>
          </span>
          <span className="text-gray-300">|</span>
          <span>
            Tổng: <strong>{totalPermissions}</strong>
          </span>
        </div>
      </div>

      {/* Super Admin banner */}
      {isSuperAdmin && (
        <div className="mb-5 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700 font-medium flex items-center gap-2">
          <ShieldCheck size={16} />
          Vai trò Super Admin có toàn quyền truy cập tất cả chức năng trong hệ thống.
        </div>
      )}

      {/* Modules */}
      <div className="space-y-5">
        {PERMISSION_LIST_UI.map((moduleGroup, index) => {
          const moduleGrantedCount = isSuperAdmin
            ? moduleGroup.permissions.length
            : moduleGroup.permissions.filter((p) => grantedPermissions.has(p.code)).length;

          const allGranted = moduleGrantedCount === moduleGroup.permissions.length;

          return (
            <div key={index} className="border border-gray-100 rounded-xl overflow-hidden">
              {/* Module header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h4 className="text-sm font-bold text-blue-800">{moduleGroup.module}</h4>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    allGranted
                      ? 'bg-green-100 text-green-700'
                      : moduleGrantedCount > 0
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {moduleGrantedCount}/{moduleGroup.permissions.length}
                </span>
              </div>

              {/* Permissions grid */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {moduleGroup.permissions.map((permission) => {
                  const isGranted = isSuperAdmin || grantedPermissions.has(permission.code);

                  return (
                    <div
                      key={permission.code}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                        isGranted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 opacity-60'
                      }`}
                    >
                      {isGranted ? (
                        <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                      ) : (
                        <XCircle size={15} className="text-gray-300 shrink-0" />
                      )}
                      <span className={`text-sm ${isGranted ? 'font-semibold text-gray-800' : 'text-gray-400'}`}>
                        {permission.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RolePermissionList;
