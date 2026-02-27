import { Plus, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { getRoleStyles, formatDate } from '../../../utils/format.util';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';

import UserModal from './UserModal';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';

import { userService } from '../../../services/user.service';

import { useState } from 'react';
import type { IUser } from '../../../types/user.type';

const UserList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [role, setRole] = useState('');
  const [open, setOpen] = useState(false);

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const debouncedSearch = useDebounce(searchInput, 500);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
  });
  const queryParams = {
    page,
    limit,
    search: debouncedSearch,
    role,
  };

  const {
    data: users,
    loading,
    error,
    totalCount,
    refetch: fetchUsers,
  } = useFetch(userService.getUsers, queryParams, [page, debouncedSearch, role, limit]);

  const handleAddUser = async (formData: Partial<IUser>) => {
    try {
      const data: { success: boolean; message: string; data?: IUser } = await userService.createUser(formData);
      if (data.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thông báo',
          message: data.message,
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
        role: formData.role,
        date: formData.date,
      };

      if (formData.role === 'TEACHER' && formData.teacher_info) {
        updateData.teacher_info = {
          hourlyRate: Number(formData.teacher_info.hourlyRate),
          degrees: Array.isArray(formData.teacher_info.degrees) ? formData.teacher_info.degrees : [],
        };
      } else if (formData.role === 'STUDENT' && formData.student_info) {
        updateData.student_info = {
          parentsName: formData.student_info.parentsName,
        };
      }

      const data = await userService.updateUser(selectedUser._id, updateData);

      if (data.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thông báo',
          message: data.message,
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

  const openEditModal = async (id: string) => {
    try {
      const response = await userService.getUserById(id);

      if (response.success) {
        setSelectedUser(response.data || null);
        setShowModalAdd(true);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user:', error);
    }
  };

  const totalPages = Math.ceil((totalCount || 0) / limit);

  if (error) return <div className="p-8 text-red-500 text-center">Lỗi: {error}</div>;

  return (
    <div className="p-8 w-full ">
      <UserModal
        isOpen={showModalAdd}
        onClose={() => {
          setShowModalAdd(false);
          setSelectedUser(null);
        }}
        onSubmit={selectedUser?._id ? handleEditUser : handleAddUser}
        initialData={selectedUser || undefined}
      />
      <PageHeader title="Danh sách tài khoản" />
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
              Filter
            </Button>

            {open && (
              <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {[
                  { label: 'All Roles', value: '' },
                  { label: 'Admin', value: 'ADMIN' },
                  { label: 'Teacher', value: 'TEACHER' },
                  { label: 'Student', value: 'STUDENT' },
                  { label: 'Sale', value: 'SALE' },
                  { label: 'Teaching Assistant', value: 'TEACHING_ASSISTANT' },
                ].map((item) => (
                  <div
                    key={item.value}
                    onClick={() => {
                      setRole(item.value);
                      setPage(1);
                      fetchUsers();
                      setOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setShowModalAdd((e) => !e)}>
          Thêm User
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm sticky top-0 z-10 ">
              <th className="p-4 font-semibold w-16 text-center rounded-tl-xl">No.</th>
              <th className="p-4 font-semibold cursor-pointer hover:opacity-80 transition-colors">Full Name</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Phone</th>
              <th className="p-4 font-semibold">Birthday</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-center rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users && users.length > 0 ? (
              users?.map((user, index) => (
                <tr key={user._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-4 text-text-secondary font-medium text-center">{index + 1 + (page - 1) * limit}</td>
                  <td className="p-4 font-semibold text-blue-600 group-hover:underline cursor-pointer">
                    {user.fullName}
                  </td>
                  <td className="p-4 text-text-main">{user.email}</td>
                  <td className="p-4 text-text-main">{user.phone}</td>
                  <td className="p-4 text-text-main">{formatDate(user.date)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getRoleStyles(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                          user.status === 'ACTIVE' ? 'bg-status-progress-text' : 'bg-text-secondary'
                        }`}
                      ></span>
                      <span
                        className={
                          user.status === 'ACTIVE' ? 'text-status-progress-text font-medium' : 'text-text-secondary'
                        }
                      >
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => openEditModal(user._id!)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
                        title="Sửa"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        onClick={() => console.log('Xóa')}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
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
