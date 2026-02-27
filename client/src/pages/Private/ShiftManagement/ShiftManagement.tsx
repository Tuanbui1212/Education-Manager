import { Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { useState } from 'react';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';

// Dữ liệu giả (Mock Data) để hiển thị UI
const MOCK_SHIFTS = [
  { _id: '1', name: 'Ca Sáng 1', startTime: '07:30', endTime: '09:00', status: 'ACTIVE' },
  { _id: '2', name: 'Ca Sáng 2', startTime: '09:15', endTime: '10:45', status: 'ACTIVE' },
  { _id: '3', name: 'Ca Chiều 1', startTime: '14:00', endTime: '15:30', status: 'ACTIVE' },
  { _id: '4', name: 'Ca Tối 1', startTime: '18:00', endTime: '19:30', status: 'ACTIVE' },
  { _id: '5', name: 'Ca Tối 2', startTime: '19:45', endTime: '21:15', status: 'INACTIVE' },
];

const ShiftManagement = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchInput, setSearchInput] = useState('');

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'warning' | 'danger',
    onConfirm: () => {},
  });

  return (
    <div className="p-8 w-full">
      <PageHeader title="Quản lý Ca học" />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Xác nhận"
        cancelText="Hủy"
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

        <Button variant="primary" icon={<Plus size={18} />} onClick={() => console.log('Mở modal thêm ca học')}>
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
            {MOCK_SHIFTS.map((shift, index) => (
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
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Giả lập pagination */}
        <TablePagination totalPages={1} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
      </div>
    </div>
  );
};

export default ShiftManagement;
