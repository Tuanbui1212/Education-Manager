import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  Calendar,
  X,
} from 'lucide-react';

import { formatCurrency, formatDate } from '../../../../utils/format.util';

import Button from '../../../../components/Button';
import PageHeader from '../../../../components/PageHeader';
import TablePagination from '../../../../components/TablePagination';

import type { TransactionType, ICashTransaction } from '../../../../types/transaction.type';
import useFetch from '../../../../hooks/useFetch';
import { transactionService } from '../../../../services/transaction.service';
import { expenditureService } from '../../../../services/expenditure.service';
import { cashbookService } from '../../../../services/cashbook.service';

// --- MOCK DATA ---
const mockData: ICashTransaction[] = [
  {
    _id: '1',
    code: 'PT00124',
    type: 'IN',
    category: 'Học phí',
    description: 'Nguyễn Văn A đóng học phí khóa IELTS',
    amount: 5000000,
    paymentMethod: 'TRANSFER',
    createdAt: '2026-04-23T08:30:00Z',
    creatorName: 'Kế toán 1',
  },
  {
    _id: '2',
    code: 'PC0098',
    type: 'OUT',
    category: 'Lương thưởng',
    description: 'Thanh toán lương tháng 3 - Giáo viên B',
    amount: 12000000,
    paymentMethod: 'TRANSFER',
    createdAt: '2026-04-22T15:00:00Z',
    creatorName: 'Hệ thống (Tự động)',
  },
  {
    _id: '3',
    code: 'PC0099',
    type: 'OUT',
    category: 'Vận hành',
    description: 'Thanh toán tiền điện tháng 3',
    amount: 1500000,
    paymentMethod: 'CASH',
    createdAt: '2026-04-21T10:15:00Z',
    creatorName: 'Kế toán 1',
  },
  {
    _id: '4',
    code: 'PT00125',
    type: 'IN',
    category: 'Bán sách/Học liệu',
    description: 'Bán giáo trình mầm non',
    amount: 300000,
    paymentMethod: 'CASH',
    createdAt: '2026-04-20T09:00:00Z',
    creatorName: 'Lễ tân',
  },
  {
    _id: '5',
    code: 'PR0012',
    type: 'REFUND',
    category: 'Hoàn tiền',
    description: 'Hoàn học phí Trần Thị C (Nghỉ ốm)',
    amount: 2000000,
    paymentMethod: 'TRANSFER',
    createdAt: '2026-04-19T14:20:00Z',
    creatorName: 'Quản lý',
  },
];

