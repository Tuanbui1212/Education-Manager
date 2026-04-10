import { Plus, Filter, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getRoleStyles, formatDate, translateRole } from '../../../utils/format.util';
import { PATHS } from '../../../utils/constants';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';
import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import type { IUser } from '../../../types/user.type';

const UserList = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [role, setRole] = useState('');
  const [open, setOpen] = useState(false);

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

  const queryParams = {
    page,
    limit,
    search: debouncedSearch,
    roleId: role,
  };

  const {
    data: users,
    loading,
    error,
    totalCount,
    refetch: fetchUsers,
  } = useFetch(userService.getUsers, queryParams, [page, debouncedSearch, role, limit]);

  const { data: rolesData } = useFetch(roleService.getRoles, {}, []);
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];

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

  if (error) return <div className="p-8 text-red-500 text-center">Lỗi: {error}</div>;

  return (
    <div className="p-8 w-full">
      <PageHeader title="Danh sách Tất cả Tài khoản" />

      {/* Modal thông báo chung */}
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
        <div className="flex gap-4 items-center flex-1 max-w-2xl">
          <SearchInput
            type="text"
            placeholder="Tìm kiếm tên hoặc email..."
            value={searchInput}
            setSearchInput={setSearchInput}
            setPage={setPage}
          />

          {/* Filter Role */}
          <div className="relative inline-block">
            <Button variant="outline" icon={<Filter size={18} />} onClick={() => setOpen(!open)}>
              Filter Role
            </Button>
            {open && (
              <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <div
                  onClick={() => {
                    setRole('');
                    setPage(1);
                    setOpen(false);
                  }}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${role === '' ? 'bg-blue-50 font-semibold' : ''}`}
                >
                  Tất cả Role
                </div>
                {roles.map((item: any) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      setRole(item._id);
                      setPage(1);
                      setOpen(false);
                    }}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${role === item._id ? 'bg-blue-50 font-semibold' : ''}`}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate(PATHS.ACCOUNT_USERS_CREATE)}>
          Thêm User
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-primary text-white text-sm sticky top-0 z-10">
              <th className="p-3 font-semibold w-16 text-center rounded-tl-xl">No.</th>
              <th className="p-3 font-semibold">Tên người dùng</th>
              <th className="p-3 font-semibold w-24">Giới tính</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Số điện thoại</th>
              <th className="p-3 font-semibold">Ngày sinh</th>
              <th className="p-3 font-semibold">Vai trò</th>
              <th className="p-3 font-semibold">Trạng thái</th>
              <th className="p-3 font-semibold text-center rounded-tr-xl">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users && users.length > 0 ? (
              users?.map((user: any, index: number) => (
                <tr key={user._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-3 text-gray-500 font-medium text-center">{index + 1 + (page - 1) * limit}</td>
                  <td className="p-3">
                    <div
                      className="font-semibold text-blue-600 group-hover:underline cursor-pointer inline-block"
                      onClick={() => navigateToDetail(user)}
                    >
                      {user.fullName}
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">
                    {user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                  </td>
                  <td className="p-3 text-gray-600">{user.email}</td>
                  <td className="p-3 text-gray-600">{user.phone}</td>
                  <td className="p-3 text-gray-600">{formatDate(user.date as string)}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getRoleStyles((user.roleId as any)?.name || '')}`}
                    >
                      {(translateRole(user.roleId?.name as string) as string) || ''}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                          user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      <span className={user.status === 'ACTIVE' ? 'text-green-700 font-medium' : 'text-gray-500'}>
                        {user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => navigate(PATHS.ACCOUNT_USERS_EDIT.replace(':id', user._id))}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
                        title="Sửa"
                      >
                        <Edit2 size={18} />
                      </button>

                      {/* Nút xóa */}
                      <button
                        onClick={() => {
                          setConfirmDelete({
                            isOpen: true,
                            title: 'Xác nhận xóa tài khoản',
                            message: `Bạn có chắc chắn muốn xóa tài khoản của ${user.fullName} không?`,
                            type: 'danger',
                            confirmText: 'Xác nhận',
                            cancelText: 'Hủy',
                            onConfirm: () => {
                              setConfirmDelete((prev) => ({ ...prev, isOpen: false }));
                              handleDeleteUser(user._id);
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
              ))
            ) : !loading ? (
              <tr>
                <td colSpan={9} className="p-10 text-center text-gray-500">
                  Không tìm thấy dữ liệu nào.
                </td>
              </tr>
            ) : (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={9} className="p-8 bg-gray-50/50" />
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

export default UserList;
