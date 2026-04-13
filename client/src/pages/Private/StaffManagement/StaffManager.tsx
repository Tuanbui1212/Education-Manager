import {
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  Filter,
  Shield,
  Users,
  UserCheck,
  UserX,
  ChevronDown,
  X,
  RefreshCw,
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';
import StatCard from '../../../components/StatCard';
import SkeletonRow from '../../../components/SkeletonRow';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';
import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';

import { formatDate, getStatusUserStyles, translateRole } from '../../../utils/format.util';
import { PATHS, STATUS_USER_OPTIONS } from '../../../utils/constants';

// ─── Avatar helpers ───────────────────────────────────────────────────────────
const PALETTE = [
  { bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-200' },
  { bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-200' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', ring: 'ring-fuchsia-200' },
  { bg: 'bg-sky-100', text: 'text-sky-700', ring: 'ring-sky-200' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' },
];
const getColor = (s: string) => PALETTE[(s || ' ').charCodeAt(0) % PALETTE.length];
const getInitials = (name: string) => {
  const p = (name || '').trim().split(' ').filter(Boolean);
  return p.length < 2 ? (p[0]?.[0] ?? '?').toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ isFiltered, onReset }: { isFiltered: boolean; onReset: () => void }) => (
  <tr>
    <td colSpan={6}>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-3xl bg-violet-50 flex items-center justify-center">
            <Briefcase size={34} className="text-violet-300" />
          </div>
          {isFiltered && (
            <div
              className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full
              flex items-center justify-center"
            >
              <Filter size={11} className="text-white" />
            </div>
          )}
        </div>
        <p className="font-bold text-gray-600 text-base">
          {isFiltered ? 'Không có kết quả phù hợp' : 'Chưa có nhân sự nào'}
        </p>
        <p className="text-sm text-gray-400 mt-1.5 text-center max-w-xs leading-relaxed">
          {isFiltered
            ? 'Thử thay đổi từ khoá, phòng ban hoặc trạng thái.'
            : 'Bắt đầu bằng cách thêm nhân sự đầu tiên vào hệ thống.'}
        </p>
        {isFiltered && (
          <button
            onClick={onReset}
            className="mt-4 px-4 py-1.5 text-sm text-violet-600 bg-violet-50
              hover:bg-violet-100 rounded-xl font-medium transition-colors
              flex items-center gap-1.5"
          >
            <X size={13} /> Xóa bộ lọc
          </button>
        )}
      </div>
    </td>
  </tr>
);

// ─── Filter Button ────────────────────────────────────────────────────────────
interface FilterBtnProps {
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  accentColor: string;
  onToggle: () => void;
  onClear: () => void;
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
}
const FilterBtn = ({
  isActive,
  label,
  icon,
  isOpen,
  accentColor,
  onToggle,
  onClear,
  children,
  containerRef,
}: FilterBtnProps) => (
  <div className="relative shrink-0" ref={containerRef}>
    <button
      type="button"
      onClick={onToggle}
      className={`
        flex items-center gap-2 pl-3.5 pr-3 py-2 rounded-xl border text-sm font-medium
        transition-all whitespace-nowrap
        ${
          isActive
            ? `bg-primary text-white border-transparent shadow-md shadow-primary/30`
            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <span className={isActive ? 'text-white/80' : 'text-gray-400'}>{icon}</span>
      {label}
      {isActive ? (
        <X
          size={13}
          className="ml-0.5 opacity-80 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        />
      ) : (
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      )}
    </button>
    {isOpen && (
      <div
        className="absolute top-[calc(100%+6px)] right-0 min-w-[190px] bg-white
        border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5"
      >
        {children}
      </div>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const StaffManager = () => {
  const navigate = useNavigate();

  const statusFilterRef = useRef<HTMLDivElement>(null);
  const roleFilterRef = useRef<HTMLDivElement>(null);

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

  // ── Click-outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (statusFilterRef.current && !statusFilterRef.current.contains(e.target as Node)) setOpenStatus(false);
      if (roleFilterRef.current && !roleFilterRef.current.contains(e.target as Node)) setOpenRole(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Roles ─────────────────────────────────────────────────────────────────
  const { data: rolesData } = useFetch(roleService.getRoles, {}, []);
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];
  const officeRoles = useMemo(
    () => roles.filter((r: any) => !['student', 'teacher', 'potential', 'super admin'].includes(r.name?.toLowerCase())),
    [roles],
  );

  // ── Staffs ────────────────────────────────────────────────────────────────
  const {
    data: staffs,
    loading,
    error,
    totalCount,
    refetch: fetchStaffs,
  } = useFetch(
    userService.getStaff,
    {
      page,
      limit,
      search: debouncedSearch,
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
      ...(roleFilter && { roleId: roleFilter }),
    },
    [page, debouncedSearch, roleFilter, limit, statusFilter],
  );

  // ── Stats counts ──────────────────────────────────────────────────────────
  const { totalCount: countAll } = useFetch(userService.getStaff, { limit: 1, page: 1 }, []);
  const { totalCount: countActive } = useFetch(userService.getStaff, { status: 'ACTIVE', limit: 1, page: 1 }, []);
  const { totalCount: countInactive } = useFetch(userService.getStaff, { status: 'INACTIVE', limit: 1, page: 1 }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
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
  const isFiltered = !!debouncedSearch || statusFilter !== 'ALL' || !!roleFilter;
  const handleReset = () => {
    setSearchInput('');
    setStatusFilter('ALL');
    setRoleFilter('');
    setPage(1);
  };
  const activeRoleName = roleFilter ? (officeRoles.find((r: any) => r._id === roleFilter)?.name ?? 'Phòng ban') : '';
  const activeStatusLabel = STATUS_USER_OPTIONS.find((o: any) => o.value === statusFilter)?.label ?? '';
  const fromItem = (page - 1) * limit + 1;
  const toItem = Math.min(page * limit, totalCount ?? 0);

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error)
    return (
      <div className="p-16 flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
          <X size={26} className="text-red-400" />
        </div>
        <p className="font-semibold text-red-500">Không thể tải dữ liệu</p>
        <p className="text-xs text-gray-400 max-w-xs">{String(error)}</p>
        <button
          onClick={fetchStaffs}
          className="mt-2 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200
            rounded-xl text-sm font-medium text-gray-600 hover:border-gray-400 transition-colors"
        >
          <RefreshCw size={14} /> Thử lại
        </button>
      </div>
    );

  return (
    <div className="p-6 lg:p-8 w-full space-y-6">
      <PageHeader title="Quản lý Nhân sự" />

      {/* ── Modals ── */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((p) => ({ ...p, isOpen: false }))}
        onConfirm={() => setConfirmConfig((p) => ({ ...p, isOpen: false }))}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Đóng"
        cancelText=""
      />
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete((p) => ({ ...p, isOpen: false }))}
        onConfirm={confirmDelete.onConfirm}
        title={confirmDelete.title}
        message={confirmDelete.message}
        type={confirmDelete.type}
        confirmText={confirmDelete.confirmText}
        cancelText={confirmDelete.cancelText}
      />

      {/* ══ Stats Bar ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          icon={<Users size={20} />}
          label="Tổng nhân sự"
          value={countAll ?? '—'}
          gradient="bg-gradient-to-br from-slate-600 to-slate-800"
          textColor="text-slate-600"
          active={statusFilter === 'ALL' && !roleFilter && !debouncedSearch}
          onClick={handleReset}
        />
        <StatCard
          icon={<UserCheck size={20} />}
          label="Đang làm việc"
          value={countActive ?? '—'}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          textColor="text-violet-600"
          active={statusFilter === 'ACTIVE'}
          onClick={() => {
            setStatusFilter('ACTIVE');
            setRoleFilter('');
            setPage(1);
          }}
        />
        <StatCard
          icon={<UserX size={20} />}
          label="Đã nghỉ việc"
          value={countInactive ?? '—'}
          gradient="bg-gradient-to-br from-gray-400 to-gray-600"
          textColor="text-gray-500"
          active={statusFilter === 'INACTIVE'}
          onClick={() => {
            setStatusFilter('INACTIVE');
            setRoleFilter('');
            setPage(1);
          }}
        />
      </div>

      {/* ══ Toolbar ════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex gap-3 items-center flex-1 min-w-0 max-w-3xl flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              type="text"
              placeholder="Tìm kiếm tên, email, số điện thoại..."
              value={searchInput}
              setSearchInput={setSearchInput}
              setPage={setPage}
            />
          </div>

          {/* Filter: Phòng ban */}
          <FilterBtn
            isActive={!!roleFilter}
            label={activeRoleName || 'Phòng ban'}
            icon={<Shield size={15} />}
            isOpen={openRole}
            accentColor="violet"
            containerRef={roleFilterRef as React.RefObject<HTMLDivElement>}
            onToggle={() => {
              setOpenRole((o) => !o);
              setOpenStatus(false);
            }}
            onClear={() => {
              setRoleFilter('');
              setPage(1);
            }}
          >
            <div
              onClick={() => {
                setRoleFilter('');
                setPage(1);
                setOpenRole(false);
              }}
              className={`px-4 py-2.5 cursor-pointer text-sm transition-colors flex items-center gap-3
                ${!roleFilter ? 'bg-violet-50 text-violet-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
              Tất cả phòng ban
              {!roleFilter && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600" />}
            </div>
            {officeRoles.map((role: any) => (
              <div
                key={role._id}
                onClick={() => {
                  setRoleFilter(role._id);
                  setPage(1);
                  setOpenRole(false);
                }}
                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors flex items-center gap-3
                  ${
                    roleFilter === role._id
                      ? 'bg-violet-50 text-violet-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                {translateRole(role.name) || role.name}
                {roleFilter === role._id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600" />}
              </div>
            ))}
          </FilterBtn>

          {/* Filter: Trạng thái */}
          <FilterBtn
            isActive={statusFilter !== 'ALL'}
            label={statusFilter !== 'ALL' ? activeStatusLabel : 'Trạng thái'}
            icon={<Filter size={15} />}
            isOpen={openStatus}
            accentColor="violet"
            containerRef={statusFilterRef as React.RefObject<HTMLDivElement>}
            onToggle={() => {
              setOpenStatus((o) => !o);
              setOpenRole(false);
            }}
            onClear={() => {
              setStatusFilter('ALL');
              setPage(1);
            }}
          >
            {STATUS_USER_OPTIONS.map((opt: any) => (
              <div
                key={opt.value}
                onClick={() => {
                  setStatusFilter(opt.value);
                  setPage(1);
                  setOpenStatus(false);
                }}
                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors flex items-center gap-3
                  ${
                    statusFilter === opt.value
                      ? 'bg-violet-50 text-violet-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0
                  ${
                    opt.value === 'ACTIVE' ? 'bg-emerald-400' : opt.value === 'INACTIVE' ? 'bg-gray-400' : 'bg-gray-300'
                  }`}
                />
                {opt.label}
                {statusFilter === opt.value && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600" />}
              </div>
            ))}
          </FilterBtn>
        </div>

        <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate(PATHS.HR_STAFFS_CREATE)}>
          Thêm Nhân sự
        </Button>
      </div>

      {/* ══ Table Card ═════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Meta row */}
        {!loading && (totalCount ?? 0) > 0 && (
          <div
            className="flex items-center justify-between px-5 py-3
            border-b border-gray-100 bg-gray-50/60 flex-wrap gap-2"
          >
            <p className="text-xs text-gray-500">
              Hiển thị{' '}
              <span className="font-semibold text-gray-700">
                {fromItem}–{toItem}
              </span>{' '}
              trong <span className="font-semibold text-gray-700">{totalCount}</span> nhân sự
              {isFiltered && (
                <button onClick={handleReset} className="ml-2 text-violet-500 hover:underline">
                  xóa bộ lọc
                </button>
              )}
            </p>
            {/* Active filter badges */}
            {isFiltered && (
              <div className="flex items-center gap-2 flex-wrap">
                {activeRoleName && (
                  <span
                    className="text-xs px-2.5 py-1 bg-violet-50 text-violet-600
                    font-medium rounded-full flex items-center gap-1"
                  >
                    <Shield size={11} /> {translateRole(activeRoleName) || activeRoleName}
                  </span>
                )}
                {statusFilter !== 'ALL' && (
                  <span
                    className="text-xs px-2.5 py-1 bg-violet-50 text-violet-600
                    font-medium rounded-full flex items-center gap-1"
                  >
                    <Filter size={11} /> {activeStatusLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-primary text-white text-sm">
                <th className="px-5 py-3.5 font-semibold w-12 text-center">No.</th>
                <th className="px-5 py-3.5 font-semibold">Nhân sự</th>
                <th className="px-5 py-3.5 font-semibold">Liên hệ</th>
                <th className="px-5 py-3.5 font-semibold">Phòng ban / Chức vụ</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 font-semibold text-center">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: limit }).map((_, i) => <SkeletonRow key={i} />)
              ) : staffs && staffs.length > 0 ? (
                staffs.map((staff: any, index: number) => {
                  const color = getColor(staff.fullName);
                  const roleName = (staff.roleId as any)?.name || 'N/A';
                  return (
                    <tr key={staff._id} className="group hover:bg-violet-50/40 transition-colors">
                      {/* No. */}
                      <td className="px-5 py-4 text-gray-400 text-sm text-center font-medium">
                        {index + 1 + (page - 1) * limit}
                      </td>

                      {/* Avatar + tên + ngày sinh */}
                      <td className="px-5 py-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => navigate(PATHS.HR_STAFFS_ID.replace(':id', staff._id || ''))}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center
                            text-sm font-bold shrink-0 ring-2 select-none
                            ${color.bg} ${color.text} ${color.ring}`}
                          >
                            {getInitials(staff.fullName)}
                          </div>
                          <div className="min-w-0">
                            {/* ✅ Fix màu: gray-800 + hover violet thay vì violet-700 thường trực */}
                            <div
                              className="font-semibold text-gray-800
                              group-hover:text-violet-700 transition-colors truncate"
                            >
                              {staff.fullName}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">{formatDate(staff.date as string)}</div>
                          </div>
                        </div>
                      </td>

                      {/* Liên hệ */}
                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={13} className="text-gray-400 shrink-0" />
                            <span>{staff.phone || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail size={13} className="text-gray-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{staff.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phòng ban badge */}
                      <td className="px-5 py-4">
                        <div
                          className="inline-flex items-center gap-2 text-sm
                          text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg
                          font-medium border border-violet-100"
                        >
                          <Briefcase size={13} className="text-violet-400 shrink-0" />
                          <span>{translateRole(roleName) || roleName}</span>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-4">
                        <span className={getStatusUserStyles(staff.status as string)}>
                          {STATUS_USER_OPTIONS.find((opt: any) => opt.value === staff.status)?.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(PATHS.HR_STAFFS_EDIT.replace(':id', staff._id!))}
                            title="Chỉnh sửa"
                            className="p-2 text-violet-500 hover:bg-violet-50
                              hover:text-violet-700 rounded-xl transition-all
                              hover:scale-110 active:scale-95"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            title="Xóa"
                            onClick={() =>
                              setConfirmDelete({
                                isOpen: true,
                                title: 'Xác nhận xóa',
                                message: `Bạn có chắc muốn xóa hồ sơ của "${staff.fullName}"?`,
                                type: 'danger',
                                confirmText: 'Xóa',
                                cancelText: 'Hủy',
                                onConfirm: () => {
                                  setConfirmDelete((p) => ({ ...p, isOpen: false }));
                                  handleDeleteStaff(staff._id);
                                },
                              })
                            }
                            className="p-2 text-red-400 hover:bg-red-50
                              hover:text-red-600 rounded-xl transition-all
                              hover:scale-110 active:scale-95"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <EmptyState isFiltered={isFiltered} onReset={handleReset} />
              )}
            </tbody>
          </table>
        </div>

        <TablePagination totalPages={totalPages} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
      </div>
    </div>
  );
};

export default StaffManager;
