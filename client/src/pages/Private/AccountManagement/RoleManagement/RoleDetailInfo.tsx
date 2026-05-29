import { Shield, FileText, Calendar, Key } from 'lucide-react';
import { formatDate } from '../../../../utils/format.util';
import type { IRole } from '../../../../types/role.type';

interface RoleDetailInfoProps {
  role: IRole;
}

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
    <div className="p-2 bg-white rounded-lg border border-gray-200 text-primary shadow-sm">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <div className="text-sm font-semibold text-gray-800 break-words">{value}</div>
    </div>
  </div>
);

const RoleDetailInfo = ({ role }: RoleDetailInfoProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
        <Shield size={16} className="text-primary" />
        Thông tin vai trò
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoItem icon={<Shield size={16} />} label="Tên vai trò" value={role.name} />
        <InfoItem
          icon={<FileText size={16} />}
          label="Mô tả"
          value={
            role.description ? (
              role.description
            ) : (
              <span className="text-gray-400 italic font-normal">Không có mô tả</span>
            )
          }
        />
        <InfoItem
          icon={<Key size={16} />}
          label="Số quyền"
          value={
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              {role.permissions?.length || 0} quyền
            </span>
          }
        />
        <InfoItem
          icon={<Calendar size={16} />}
          label="Ngày tạo"
          value={role.createdAt ? formatDate(role.createdAt) : 'N/A'}
        />
      </div>
    </div>
  );
};

export default RoleDetailInfo;
