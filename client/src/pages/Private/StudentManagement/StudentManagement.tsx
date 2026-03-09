import { Plus, Edit2, Trash2, Mail, Phone, User as UserIcon, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';
import StudentModal from './StudentModal';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';
import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import type { IUser } from '../../../types/user.type';

import { formatDate, getStatusUserStyles } from '../../../utils/format.util';
import { STATUS_OPTIONS } from '../../../utils/constants';

const StudentManager = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<IUser | null>(null);

  const debouncedSearch = useDebounce(searchInput, 500);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
  });

  const [openStatus, setOpenStatus] = useState(false);

  const { data: rolesData } = useFetch(roleService.getRoles, {}, []);
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];

  const studentRoleId = useMemo(() => {
    return roles.find((r: any) => r.name?.toLowerCase() === 'student')?._id || '';
  }, [roles]);

  const queryParams = {
    page,
    limit,
    search: debouncedSearch,
    roleId: studentRoleId,
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
  };

  const {
    data: students,
    loading,
    error,
    totalCount,
    refetch: fetchStudents,
  } = useFetch(userService.getUsers, queryParams, [page, debouncedSearch, studentRoleId, limit, statusFilter]);

  const handleAddStudent = async (formData: Partial<IUser>) => {
    try {
      const data: any = await userService.createUser(formData);
      if (data.success) {
        setConfirmConfig({ isOpen: true, title: 'Thành công', message: 'Đã thêm học viên mới!', type: 'success' });
        fetchStudents();
        setShowModalAdd(false);
        setPage(1);
      }
    } catch (error: any) {
      const detailError = error.response?.data ? Object.values(error.response?.data?.errors).flat()[0] : null;
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: (detailError as string) || 'Có lỗi xảy ra!',
        type: 'danger',
      });
    }
  };

  const handleEditStudent = async (formData: Partial<IUser>) => {
    if (!selectedStudent?._id) return;
    try {
      const data = await userService.updateUser(selectedStudent._id, formData);
      if (data.success) {
        setConfirmConfig({ isOpen: true, title: 'Thành công', message: 'Cập nhật hồ sơ thành công!', type: 'success' });
        fetchStudents();
        setShowModalAdd(false);
        setSelectedStudent(null);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : null;
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: (detailError as string) || 'Có lỗi xảy ra!',
        type: 'danger',
      });
    }
  };

  const openEditModal = async (id: string) => {
    try {
      const response = await userService.getUserById(id);
      if (response.success) {
        setSelectedStudent(response.data || null);
        setShowModalAdd(true);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin học viên:', error);
    }
  };

  const totalPages = Math.ceil((totalCount || 0) / limit);

  if (error) return <div className="p-8 text-red-500 text-center">Lỗi: {error}</div>;

  return (
    <div className="p-8 w-full">
      {showModalAdd && (
        <StudentModal
          isOpen={showModalAdd}
          onClose={() => {
            setShowModalAdd(false);
            setSelectedStudent(null);
          }}
          onSubmit={selectedStudent?._id ? handleEditStudent : handleAddStudent}
          initialData={selectedStudent || undefined}
          studentRoleId={studentRoleId}
        />
      )}

      <PageHeader title="Quản lý Học viên" />

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
            placeholder="Tìm kiếm tên, email, sđt học viên..."
            value={searchInput}
            setSearchInput={setSearchInput}
            setPage={setPage}
          />

          <div className="relative inline-block w-48">
            <Button variant="outline" icon={<Filter size={18} />} onClick={() => setOpenStatus(!openStatus)}>
              Filter
            </Button>

            {openStatus && (
              <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {STATUS_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setPage(1);
                      setOpenStatus(false);
                    }}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm transition-colors ${
                      statusFilter === option.value ? 'bg-blue-50 font-semibold text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
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
            setSelectedStudent(null);
            setShowModalAdd(true);
          }}
        >
          Thêm Học viên
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm sticky top-0 z-10">
              <th className="p-4 font-semibold w-16 text-center rounded-tl-xl">No.</th>
              <th className="p-4 font-semibold">Thông tin Học viên</th>
              <th className="p-4 font-semibold">Liên hệ & Phụ huynh</th>
              <th className="p-4 font-semibold">Ngày sinh</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-center rounded-tr-xl">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students && students.length > 0 ? (
              students.map((student: any, index: number) => (
                <tr key={student._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-4 text-text-secondary font-medium text-center">{index + 1 + (page - 1) * limit}</td>

                  <td className="p-4">
                    <div className="font-semibold text-blue-600 cursor-pointer group-hover:underline">
                      {student.fullName}
                    </div>
                    <div className="text-xs text-gray-400 font-mono mt-1">ID: ...{student._id.slice(-6)}</div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserIcon size={14} className="text-gray-400" />
                        <span>
                          PH: <span className="font-medium">{student.student_info?.parentsName || 'N/A'}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-gray-400" />
                        <span>{student.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        <span>{student.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-text-main">{formatDate(student.date as string)}</td>

                  <td className="p-4">
                    <span className={getStatusUserStyles(student.status as string)}>
                      {STATUS_OPTIONS.find((opt) => opt.value === student.status)?.label}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => openEditModal(student._id!)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
                        title="Sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => console.log('Gọi API xóa ở đây:', student._id)}
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
                <td colSpan={6} className="p-10 text-center text-gray-500">
                  Không tìm thấy học viên nào.
                </td>
              </tr>
            ) : (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="p-8 bg-gray-50/50"></td>
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

export default StudentManager;

