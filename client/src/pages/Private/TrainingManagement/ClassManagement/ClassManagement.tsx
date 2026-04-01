import { Plus, Edit2, Trash2, BookOpen, UserCheck, Filter, DoorOpen, Calendar, Users } from 'lucide-react';
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
import type { IClass } from '../../../../types/class.type';
import { PATHS } from '../../../../utils/constants';

import { formatDate } from '../../../../utils/format.util';

const ClassManagement = () => {
  const navigate = useNavigate();

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
    onConfirm: () => {},
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
    console.log(classData);
    setShowClassModal(true);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return {
          label: 'Sắp khai giảng',
          class: 'bg-blue-100 text-blue-700 border border-blue-200',
        };
      case 'ACTIVE':
        return {
          label: 'Đang hoạt động',
          class: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        };
      case 'COMPLETED':
        return {
          label: 'Đã hoàn thành',
          class: 'bg-gray-200 text-gray-600 border border-gray-300',
        };
      case 'MAINTENANCE':
        return {
          label: 'Bảo trì',
          class: 'bg-amber-100 text-amber-700 border border-amber-200',
        };
      case 'INACTIVE':
        return {
          label: 'Ngừng hoạt động',
          class: 'bg-rose-100 text-rose-700 border border-rose-200',
        };
      default:
        return {
          label: status || 'KHÔNG RÕ',
          class: 'bg-gray-100 text-gray-500 border border-gray-200',
        };
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

                {['ACTIVE', 'UPCOMING', 'COMPLETED', 'MAINTENANCE', 'INACTIVE'].map((item) => (
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
                <th className="p-4 font-semibold w-16 text-center">STT</th>
                <th className="p-4 font-semibold">Thông tin Lớp & Khóa học</th>
                <th className="p-4 font-semibold">Giảng viên / Phòng</th>
                <th className="p-4 font-semibold text-center">Sĩ số</th>
                <th className="p-4 font-semibold">Ngày khai giảng</th>
                <th className="p-4 font-semibold text-center">Trạng thái</th>
                <th className="p-4 font-semibold text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {loading ? (
                <TableSkeleton columns={5} rows={limit} />
              ) : classes.length > 0 ? (
                classes.map((item: any, index: number) => {
                  const courseName = item.courseId?.title || 'Chưa gắn khóa học';
                  const teacherName = item.teacherId?.fullName || 'Chưa phân công';
                  const roomName = item.roomId?.name || 'Chưa xếp phòng';

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      onClick={() => navigate(PATHS.TRAINING_CLASSES_ID.replace(':id', item._id))}
                    >
                      <td className="p-4 text-center text-gray-500 font-medium">{(page - 1) * limit + index + 1}</td>

                      {/* Thông tin Lớp & Khóa học */}
                      <td className="p-4">
                        <div className="font-bold text-gray-800 text-base group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                          <BookOpen size={12} className="text-blue-400" />
                          <span className="truncate max-w-[200px]" title={courseName}>
                            {courseName}
                          </span>
                        </div>
                      </td>

                      {/* Giảng viên & Phòng */}
                      <td className="p-4">
                        <div className="font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                          <UserCheck size={14} className="text-emerald-500" />
                          {teacherName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5">
                          <DoorOpen size={14} className="text-orange-400" />
                          Phòng: {roomName}
                        </div>
                      </td>

                      {/* Sĩ số */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold text-gray-700">
                          <Users size={14} className="text-blue-500" />
                          {item.studentIds?.length || 0}
                        </div>
                      </td>

                      {/* Ngày khai giảng */}
                      <td className="p-4">
                        <div
                          className={`flex items-center gap-2 text-sm font-medium ${!item.startDate ? 'text-gray-400 italic' : 'text-gray-700'}`}
                        >
                          <Calendar size={16} className={!item.startDate ? 'text-gray-300' : 'text-blue-500'} />
                          {formatDate(item.startDate)}
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="p-4 text-center">
                        {item.status === 'UPCOMING' && (
                          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                            Sắp mở
                          </span>
                        )}
                        {item.status === 'ACTIVE' && (
                          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                            Đang học
                          </span>
                        )}
                        {item.status === 'COMPLETED' && (
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">
                            Đã kết thúc
                          </span>
                        )}
                        {item.status === 'MAINTENANCE' && (
                          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100">
                            Bảo trì
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              openEditModal(e, item);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all hover:scale-110"
                            title="Sửa lớp"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClass(item._id);
                            }}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all hover:scale-110"
                            title="Xóa lớp"
                          >
                            <Trash2 size={18} />
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
