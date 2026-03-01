import { Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { useState } from 'react';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';

import ShiftModal from './ShiftModal';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';

import { shiftService } from '../../../services/shift.service';

import type { IShift } from '../../../types/shift.type';

const ShiftManagement = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchInput, setSearchInput] = useState('');

  const [isModelOpen, setIsModalOpen] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'warning' | 'danger',
  });

  const [textModalCancel, setTextModalCancel] = useState('');

  const [deleteShift, setDeleteShift] = useState('');
  const [selectedShift, setSelectedShift] = useState<IShift | null>(null);

  const debouncedSearch = useDebounce(searchInput, 500);

  const queryParams = {
    page: page,
    limit: limit,
    search: debouncedSearch,
  };

  const {
    data: dataShift,
    totalCount,
    loading,
    error,
    refetch: fetchShifts,
  } = useFetch(shiftService.getShifts, queryParams, [page, limit, debouncedSearch]);

  const totalPages = Math.ceil(totalCount / limit);

  const handleShiftAdd = async (formData: Partial<IShift>) => {
    try {
      const data: { success: boolean; message: string; data?: IShift } = await shiftService.createShift(formData);

      if (data.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thông báo',
          message: data.message,
          type: 'success',
        });
        fetchShifts();
        setIsModalOpen(false);
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

  const openEditModal = async (id: string) => {
    try {
      const response = await shiftService.getShiftById(id);

      if (response.success) {
        setSelectedShift(response.data || null);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin ca học:', error);
    }
  };

  const handleShiftEdit = async (formData: Partial<IShift>) => {
    if (!selectedShift?._id) return;
    try {
      const data = await shiftService.updateShift(selectedShift._id, formData);

      if (data.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thông báo',
          message: data.message,
          type: 'success',
        });
        fetchShifts();
        setIsModalOpen(false);
        setSelectedShift(null);
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

  const openDeleteModal = (id: string) => {
    setDeleteShift(id);
    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận',
      message: 'Bạn có chắc chắn muốn xóa?',
      type: 'danger',
    });

    setTextModalCancel('Hủy');
  };

  const handleDelete = async (id: string) => {
    try {
      const data = await shiftService.deleteShift(id);
      setTextModalCancel('');

      if (data.success) {
        setTimeout(() => {
          setConfirmConfig({
            isOpen: true,
            title: 'Thông báo',
            message: data.message,
            type: 'success',
          });
          fetchShifts();
          setIsModalOpen(false);
          setSelectedShift(null);
          setDeleteShift('');
        }, 1000);
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

  return (
    <div className="p-8 w-full">
      <ShiftModal
        isOpen={isModelOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedShift(null);
        }}
        onSubmit={selectedShift?._id ? handleShiftEdit : handleShiftAdd}
        initialData={selectedShift || undefined}
      />

      <PageHeader title="Quản lý Ca học" />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() =>
          deleteShift
            ? (setDeleteShift(''), setConfirmConfig({ ...confirmConfig, isOpen: false }))
            : setConfirmConfig({ ...confirmConfig, isOpen: false })
        }
        onConfirm={() =>
          deleteShift
            ? (handleDelete(deleteShift as string), setConfirmConfig({ ...confirmConfig, isOpen: false }))
            : setConfirmConfig({ ...confirmConfig, isOpen: false })
        }
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Xác nhận"
        cancelText={textModalCancel}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex gap-4 items-center flex-1 max-w-sm">
          <SearchInput
            type="text"
            placeholder="Tìm kiếm tên ca học..."
            value={searchInput}
            setSearchInput={setSearchInput}
            setPage={setPage}
          />
        </div>

        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Thêm Ca Học
        </Button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm">
              <th className="p-4 font-semibold w-16 text-center">No.</th>
              <th className="p-4 font-semibold">Tên Ca Học</th>
              <th className="p-4 font-semibold text-center">Thời gian bắt đầu</th>
              <th className="p-4 font-semibold text-center">Thời gian kết thúc</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-center w-32">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dataShift && dataShift.length > 0 ? (
              dataShift.map((shift, index) => (
                <tr key={shift._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-4 text-text-secondary font-medium text-center">{index + 1}</td>
                  <td className="p-4 font-semibold text-text-main">{shift.name}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm">
                      <Clock size={14} className="text-gray-500" /> {shift.startTime}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm">
                      <Clock size={14} className="text-gray-500" /> {shift.endTime}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${shift.status === 'ACTIVE' ? 'bg-status-progress-text animate-pulse' : 'bg-text-secondary'}`}
                      ></span>
                      <span
                        className={
                          shift.status === 'ACTIVE' ? 'text-status-progress-text font-medium' : 'text-text-secondary'
                        }
                      >
                        {shift.status === 'ACTIVE' ? 'Đang áp dụng' : 'Ngừng áp dụng'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
                        title="Sửa"
                        onClick={() => openEditModal(shift._id as string)}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
                        title="Xóa"
                        onClick={() => openDeleteModal(shift._id as string)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <TablePagination totalPages={totalPages} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
      </div>
    </div>
  );
};

export default ShiftManagement;
