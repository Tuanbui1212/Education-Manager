import { Plus, Edit2, Trash2, Building, Zap, Wifi } from 'lucide-react';
import { useState } from 'react';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';

const MOCK_COSTS = [
  {
    _id: '1',
    name: 'Tiền thuê mặt bằng cơ sở 1',
    category: 'Thuê mặt bằng',
    amount: 50000000,
    cycle: 'Tháng',
    icon: Building,
  },
  { _id: '2', name: 'Tiền điện sinh hoạt', category: 'Điện nước', amount: 5000000, cycle: 'Tháng', icon: Zap },
  { _id: '3', name: 'Tiền mạng Internet FPT', category: 'Vận hành', amount: 800000, cycle: 'Tháng', icon: Wifi },
];

const ExpenditureManagement = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchInput, setSearchInput] = useState('');

  // Hàm format tiền tệ VNĐ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="p-8 w-full">
      <PageHeader title="Các loại chi phí cố định" />

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex gap-4 items-center flex-1 max-w-sm">
          <SearchInput
            type="text"
            placeholder="Tìm kiếm loại chi phí..."
            value={searchInput}
            setSearchInput={setSearchInput}
            setPage={setPage}
          />
        </div>

        <Button variant="primary" icon={<Plus size={18} />} onClick={() => console.log('Mở modal thêm chi phí')}>
          Thêm Chi Phí
        </Button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm">
              <th className="p-4 font-semibold w-16 text-center">No.</th>
              <th className="p-4 font-semibold">Tên Chi Phí</th>
              <th className="p-4 font-semibold">Hạng Mục</th>
              <th className="p-4 font-semibold text-right">Số tiền dự kiến</th>
              <th className="p-4 font-semibold text-center">Chu kỳ</th>
              <th className="p-4 font-semibold text-center w-32">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_COSTS.map((cost, index) => {
              const Icon = cost.icon;
              return (
                <tr key={cost._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-4 text-text-secondary font-medium text-center">{index + 1}</td>
                  <td className="p-4 font-semibold text-text-main flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                      <Icon size={16} />
                    </div>
                    {cost.name}
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold border border-blue-100">
                      {cost.category}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-red-500">{formatCurrency(cost.amount)}</td>
                  <td className="p-4 text-center text-text-secondary font-medium">/{cost.cycle}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <TablePagination totalPages={1} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
      </div>
    </div>
  );
};

export default ExpenditureManagement;