const CashbookManagement = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [expenditure, setExpenditure] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    type: 'OUT',
    category: '',
    amount: '',
    description: '',
    paymentMethod: 'CASH',
  });

  const {
    data: cashBook,
    loading,
    error,
  } = useFetch(
    cashbookService.getCashBook,
    {
      page,
      limit,
    },
    [page, limit],
  );

  console.log('cashBook:', cashBook);

  const filteredData = useMemo(() => {
    return mockData.filter((item) => {
      const matchSearch =
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTab = activeTab === 'ALL' ? true : activeTab === 'IN' ? item.type === 'IN' : item.type === 'OUT';

      return matchSearch && matchTab;
    });
  }, [searchTerm, activeTab]);

  // --- Tính toán Summary ---
  const stats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    let totalRefund = 0;

    mockData.forEach((item) => {
      if (item.type === 'IN') totalIn += item.amount;
      if (item.type === 'OUT') totalOut += item.amount;
      if (item.type === 'REFUND') totalRefund += item.amount;
    });

    return { totalIn, totalOut, totalRefund, balance: totalIn - totalOut - totalRefund };
  }, []);

  // --- Render Helpers ---
  const renderTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'IN':
        return (
          <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ArrowUpRight size={14} /> Phiếu Thu
          </span>
        );
      case 'OUT':
        return (
          <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
            <ArrowDownRight size={14} /> Phiếu Chi
          </span>
        );
      case 'REFUND':
        return (
          <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
            <RefreshCcw size={14} /> Hoàn Tiền
          </span>
        );
      default:
        return null;
    }
  };

  const paymentMethodLabels: Record<string, string> = {
    CASH: 'Tiền mặt',
    TRANSFER: 'Chuyển khoản',
    CARD: 'Quẹt thẻ',
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tạo phiếu mới:', newVoucher);
    // TODO: Gọi API tạo expenditure hoặc transaction tùy theo type
    setIsModalOpen(false);
    setNewVoucher({ type: 'OUT', category: '', amount: '', description: '', paymentMethod: 'CASH' });
  };

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen bg-gray-50/50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <PageHeader title="Sổ Quỹ & Báo cáo Thu Chi" />
        <div className="flex gap-3">
          <Button variant="outline" icon={<Download size={18} />} className="bg-white">
            Xuất Báo cáo
          </Button>
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
            Tạo Phiếu Thủ Công
          </Button>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Tổng Thu (Dòng tiền vào)</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalIn)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingDown size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Tổng Chi (Dòng tiền ra)</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalOut)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
            <RefreshCcw size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Giảm trừ doanh thu (Refund)</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRefund)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-md flex items-center gap-4 text-white hover:shadow-lg transition-all transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-sm text-blue-100 font-medium mb-1">Tồn Quỹ Kỳ Này</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.balance)}</p>
          </div>
        </div>
      </div>

      {/* ===== TABS & TOOLBAR ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2 p-1 bg-gray-50 rounded-xl w-fit border border-gray-100">
            {(['ALL', 'IN', 'OUT'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200/50'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab === 'ALL' ? 'Tất cả Giao dịch' : tab === 'IN' ? 'Phiếu Thu' : 'Phiếu Chi'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 focus-within:border-blue-500 transition-colors">
              <Calendar size={18} className="text-gray-400" />
              <select className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer">
                <option value="this_month">Tháng này</option>
                <option value="last_month">Tháng trước</option>
                <option value="this_quarter">Quý này</option>
                <option value="this_year">Năm nay</option>
                <option value="custom">Tùy chỉnh...</option>
              </select>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm mã phiếu, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== BẢNG DỮ LIỆU ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Thời gian</th>
                <th className="p-4 font-semibold">Mã Phiếu</th>
                <th className="p-4 font-semibold">Loại</th>
                <th className="p-4 font-semibold">Danh mục</th>
                <th className="p-4 font-semibold w-1/3">Nội dung diễn giải</th>
                <th className="p-4 font-semibold text-right">Số tiền (VNĐ)</th>
                <th className="p-4 font-semibold text-center">Hình thức</th>
                <th className="p-4 font-semibold text-center">Người lập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-4 text-sm text-gray-600">
                      <div className="font-medium text-gray-800">{formatDate(item.createdAt).split(' ')}</div>
                      <div className="text-xs text-gray-400"> {item.createdAt.split('T')[1]?.substring(0, 5)}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm font-semibold text-blue-600">{item.code}</span>
                    </td>
                    <td className="p-4">{renderTypeBadge(item.type)}</td>
                    <td className="p-4 text-sm font-medium text-gray-700">{item.category}</td>
                    <td className="p-4 text-sm text-gray-600">{item.description}</td>
                    <td className="p-4 text-right">
                      <span
                        className={`font-bold text-base ${item.type === 'IN' ? 'text-emerald-600' : 'text-orange-600'}`}
                      >
                        {item.type === 'IN' ? '+' : '-'}
                        {formatCurrency(item.amount)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">
                        {paymentMethodLabels[item.paymentMethod] || item.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm text-gray-500">{item.creatorName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-500 italic">
                    Không tìm thấy dữ liệu giao dịch nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination totalPages={1} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
      </div>

      {/* ===== MODAL TẠO PHIẾU THỦ CÔNG ===== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-blue-600 p-5 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Tạo Phiếu Thu / Chi Thủ Công</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="p-6 space-y-5">
              <div className="flex gap-4 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newVoucher.type === 'IN' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                  onClick={() => setNewVoucher({ ...newVoucher, type: 'IN' })}
                >
                  Tạo Phiếu Thu
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newVoucher.type === 'OUT' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                  onClick={() => setNewVoucher({ ...newVoucher, type: 'OUT' })}
                >
                  Tạo Phiếu Chi
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Số tiền (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                    value={newVoucher.amount}
                    onChange={(e) => setNewVoucher({ ...newVoucher, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Hình thức <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newVoucher.paymentMethod}
                    onChange={(e) => setNewVoucher({ ...newVoucher, paymentMethod: e.target.value })}
                  >
                    <option value="CASH">Tiền mặt</option>
                    <option value="TRANSFER">Chuyển khoản</option>
                    <option value="CARD">Quẹt thẻ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={newVoucher.category}
                  onChange={(e) => setNewVoucher({ ...newVoucher, category: e.target.value })}
                >
                  <option value="" disabled>
                    -- Chọn danh mục --
                  </option>
                  {newVoucher.type === 'IN' ? (
                    <>
                      <option value="Bán tài liệu/Sách">Bán tài liệu/Sách</option>
                      <option value="Thu khác">Thu khác</option>
                    </>
                  ) : (
                    <>
                      <option value="Văn phòng phẩm">Văn phòng phẩm</option>
                      <option value="Chi phí Marketing">Chi phí Marketing / Ads</option>
                      <option value="Bảo trì / Sửa chữa">Bảo trì / Sửa chữa</option>
                      <option value="Tạm ứng lương">Tạm ứng lương</option>
                      <option value="Chi khác">Chi khác</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nội dung diễn giải <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Nhập lý do thu/chi..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                  value={newVoucher.description}
                  onChange={(e) => setNewVoucher({ ...newVoucher, description: e.target.value })}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="w-full py-3" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" variant="primary" className="w-full py-3 shadow-lg">
                  Lưu Giao Dịch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashbookManagement;
