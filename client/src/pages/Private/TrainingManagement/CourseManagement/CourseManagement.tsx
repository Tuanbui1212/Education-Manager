import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../../../components/Button';
import PageHeader from '../../../../components/PageHeader';
import TablePagination from '../../../../components/TablePagination';
import SearchInput from '../../../../components/SearchInput';
import ConfirmModal from '../../../../components/ConfirmModal';
import TableSkeleton from '../../../../components/TableSkeleton';
import RequirePermission from '../../../../components/RequirePermission';

import CourseModal from './CourseModal';

import useFetch from '../../../../hooks/useFetch';
import useDebounce from '../../../../hooks/useDebounce';

import { courseService } from '../../../../services/course.service';

import type { ICourse } from '../../../../types/course.type';
import { PATHS } from '../../../../utils/constants';
import { PERMISSIONS } from '../../../../utils/permission.constant';

const CourseManagement = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchInput, setSearchInput] = useState('');

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);

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
  };

  const {
    data: courses,
    loading,
    error,
    totalCount,
    refetch: fetchCourses,
  } = useFetch(courseService.getCourses, queryParams, [page, debouncedSearch, limit]);

  const handleCreateCourse = async (formData: Partial<ICourse>) => {
    try {
      const data = await courseService.createCourse(formData);
      if (data.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thông báo',
          message: data.message,
          type: 'success',
          onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
        });
        fetchCourses();
        setShowModalAdd(false);
        setPage(1);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.message || 'Có lỗi xảy ra khi thêm mới!';
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: detailError,
        type: 'danger',
        onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
      });
    }
  };

  const handleUpdateCourse = async (formData: Partial<ICourse>) => {
    if (!selectedCourse?._id) return;

    try {
      const data = await courseService.updateCourse(selectedCourse._id, formData);
      if (data.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thông báo',
          message: data.message,
          type: 'success',
          onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
        });

        fetchCourses();
        setShowModalAdd(false);
        setSelectedCourse(null);
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

  const handleDeleteCourse = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa khóa học này?',
      type: 'danger',
      onConfirm: async () => {
        try {
          const data = await courseService.deleteCourse(id);
          if (data.success) {
            setConfirmConfig({
              isOpen: true,
              title: 'Thông báo',
              message: data.message,
              type: 'success',
              onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
            });
            fetchCourses();
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

  const openEditModal = (course: ICourse) => {
    setSelectedCourse(course);
    setShowModalAdd(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const totalPages = Math.ceil((totalCount || 0) / limit);

  if (error) return <div className="p-8 text-red-500 text-center">Lỗi: {error}</div>;

  return (
    <div className="p-8 w-full">
      <CourseModal
        isOpen={showModalAdd}
        onClose={() => {
          setShowModalAdd(false);
          setSelectedCourse(null);
        }}
        onSubmit={selectedCourse?._id ? handleUpdateCourse : handleCreateCourse}
        initialData={selectedCourse || undefined}
      />
      <PageHeader title="Quản lý khóa học" />
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Xác nhận"
        cancelText={confirmConfig.type === 'warning' ? 'Hủy' : ''}
      />

      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex gap-4 items-center flex-1 max-w-sm">
          <SearchInput
            type="text"
            placeholder="Tìm kiếm tiêu đề khóa học..."
            value={searchInput}
            setSearchInput={setSearchInput}
            setPage={setPage}
          />
        </div>

        <RequirePermission required={PERMISSIONS.COURSE.CREATE}>
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => setShowModalAdd(true)}>
            Thêm khóa học
          </Button>
        </RequirePermission>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm sticky top-0 z-10 ">
              <th className="p-4 font-semibold w-16 text-center rounded-tl-xl">STT</th>
              <th className="p-4 font-semibold">Tiêu đề khóa học</th>
              <th className="p-4 font-semibold text-right">Giá cơ bản</th>
              <th className="p-4 font-semibold">Nội dung rút gọn</th>
              <RequirePermission required={[PERMISSIONS.COURSE.EDIT, PERMISSIONS.COURSE.DELETE]}>
                <th className="p-4 font-semibold text-center rounded-tr-xl">Thao tác</th>
              </RequirePermission>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses && courses.length > 0 ? (
              courses.map((course, index) => (
                <tr key={course._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-4 text-text-secondary font-medium text-center">{index + 1 + (page - 1) * limit}</td>
                  <td
                    onClick={() => navigate(PATHS.TRAINING_COURSES_ID.replace(':id', course._id as string))}
                    className="p-4 font-semibold text-blue-600 cursor-pointer hover:text-blue-800"
                  >
                    {course.title}
                  </td>
                  <td className="p-4 text-right font-bold text-status-progress-text">
                    {formatCurrency(course.basePrice)}
                  </td>
                  <td className="p-4 text-text-main max-w-xs truncate">{course.syllabus}</td>
                  <RequirePermission required={[PERMISSIONS.COURSE.EDIT, PERMISSIONS.COURSE.DELETE]}>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <RequirePermission required={PERMISSIONS.COURSE.EDIT}>
                          <button
                            onClick={() => openEditModal(course)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
                            title="Sửa"
                          >
                            <Edit2 size={18} />
                          </button>
                        </RequirePermission>
                        <RequirePermission required={PERMISSIONS.COURSE.DELETE}>
                          <button
                            onClick={() => course._id && handleDeleteCourse(course._id)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </RequirePermission>
                      </div>
                    </td>
                  </RequirePermission>
                </tr>
              ))
            ) : !loading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-500">
                  Không tìm thấy dữ liệu nào.
                </td>
              </tr>
            ) : (
              <TableSkeleton columns={5} rows={limit} />
            )}
          </tbody>
        </table>

        <TablePagination totalPages={totalPages} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
      </div>
    </div>
  );
};

export default CourseManagement;
