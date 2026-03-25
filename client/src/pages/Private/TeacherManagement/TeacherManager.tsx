import {
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Filter,
  Calculator,
  MoreVertical,
} from 'lucide-react';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';
import TeacherModal from './TeacherModal';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';
import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import type { IUser } from '../../../types/user.type';

import { formatCurrency } from '../../../utils/format.util';
import { TEACHER_STATUS_OPTIONS, PATHS } from '../../../utils/constants';

const getTeacherStatusBadge = (status: string) => {
  if (status === 'ACTIVE')
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
        Đang giảng dạy
      </span>
    );
  if (status === 'INACTIVE')
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
        Đã nghỉ
      </span>
    );
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">
      Không rõ
    </span>
  );
};

const TeacherManager = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<IUser | null>(null);

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
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
  });

  const [openStatus, setOpenStatus] = useState(false);

  const { data: rolesData } = useFetch(roleService.getRoles, {}, []);
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];

  const teacherRoleId = useMemo(() => {
    return roles.find((r: any) => r.name?.toLowerCase() === 'teacher')?._id || '';
  }, [roles]);

  const queryParams = {
    page,
    limit,
    search: debouncedSearch,
    roleId: teacherRoleId,
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
  };

  const {
    data: teachers,
    loading,
    error,
    totalCount,
    refetch: fetchTeachers,
  } = useFetch(userService.getUsers, queryParams, [page, debouncedSearch, teacherRoleId, limit, statusFilter]);

  const handleAddTeacher = async (formData: Partial<IUser>) => {
    try {
      const createData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        status: formData.status,
        roleId: teacherRoleId,
        date: formData.date,
        teacher_info: {
          hourlyRate: Number(formData.teacher_info?.hourlyRate || 0),
          degrees: formData.teacher_info?.degrees || [],
        },
      };
      const data: any = await userService.createUser(createData);
      if (data.success) {
        setConfirmConfig({ isOpen: true, title: 'Thành công', message: 'Đã thêm giáo viên mới!', type: 'success' });
        fetchTeachers();
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

  const handleEditTeacher = async (formData: Partial<IUser>) => {
    if (!selectedTeacher?._id) return;
    console.log(formData);
    delete formData.email;
    try {
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        status: formData.status,
        roleId: teacherRoleId,
        date: formData.date,
        teacher_info: {
          hourlyRate: Number(formData.teacher_info?.hourlyRate || 0),
          degrees: formData.teacher_info?.degrees || [],
        },
      };
      const data = await userService.updateUser(selectedTeacher._id, updateData);
      if (data.success) {
        setConfirmConfig({ isOpen: true, title: 'Thành công', message: 'Cập nhật hồ sơ thành công!', type: 'success' });
        fetchTeachers();
        setShowModalAdd(false);
        setSelectedTeacher(null);
        setPage(1);
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

  const handleDeleteTeacher = async (id: string) => {
    try {
      const data = await userService.deleteUser(id);
      if (data.success) {
        setConfirmDelete({
          isOpen: true,
          title: 'Thành công',
          message: data.message,
          type: 'success',
          onConfirm: () => setConfirmDelete({ ...confirmDelete, isOpen: false }),
          cancelText: '',
          confirmText: 'Xác nhận',
        });
        fetchTeachers();
        setShowModalAdd(false);
        setSelectedTeacher(null);
        setPage(1);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : null;
      setConfirmDelete({
        isOpen: true,
        title: 'Lỗi',
        message: (detailError as string) || 'Có lỗi xảy ra!',
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
        setSelectedTeacher(response.data || null);
        setShowModalAdd(true);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin giáo viên:', error);
    }
  };

  const totalPages = Math.ceil((totalCount || 0) / limit);

  if (error) return <div className="p-8 text-red-500 text-center">Lỗi: {error}</div>;

  return (
    <div className="p-8 w-full">
      {showModalAdd && (
        <TeacherModal
          isOpen={showModalAdd}
          onClose={() => {
            setShowModalAdd(false);
            setSelectedTeacher(null);
          }}
          onSubmit={selectedTeacher?._id ? handleEditTeacher : handleAddTeacher}
          initialData={selectedTeacher || undefined}
          teacherRoleId={teacherRoleId}
        />
      )}

      <PageHeader title="Đội ngũ Giáo viên" />

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
            placeholder="Tìm kiếm tên, email, sđt giáo viên..."
            value={searchInput}
            setSearchInput={setSearchInput}
            setPage={setPage}
          />

          <div className="relative inline-block w-48">
            <Button variant="outline" icon={<Filter size={18} />} onClick={() => setOpenStatus(!openStatus)}>
              <span className="truncate">Filter</span>
            </Button>

            {openStatus && (
              <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {TEACHER_STATUS_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setPage(1);
                      setOpenStatus(false);
                    }}
                    className={`px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm transition-colors ${
                      statusFilter === option.value ? 'bg-indigo-50 font-semibold text-indigo-600' : 'text-gray-700'
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
            setSelectedTeacher(null);
            setShowModalAdd(true);
          }}
        >
          Thêm Giáo viên
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm sticky top-0 z-10">
              <th className="p-4  font-semibold w-16 text-center rounded-tl-xl">No.</th>
              <th className="p-4 font-semibold">Giáo viên</th>
              <th className="p-4 font-semibold">Liên hệ</th>
              <th className="p-4 font-semibold">Hồ sơ & Bằng cấp</th>
              <th className="p-4 font-semibold">Lương (Giờ)</th>
              <th className="p-4 font-semibold min-w-[180px]">Trạng thái</th>
              <th className="p-4 font-semibold text-center rounded-tr-xl">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teachers && teachers.length > 0 ? (
              teachers.map((teacher: any, index: number) => {
                return (
                  <tr key={teacher._id} className="hover:bg-indigo-50/30 transition-colors group relative">
                    <td className="p-4 text-text-secondary font-medium text-center">
                      {index + 1 + (page - 1) * limit}
                    </td>

                    <td className="p-4">
                      <div
                        className="flex items-center gap-3"
                        onClick={() => navigate(PATHS.HR_TEACHERS_ID.replace(':id', teacher._id))}
                      >
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {teacher.fullName?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <div className="font-semibold text-indigo-700 cursor-pointer group-hover:underline">
                            {teacher.fullName}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          <span>{teacher.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          <span>{teacher.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.teacher_info?.degrees && teacher.teacher_info.degrees.length > 0 ? (
                          teacher.teacher_info.degrees.map((degree: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100"
                            >
                              {degree}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">Chưa cập nhật</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-100">
                        {formatCurrency(teacher.teacher_info?.hourlyRate || 0)}/h
                      </span>
                    </td>

                    <td className="p-4">{getTeacherStatusBadge(teacher.status)}</td>

                    {/* --- MENU BA CHẤM (KEBAB MENU) --- */}
                    <td className="p-4 text-center relative">
                      <div className="flex justify-center">
                        <button
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionMenuId(openActionMenuId === teacher._id ? null : teacher._id);
                          }}
                        >
                          <MoreVertical size={20} />
                        </button>
                      </div>

                      {openActionMenuId === teacher._id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={(e) => (e.stopPropagation(), setOpenActionMenuId(null))}
                          ></div>

                          <div className="absolute right-8 top-12 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in zoom-in-95 duration-100">
                            <button
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-3 transition-colors"
                              onClick={() => {
                                console.log('Mở lịch dạy cho:', teacher.fullName);
                                setOpenActionMenuId(null);
                              }}
                            >
                              <CalendarIcon size={16} />
                              Xếp lịch dạy
                            </button>

                            <button
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors"
                              onClick={() => {
                                console.log('Tính lương cho:', teacher.fullName);
                                setOpenActionMenuId(null);
                              }}
                            >
                              <Calculator size={16} />
                              Tính lương tháng
                            </button>

                            <div className="h-px bg-gray-100 my-1"></div>

                            <button
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3 transition-colors"
                              onClick={() => {
                                openEditModal(teacher._id!);
                                setOpenActionMenuId(null);
                              }}
                            >
                              <Edit2 size={16} />
                              Chỉnh sửa hồ sơ
                            </button>

                            <button
                              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                              onClick={() => {
                                setConfirmDelete({
                                  isOpen: true,
                                  title: 'Xác nhận xóa',
                                  message: `Bạn có chắc chắn muốn xóa giáo viên ${teacher.fullName}?`,
                                  type: 'danger',
                                  confirmText: 'Xác nhận',
                                  cancelText: 'Hủy',
                                  onConfirm: () => {
                                    handleDeleteTeacher(teacher._id);
                                  },
                                });
                                setOpenActionMenuId(null);
                              }}
                            >
                              <Trash2 size={16} />
                              Xóa giáo viên
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : !loading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-500">
                  Không tìm thấy giáo viên nào.
                </td>
              </tr>
            ) : (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="p-8 bg-gray-50/50"></td>
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

export default TeacherManager;
