import { Plus, Edit2, Trash2, Users, UserCheck, UserX, ShieldCheck, ChevronDown, X, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { getRoleStyles, formatDate, translateRole } from '../../../../utils/format.util';
import { getColor, getInitials, genderLabel } from '../../../../utils/user.util';
import { PATHS } from '../../../../utils/constants';
import { PERMISSIONS } from '../../../../utils/permission.constant';

import Button from '../../../../components/Button';
import PageHeader from '../../../../components/PageHeader';
import TablePagination from '../../../../components/TablePagination';
import SearchInput from '../../../../components/SearchInput';
import ConfirmModal from '../../../../components/ConfirmModal';
import SkeletonRow from '../../../../components/SkeletonRow';
import StatCard from '../../../../components/StatCard';
import EmptyState from '../../../../components/EmptyState';

import useFetch from '../../../../hooks/useFetch';
import useDebounce from '../../../../hooks/useDebounce';

import { userService } from '../../../../services/user.service';
import { roleService } from '../../../../services/role.service';

import type { IUser } from '../../../../types/user.type';
import RequirePermission from '../../../../components/RequirePermission';

// ─── Main Component ───────────────────────────────────────────────────────────
const UserList = () => {
  const navigate = useNavigate();
  const roleFilterRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [role, setRole] = useState('');
  const [open, setOpen] = useState(false);
  const [userStatus, setUserStatus] = useState('');

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
    onConfirm: () => { },
  });

  // ── Click-outside dropdown ────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (roleFilterRef.current && !roleFilterRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Data ──────────────────────────────────────────────────────────────────
  const {
    data: users,
    loading,
    error,
    totalCount,
    refetch: fetchUsers,
  } = useFetch(userService.getUsers, { page, limit, search: debouncedSearch, roleId: role, status: userStatus }, [
    page,
    debouncedSearch,
    role,
    limit,
    userStatus,
  ]);

  const { data: rolesData } = useFetch(roleService.getRoles, {}, []);
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];

  // ── Stats counts ──────────────────────────────────────────────────────────
  const { totalCount: countAll } = useFetch(userService.getUsers, { limit: 1, page: 1 }, []);
  const { totalCount: countActive } = useFetch(userService.getUsers, { status: 'ACTIVE', limit: 1, page: 1 }, []);
  const { totalCount: countInactive } = useFetch(userService.getUsers, { status: 'INACTIVE', limit: 1, page: 1 }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteUser = async (id: string) => {
    try {
      const data = await userService.deleteUser(id);
      if (data.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          message: data.message || 'Đã xóa tài khoản thành công!',
          type: 'success',
        });
        fetchUsers();
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

  // ── Navigate to role-specific detail ─────────────────────────────────────
  const navigateToDetail = (user: any) => {
    if (!user?._id) return;
    const roleName = (user.roleId?.name || '').toLowerCase();
    if (roleName === 'student') {
      navigate(PATHS.TRAINING_STUDENT_ID.replace(':id', user._id));
    } else if (roleName === 'teacher') {
      navigate(PATHS.HR_TEACHERS_ID.replace(':id', user._id));
    } else {
      navigate(PATHS.HR_STAFFS_ID.replace(':id', user._id));
    }
  };

  const totalPages = Math.ceil((totalCount || 0) / limit);
  const isFiltered = !!debouncedSearch || !!role || !!userStatus;
  const handleReset = () => {
    setSearchInput('');
    setRole('');
    setUserStatus('');
    setPage(1);
  };
  const activeRoleName = role ? (roles.find((r: any) => r._id === role)?.name ?? '') : '';
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
          onClick={fetchUsers}
          className="mt-2 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200
            rounded-xl text-sm font-medium text-gray-600 hover:border-gray-400 transition-colors"
        >
          <RefreshCw size={14} /> Thử lại
        </button>
      </div>
    );

  return (
    <div className="p-6 lg:p-8 w-full space-y-6">
      <PageHeader title="Danh sách Tất cả Tài khoản" />

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
          label="Tổng tài khoản"
          value={countAll ?? '—'}
          gradient="bg-gradient-to-br from-slate-600 to-slate-800"
          textColor="text-slate-600"
          active={userStatus === ''}
          onClick={handleReset}
        />
        <StatCard
          icon={<UserCheck size={20} />}
          label="Đang hoạt động"
          value={countActive ?? '—'}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          textColor="text-blue-600"
          active={userStatus === 'ACTIVE'}
          onClick={() => {
            setUserStatus('ACTIVE');
            setPage(1);
          }}
        />
        <StatCard
          icon={<UserX size={20} />}
          label="Ngừng hoạt động"
          value={countInactive ?? '—'}
          gradient="bg-gradient-to-br from-gray-400 to-gray-600"
          textColor="text-gray-500"
          active={userStatus === 'INACTIVE'}
          onClick={() => {
            setUserStatus('INACTIVE');
            setPage(1);
          }}
        />
      </div>

      {/* ══ Toolbar ════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex gap-3 items-center flex-1 min-w-0 max-w-2xl">
          <div className="flex-1 min-w-0">
            <SearchInput
              type="text"
              placeholder="Tìm kiếm tên, email, số điện thoại..."
              value={searchInput}
              setSearchInput={setSearchInput}
              setPage={setPage}
            />
          </div>

          {/* Filter: Vai trò */}
          <div className="relative shrink-0" ref={roleFilterRef}>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className={`
                flex items-center gap-2 pl-3.5 pr-3 py-2 rounded-xl border text-sm font-medium
                transition-all whitespace-nowrap
                ${role
                  ? 'bg-primary text-white border-transparent shadow-md shadow-primary/30'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <ShieldCheck size={15} className={role ? 'text-white/80' : 'text-gray-400'} />
              {role ? translateRole(activeRoleName) || activeRoleName : 'Vai trò'}
              {role ? (
                <X
                  size={13}
                  className="ml-0.5 opacity-80 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRole('');
                    setPage(1);
                  }}
                />
              ) : (
                <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
              )}
            </button>

            {open && (
              <div
                className="absolute top-[calc(100%+6px)] right-0 min-w-[190px] bg-white
                border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5"
              >
                {/* Tất cả */}
                <div
                  onClick={() => {
                    setRole('');
                    setPage(1);
                    setOpen(false);
                  }}
                  className={`px-4 py-2.5 cursor-pointer text-sm transition-colors flex items-center gap-3
                    ${!role ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
                  Tất cả vai trò
                  {!role && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </div>
                {roles.map((item: any) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      setRole(item._id);
                      setPage(1);
                      setOpen(false);
                    }}
                    className={`px-4 py-2.5 cursor-pointer text-sm transition-colors flex items-center gap-3
                      ${role === item._id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${getRoleStyles(item.name).split(' ')[0].replace('bg-', 'bg-') || 'bg-gray-400'}`}
                    />
                    {(translateRole(item.name) as string) || item.name}
                    {role === item._id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <RequirePermission required={[PERMISSIONS.USER.CREATE]}>
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate(PATHS.ACCOUNT_USERS_CREATE)}>
            Thêm Người dùng
          </Button>
        </RequirePermission>
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
              trong <span className="font-semibold text-gray-700">{totalCount}</span> tài khoản
              {isFiltered && (
                <button onClick={handleReset} className="ml-2 text-blue-500 hover:underline">
                  xóa bộ lọc
                </button>
              )}
            </p>
            {role && (
              <span
                className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 font-medium rounded-full
                flex items-center gap-1"
              >
                <ShieldCheck size={11} />
                {translateRole(activeRoleName) || activeRoleName}
              </span>
            )}
          </div>
        )}

        {/* overflow-x-auto (chỉ x) + sticky thead */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-primary text-white text-sm">
                <th className="px-4 py-3.5 font-semibold w-12 text-center">STT</th>
                <th className="px-4 py-3.5 font-semibold">Người dùng</th>
                <th className="px-4 py-3.5 font-semibold w-20">Giới tính</th>
                <th className="px-4 py-3.5 font-semibold">Email</th>
                <th className="px-4 py-3.5 font-semibold">Số điện thoại</th>
                <th className="px-4 py-3.5 font-semibold">Ngày sinh</th>
                <th className="px-4 py-3.5 font-semibold">Vai trò</th>
                <th className="px-4 py-3.5 font-semibold">Trạng thái</th>

                <RequirePermission required={[PERMISSIONS.USER.EDIT, PERMISSIONS.USER.DELETE]}>
                  <th className="px-4 py-3.5 font-semibold text-center">Thao tác</th>
                </RequirePermission>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: limit }).map((_, i) => <SkeletonRow key={i} />)
              ) : users && (users as IUser[]).length > 0 ? (
                (users as IUser[]).map((user: any, index: number) => {
                  const color = getColor(user.fullName);
                  return (
                    <tr key={user._id} className="group hover:bg-blue-50/40 transition-colors">
                      {/* STT */}
                      <td className="px-4 py-3.5 text-gray-400 text-sm text-center font-medium">
                        {index + 1 + (page - 1) * limit}
                      </td>

                      {/* Avatar + tên */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center
                              text-sm font-bold shrink-0 ring-2 select-none
                              ${color.bg} ${color.text} ${color.ring}`}
                          >
                            {getInitials(user.fullName)}
                          </div>
                          <div
                            className="font-semibold text-gray-800 cursor-pointer
                              hover:text-blue-600 transition-colors"
                            onClick={() => navigateToDetail(user)}
                          >
                            {user.fullName}
                          </div>
                        </div>
                      </td>

                      {/* Giới tính */}
                      <td className="px-4 py-3.5 text-sm text-gray-600">{genderLabel(user.gender)}</td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        <span className="truncate max-w-[180px] block">{user.email}</span>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 text-sm text-gray-600">{user.phone || '—'}</td>

                      {/* Ngày sinh */}
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(user.date as string)}
                      </td>

                      {/* Vai trò badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm
                          ${getRoleStyles((user.roleId as any)?.name || '')}`}
                        >
                          {(translateRole(user.roleId?.name as string) as string) || '—'}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 text-sm">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0
                            ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-300'}`}
                          />
                          <span className={user.status === 'ACTIVE' ? 'text-emerald-700 font-medium' : 'text-gray-400'}>
                            {user.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng HĐ'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <RequirePermission required={[PERMISSIONS.USER.EDIT, PERMISSIONS.USER.DELETE]}>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-1">
                            <RequirePermission required={PERMISSIONS.USER.EDIT}>
                              <button
                                onClick={() => navigate(PATHS.ACCOUNT_USERS_EDIT.replace(':id', user._id))}
                                title="Chỉnh sửa"
                                className="p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700
                              rounded-xl transition-all hover:scale-110 active:scale-95"
                              >
                                <Edit2 size={16} />
                              </button>
                            </RequirePermission>
                            <RequirePermission required={PERMISSIONS.USER.DELETE}>
                              <button
                                title="Xóa"
                                onClick={() =>
                                  setConfirmDelete({
                                    isOpen: true,
                                    title: 'Xác nhận xóa tài khoản',
                                    message: `Bạn có chắc muốn xóa tài khoản "${user.fullName}"?`,
                                    type: 'danger',
                                    confirmText: 'Xóa',
                                    cancelText: 'Hủy',
                                    onConfirm: () => {
                                      setConfirmDelete((p) => ({ ...p, isOpen: false }));
                                      handleDeleteUser(user._id);
                                    },
                                  })
                                }
                                className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600
                              rounded-xl transition-all hover:scale-110 active:scale-95"
                              >
                                <Trash2 size={16} />
                              </button>
                            </RequirePermission>
                          </div>
                        </td>
                      </RequirePermission>
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

export default UserList;
