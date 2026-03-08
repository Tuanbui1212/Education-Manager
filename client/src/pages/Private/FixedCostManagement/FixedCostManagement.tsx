import { Plus, Edit2, Archive, CheckCircle2, XCircle, CalendarClock, Building, Wifi, Shield } from 'lucide-react';
import { useState } from 'react';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';

import { formatCurrency, translateCycle, formatDateA } from '../../../utils/format.util';

import { fixedCostService } from '../../../services/fixedCost.service';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';

// import ConfirmModal from '../../../components/ConfirmModal';

const FixedCostManagement = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchInput, setSearchInput] = useState('');

  const debouncedSearch = useDebounce(searchInput, 500);

  const {
    data: fixedCostData,
    totalCount,
    loading,
    error,
    refetch: fetchData,
  } = useFetch(fixedCostService.getFixedCosts, { page, limit, search: debouncedSearch }, [
    page,
    limit,
    debouncedSearch,
  ]);

  console.log('Dữ liệu từ API:', fixedCostData);

  return (
    <div className="p-8 w-full">
      <PageHeader title="Cấu hình Chi phí định kỳ" />

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex gap-4 items-center flex-1 max-w-sm">
          <SearchInput
            type="text"
            placeholder="Tìm cấu hình chi phí..."
            value={searchInput}
            setSearchInput={setSearchInput}
            setPage={setPage}
          />
        </div>

        <Button variant="primary" icon={<Plus size={18} />} onClick={() => console.log('Mở modal thêm cấu hình mới')}>
          Thêm Định Mức Mới
        </Button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm">
              <th className="p-4 font-semibold w-16 text-center">No.</th>
              <th className="p-4 font-semibold">Tên khoản chi</th>
              <th className="p-4 font-semibold text-right">Mức phí</th>
              <th className="p-4 font-semibold text-center">Quy tắc thanh toán</th>
              <th className="p-4 font-semibold text-center">Trạng thái</th>
              <th className="p-4 font-semibold text-center">Thời gian áp dụng</th>
              <th className="p-4 font-semibold text-center w-32">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fixedCostData && fixedCostData.length > 0 ? (
              fixedCostData.map((cost, index) => {
                // const Icon = cost.icon;
                const isActive = cost.status === 'ACTIVE';

                return (
                  <tr
                    key={cost._id}
                    className={`transition-colors group ${isActive ? 'hover:bg-blue-50/50' : 'bg-gray-50'}`}
                  >
                    {/* 1. Số thứ tự */}
                    <td className="p-4 text-text-secondary font-medium text-center">{index + 1}</td>

                    {/* 2. Tên khoản chi */}
                    <td
                      className={`p-4 font-semibold flex items-center gap-3 ${isActive ? 'text-text-main' : 'text-gray-400'}`}
                    >
                      <div
                        className={`p-2 rounded-lg ${isActive ? 'bg-blue-50 text-blue-500' : 'bg-gray-200 text-gray-400'}`}
                      >
                        {/* <Icon size={16} /> */}
                      </div>
                      {cost.name}
                    </td>

                    {/* 3. Số tiền */}
                    <td className={`p-4 text-right font-bold ${isActive ? 'text-red-500' : 'text-gray-400'}`}>
                      {formatCurrency(cost.amount)}
                    </td>

                    {/* 4. Quy tắc / Chu kỳ */}
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center justify-center text-sm">
                        <span className={`font-semibold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                          {translateCycle(cost.cycle)}
                        </span>
                        <span className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                          <CalendarClock size={12} /> Ngày {cost.payDay}
                        </span>
                      </div>
                    </td>

                    {/* 5. Trạng thái */}
                    <td className="p-4 text-center">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <CheckCircle2 size={14} /> Đang áp dụng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                          <XCircle size={14} /> Đã đóng
                        </span>
                      )}
                    </td>

                    {/* 6. (Đang ẩn) Thời gian */}
                    <td className="p-4 text-center text-xs text-text-secondary font-medium">
                      {formatDateA(cost.startDate as string)} <br />
                      <span className="text-gray-400">đến</span> <br />
                      {formatDateA(cost.endDate as string)}
                    </td>

                    {/* 7. Hành động (Hiện là cột 6 do cột thời gian bị ẩn) */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {isActive ? (
                          <>
                            <button
                              title="Cập nhật giá mới (Lưu vết)"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              title="Ngừng áp dụng"
                              className="p-2 text-orange-500 hover:bg-orange-50 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
                            >
                              <Archive size={18} />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Chỉ xem</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              // SỬA LẠI PHẦN NÀY ĐỂ KHÔNG BỊ VỠ BẢNG
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 font-medium bg-white">
                  Không có dữ liệu chi phí cố định nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <TablePagination totalPages={1} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
      </div>
    </div>
  );
};

export default FixedCostManagement;
