import { Plus, Filter, Edit2, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm import navigate

import { getRoleStyles, formatDate } from '../../../utils/format.util';
import { PATHS } from '../../../utils/constants'; // Thêm import PATHS

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';
import UserModal from './UserModal';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';
import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import type { IUser } from '../../../types/user.type';

const UserList = () => {
  const navigate = useNavigate(); // Khởi tạo hook navigate

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [role, setRole] = useState('');
  const [open, setOpen] = useState(false);

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const debouncedSearch = useDebounce(searchInput, 500);

  // Modal thông báo chung (Thành công/Lỗi)
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
  });

  // Modal xác nhận Xóa
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

  const consultantRoleId = useMemo(() => {
    return roles.find((r: any) => r.name?.toLowerCase() === 'consultant')?._id || '';
  }, [roles]);

  const queryParamsConsultant = {
    page: 1,
    limit: 1000,
    roleId: consultantRoleId,
    status: 'ACTIVE',
  };

  const { data: consultants } = useFetch(userService.getUsers, queryParamsConsultant, [consultantRoleId]);

  const handleAddUser = async (formData: Partial<IUser>) => {
    try {
      const data: any = await userService.createUser(formData);
      if (data.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thông báo',
          message: 'Tạo tài khoản thành công!',
          type: 'success',
        });
        fetchUsers();
        setShowModalAdd(false);
        setPage(1);
      }
    } catch (error: any) {
      const detailError = error.response?.data ? Object.values(error.response?.data?.errors).flat()[0] : null;
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: (detailError as string) || 'Có lỗi xảy ra khi thêm mới!',
        type: 'danger',
      });
    }
  };

  const handleEditUser = async (formData: Partial<IUser>) => {
    if (!selectedUser?._id) return;

    try {
      const updateData: any = {
        fullName: formData.fullName,
        phone: formData.phone,
        status: formData.status,
        roleId: formData.roleId,
        date: formData.date,
      };

      const roleName = roles?.find((r: any) => r._id === formData.roleId)?.name;

      if (roleName.toLowerCase() === 'teacher' && formData.teacher_info) {
        updateData.teacher_info = {
          hourlyRate: Number(formData.teacher_info.hourlyRate),
          degrees: Array.isArray(formData.teacher_info.degrees) ? formData.teacher_info.degrees : [],
        };
      } else if (roleName.toLowerCase() === 'student' && formData.student_info) {
        updateData.student_info = {
          parentsName: formData.student_info.parentsName,
          consultantId: formData.student_info.consultantId,
        };
      }

      const data = await userService.updateUser(selectedUser._id, updateData);

      if (data.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thông báo',
          message: 'Cập nhật tài khoản thành công!',
          type: 'success',
        });

        fetchUsers();
        setShowModalAdd(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : null;

      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: (detailError as string) || 'Có lỗi xảy ra khi thay đổi!',
        type: 'danger',
      });
    }
  };

  // LOGIC: Xóa người dùng
  const handleDeleteUser = async (id: string) => {
    try {
      const data = await userService.deleteUser(id);
      if (data.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          message: 'Đã xóa tài khoản thành công!',
          type: 'success',
        });
        fetchUsers();
      }
    } catch (error: any) {
      const detailError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : null;
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: (detailError as string) || 'Có lỗi xảy ra khi xóa!',
        type: 'danger',
      });
    }
  };

  // LOGIC: Điều hướng vào trang chi tiết dựa theo Role
  const navigateToDetail = (user: any) => {
    if (!user?._id) return;
    const roleName = (user.roleId?.name || '').toLowerCase();

    if (roleName === 'student') {
      navigate(PATHS.TRANINING_STUDENT_ID.replace(':id', user._id));
    } else if (roleName === 'teacher') {
      navigate(PATHS.HR_TEACHERS_ID.replace(':id', user._id));
    } else {
      // Dành cho Manager, Accountant, Consultant, Admin...
      navigate(PATHS.HR_STAFFS_ID.replace(':id', user._id));
    }
  };

  const openEditModal = async (id: string) => {
    try {
      const response = await userService.getUserById(id);
      if (response.success) {
        setSelectedUser(response.data || null);
        setShowModalAdd(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const totalPages = Math.ceil((totalCount || 0) / limit);

  if (error) return <div className="p-8 text-red-500 text-center">Lỗi: {error}</div>;

  return (
    <div className="p-8 w-full ">
      {showModalAdd && (
        <UserModal
          roles={roles}
          consultants={consultants}
          isOpen={showModalAdd}
          onClose={() => {
            setShowModalAdd(false);
            setSelectedUser(null);
          }}
          onSubmit={selectedUser?._id ? handleEditUser : handleAddUser}
          initialData={selectedUser || undefined}
        />
      )}

      <PageHeader title="Danh sách Tất cả Tài khoản" />

      {/* Modal Thông báo */}
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

      {/* Modal Xác nhận Xóa */}
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

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex gap-4 items-center flex-1 max-w-2xl">
          <SearchInput
            type="text"
            placeholder="Tìm kiếm tên hoặc email..."
            value={searchInput}
            setSearchInput={setSearchInput}
            setPage={setPage}
          />

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

        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => {
            setSelectedUser(null);
            setShowModalAdd(true);
          }}
        >
          Thêm User
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm sticky top-0 z-10 ">
              <th className="p-4 font-semibold w-16 text-center">No.</th>
              <th className="p-4 font-semibold">Tên người dùng</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Phone</th>
              <th className="p-4 font-semibold">Birthday</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users && users.length > 0 ? (
              users?.map((user: any, index: number) => (
                <tr key={user._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-4 text-gray-500 font-medium text-center">{index + 1 + (page - 1) * limit}</td>
                  <td className="p-4">
                    {/* Thêm onClick chuyển hướng vào thẻ này */}
                    <div
                      className="font-semibold text-blue-600 group-hover:underline cursor-pointer inline-block"
                      onClick={() => navigateToDetail(user)}
                    >
                      {user.fullName}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4 text-gray-600">{user.phone}</td>
                  <td className="p-4 text-gray-600">{formatDate(user.date as string)}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getRoleStyles((user.roleId as any)?.name || '')}`}
                    >
                      {(user.roleId as any)?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                          user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      ></span>
                      <span className={user.status === 'ACTIVE' ? 'text-green-700 font-medium' : 'text-gray-500'}>
                        {user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => openEditModal(user._id!)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
                        title="Sửa"
                      >
                        <Edit2 size={18} />
                      </button>

                      {/* Gắn logic Xóa vào nút Trash */}
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
                <td colSpan={8} className="p-10 text-center text-gray-500">
                  Không tìm thấy dữ liệu nào.
                </td>
              </tr>
            ) : (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="p-8 bg-gray-50/50"></td>
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
