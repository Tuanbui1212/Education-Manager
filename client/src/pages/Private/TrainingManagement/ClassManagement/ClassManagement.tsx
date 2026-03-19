import { Plus, Edit2, Trash2, BookOpen, UserCheck, Filter } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../../../components/Button';
import PageHeader from '../../../../components/PageHeader';
import TablePagination from '../../../../components/TablePagination';
import SearchInput from '../../../../components/SearchInput';
import ConfirmModal from '../../../../components/ConfirmModal';
import TableSkeleton from '../../../../components/TableSkeleton';

import ClassModal from './ClassModal';
import StudentListModal from './StudentListModal';

import useFetch from '../../../../hooks/useFetch';
import useDebounce from '../../../../hooks/useDebounce';

import { classService } from '../../../../services/class.service';
import { ClassStatus } from '../../../../types/class.type';
import type { IClass } from '../../../../types/class.type';
import { PATHS } from '../../../../utils/constants';

const ClassManagement = () => {
  const navigation = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openFilter, setOpenFilter] = useState(false);

  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [classForStudents, setClassForStudents] = useState<{ id: string; name: string } | null>(null);

  const debouncedSearch = useDebounce(searchInput, 500);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
    onConfirm: () => { },
  });

  const queryParams = {
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter,
  };

  const {
    data: classes,
    loading,
    error,
    totalCount,
    refetch: fetchClasses,
  } = useFetch(classService.getClasses, queryParams, [page, debouncedSearch, limit, statusFilter]);

  const handleCreateClass = async (formData: Partial<IClass>) => {
    try {
      const res = await classService.createClass(formData);
      if (res.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thông báo',
          message: res.message,
          type: 'success',
          onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
        });
        fetchClasses();
        setShowClassModal(false);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.message || 'Có lỗi xảy ra khi tạo lớp học!';
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: detailError,
        type: 'danger',
        onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
      });
    }
  };

  const handleUpdateClass = async (formData: Partial<IClass>) => {
    if (!selectedClass?._id) return;

    try {
      const res = await classService.updateClass(selectedClass._id, formData);
      if (res.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thông báo',
          message: res.message,
          type: 'success',
          onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
        });
        fetchClasses();
        setShowClassModal(false);
        setSelectedClass(null);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!';
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: detailError,
        type: 'danger',
        onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
      });
    }
  };

  const handleDeleteClass = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa lớp học này? Mọi dữ liệu liên quan sẽ bị ảnh hưởng.',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await classService.deleteClass(id);
          if (res.success) {
            setConfirmConfig({
              isOpen: true,
              title: 'Thông báo',
              message: res.message,
              type: 'success',
              onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
            });
            fetchClasses();
          }
        } catch (error: any) {
          const detailError = error.response?.data?.message || 'Có lỗi xảy ra khi xóa!';
          setConfirmConfig({
            isOpen: true,
            title: 'Lỗi',
            message: detailError,
            type: 'danger',
            onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
          });
        }
      },
    });
  };

  const openEditModal = (e: React.MouseEvent, classData: IClass) => {
    e.stopPropagation();
    setSelectedClass(classData);
    setShowClassModal(true);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Đang hoạt động', class: 'bg-green-100 text-green-700' };
      case 'COMPLETED':
        return { label: 'Đã hoàn thành', class: 'bg-blue-100 text-blue-700' };
      case 'PENDING':
        return { label: 'Sắp khai giảng', class: 'bg-orange-100 text-orange-700' };
      case 'MAINTENANCE':
        return { label: 'Bảo trì', class: 'bg-yellow-100 text-yellow-700' };
      case 'INACTIVE':
        return { label: 'Ngừng hoạt động', class: 'bg-red-100 text-red-700' };
      default:
        return { label: status, class: 'bg-gray-100 text-gray-700' };
    }
  };

  const totalPages = Math.ceil((totalCount || 0) / limit);

  if (error) return <div className="p-8 text-red-500 text-center font-bold">Lỗi hệ thống: {error}</div>;

  return (
    <div className="p-8 w-full animate-in fade-in duration-500">
      {showClassModal && (
        <ClassModal
          isOpen={showClassModal}
          onClose={() => {
            setShowClassModal(false);
            setSelectedClass(null);
          }}
          onSubmit={selectedClass && selectedClass?._id ? handleUpdateClass : handleCreateClass}
          initialData={selectedClass || undefined}
        />
      )}

      {showStudentModal && classForStudents && (
        <StudentListModal
          isOpen={showStudentModal}
          onClose={() => {
            setShowStudentModal(false);
            setClassForStudents(null);
          }}
          classId={classForStudents.id}
          className={classForStudents.name}
        />
      )}

      <PageHeader title="Quản lý lớp học" />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Đồng ý"
        cancelText={confirmConfig.type === 'warning' ? 'Hủy' : ''}
      />

      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div className="flex gap-4 items-center flex-1 max-w-3xl">
          <div className="relative flex-1">
            <SearchInput
              type="text"
              placeholder="Tìm kiếm tên lớp học..."
              value={searchInput}
              setSearchInput={setSearchInput}
              setPage={setPage}
            />
          </div>

          <div className="relative inline-block">
            <Button variant="outline" icon={<Filter size={18} />} onClick={() => setOpenFilter(!openFilter)}>
              Filter
            </Button>

            {openFilter && (
              <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div
                  key="all"
                  onClick={() => {
                    setStatusFilter('');
                    setPage(1);
                    setOpenFilter(false);
                  }}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${statusFilter === '' ? 'bg-blue-50 font-semibold' : ''}`}
                >
                  Tất cả trạng thái
                </div>

                {['ACTIVE', 'PENDING', 'COMPLETED', 'MAINTENANCE', 'INACTIVE'].map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      setStatusFilter(item);
                      setPage(1);
                      setOpenFilter(false);
                    }}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${statusFilter === item ? 'bg-blue-50 font-semibold' : ''}`}
                  >
                    {getStatusLabel(item).label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={20} />}
          onClick={() => setShowClassModal(true)}
          className="rounded-xl shadow-lg shadow-primary/20"
        >
          Tạo lớp học mới
        </Button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative transition-all hover:shadow-xl hover:shadow-gray-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-5 font-bold text-xs uppercase tracking-wider w-16 text-center">No.</th>
                <th className="p-5 font-bold text-xs uppercase tracking-wider">Tên lớp</th>
                <th className="p-5 font-bold text-xs uppercase tracking-wider">Giáo viên</th>
                <th className="p-5 font-bold text-xs uppercase tracking-wider text-center">Trạng thái</th>
                <th className="p-5 font-bold text-xs uppercase tracking-wider text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {loading ? (
                <TableSkeleton columns={5} rows={limit} />
              ) : classes && classes.length > 0 ? (
                classes.map((item: any, index: number) => {
                  const statusInfo = getStatusLabel(item.status);
                  return (
                    <tr key={item._id} className="hover:bg-blue-50/40 transition-all group">
                      <td className="p-5 text-gray-400 font-medium text-center">{index + 1 + (page - 1) * limit}</td>
                      <td className="p-5">
                        <div
                          className="flex items-center gap-3 cursor-pointer group/name inline-flex"
                          onClick={() => navigation(PATHS.TRAINING_CLASSES_ID.replace(':id', item._id))}
                        >
                          <span className="font-bold text-gray-800 text-lg group-hover/name:text-blue-600 transition-colors">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div
                          className="flex items-center gap-2 text-gray-600 cursor-pointer group/teacher inline-flex"
                          onClick={() => navigation(PATHS.HR_TEACHERS_ID.replace(':id', item.teacherId._id))}
                        >
                          <UserCheck
                            size={16}
                            className="text-gray-400 group-hover/teacher:text-blue-500 transition-colors"
                          />
                          <span className="font-medium group-hover/teacher:text-blue-600 group-hover/teacher:underline transition-all">
                            {typeof item.teacherId === 'object' ? item.teacherId.fullName : item.teacherId}
                          </span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={(e) => openEditModal(e, item)}
                            className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClass(item._id);
                            }}
                            className="p-2.5 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110"
                            title="Xóa lớp"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-20 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-4">
                      <BookOpen size={64} strokeWidth={1} className="opacity-20" />
                      <p className="text-xl font-medium italic">
                        Không tìm thấy lớp học nào khớp với điều kiện tìm kiếm
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination totalPages={totalPages} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
      </div>
    </div>
  );
};

export default ClassManagement;
