import { Plus, Edit2, Trash2, Mail, Phone, User as UserIcon, Filter, Headset } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

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
import { STATUS_OPTIONS, PATHS } from '../../../utils/constants';

const StudentManager = () => {
  const navigate = useNavigate();

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

  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger' as 'success' | 'danger' | 'warning' | 'info',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
  });

  const [openStatus, setOpenStatus] = useState(false);

  // Lấy Roles
  const { data: rolesData } = useFetch(roleService.getRoles, {}, []);
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];

  const studentRoleId = useMemo(() => roles.find((r: any) => r.name?.toLowerCase() === 'student')?._id || '', [roles]);
  const consultantRoleId = useMemo(
    () => roles.find((r: any) => r.name?.toLowerCase() === 'consultant')?._id || '',
    [roles],
  );

  // Lấy danh sách Học sinh
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

  // Lấy danh sách Sale để map tên vào bảng và truyền vào Modal
  const { data: consultants } = useFetch(userService.getUsers, { page: 1, limit: 1000, roleId: consultantRoleId }, [
    consultantRoleId,
  ]);

  const getConsultantName = (consultantData: any) => {
    if (!consultantData) return 'Chưa có';
    if (typeof consultantData === 'object') return consultantData.fullName;
    const found = consultants?.find((c: any) => c._id === consultantData);
    return found ? found.fullName : 'Chưa phân công';
  };

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
    const updateData = {
      fullName: formData.fullName,
      phone: formData.phone,
      date: formData.date,
      status: formData.status,
      roleId: studentRoleId,
      student_info: {
        parentsName: formData.student_info?.parentsName,
        consultantId: formData.student_info?.consultantId,
      },
    };
    try {
      const data = await userService.updateUser(selectedStudent._id, updateData);
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

  const handleDeleteStudent = async (id: string) => {
    try {
      const data = await userService.deleteUser(id);
      if (data.success) {
        setConfirmDelete({
          isOpen: true,
          title: 'Thành công',
          message: 'Xóa hồ sơ thành công!',
          type: 'success',
          onConfirm: () => setConfirmDelete({ ...confirmDelete, isOpen: false }),
          cancelText: '',
          confirmText: 'Xác nhận',
        });
        fetchStudents();
        setShowModalAdd(false);
        setSelectedStudent(null);
        setPage(1);
      }
    } catch (error: any) {
      setConfirmDelete({
        isOpen: true,
        title: 'Lỗi',
        message: 'Có lỗi xảy ra!',
        type: 'danger',
        confirmText: '',
        cancelText: '',
        onConfirm: () => {},
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
          roles={roles}
          consultants={consultants}
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
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={() => confirmDelete.onConfirm()}
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
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm transition-colors ${statusFilter === option.value ? 'bg-blue-50 font-semibold text-blue-600' : 'text-gray-700'}`}
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
              <th className="p-4 font-semibold">Liên hệ & Người chăm sóc</th>
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
                    <div
                      className="font-semibold text-blue-600 cursor-pointer group-hover:underline"
                      onClick={() => navigate(PATHS.TRANINING_STUDENT_ID.replace(':id', student._id || ''))}
                    >
                      {student.fullName}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-gray-400" />
                        <span>{student.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserIcon size={14} className="text-gray-400" />
                        <span>
                          PH: <span className="font-medium">{student.student_info?.parentsName || 'N/A'}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 w-fit px-2 py-0.5 rounded-md">
                        <Headset size={14} className="text-green-600" />
                        <span>
                          Sale:{' '}
                          <span className="font-bold">{getConsultantName(student.student_info?.consultantId)}</span>
                        </span>
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
                        onClick={() => {
                          setConfirmDelete({
                            isOpen: true,
                            title: 'Xác nhận xóa',
                            message: `Bạn có chắc chắn muốn xóa ${student.fullName}?`,
                            type: 'danger',
                            confirmText: 'Xác nhận',
                            cancelText: 'Hủy',
                            onConfirm: () => {
                              handleDeleteStudent(student._id);
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
