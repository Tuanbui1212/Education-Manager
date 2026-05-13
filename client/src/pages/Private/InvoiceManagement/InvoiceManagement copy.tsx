import { useState, useMemo } from 'react';
import {
  Filter,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Banknote,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';

import { invoiceService } from '../../../services/invoice.service';
import { formatCurrency } from '../../../utils/format.util';
import useFetch from '../../../hooks/useFetch';

const InvoiceManagement = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [openFilter, setOpenFilter] = useState(false);

  // 1. Gọi API với params thực tế (search, page, limit, status)
  const {
    data: response,
    loading,
    totalCount,
  } = useFetch(
    invoiceService.getInvoices,
    {
      page,
      limit,
      search: searchInput,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    },
    [page, limit, searchInput, statusFilter],
  );

  const invoices = Array.isArray(response) ? response : (response as any)?.data || [];

  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + (inv.finalAmount || 0), 0);
    const totalDebt = invoices.reduce((sum: number, inv: any) => sum + (inv.debt || 0), 0);
    return {
      totalRevenue,
      totalDebt,
      totalCollected: totalRevenue - totalDebt,
    };
  }, [invoices]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle2 size={14} /> Hoàn tất
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
            <Clock size={14} /> Nợ một phần
          </span>
        );
      case 'UNPAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200">
            <AlertCircle size={14} /> Chưa đóng
          </span>
        );
      default:
        return null;
    }
  };

  if (loading && page === 1) return <div className="p-8 text-center">Đang tải dữ liệu tài chính...</div>;

  return (
    <div className="p-8 w-full bg-gray-50/50 min-h-screen">
      <PageHeader title="Quản lý Học phí & Công nợ" />

      {/* --- CARDS THỐNG KÊ TÀI CHÍNH --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Tổng Doanh Thu</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Banknote size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Thực Tế Đã Thu</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalCollected)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Tổng Công Nợ</p>
            <p className="text-2xl font-bold text-rose-600">{formatCurrency(stats.totalDebt)}</p>
          </div>
        </div>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex gap-4 items-center flex-1 max-w-2xl">
          <SearchInput
            placeholder="Tìm mã HĐ, tên học viên..."
            value={searchInput}
            setSearchInput={setSearchInput}
            setPage={setPage}
            type="text"
          />
          <div className="relative">
            <Button variant="outline" icon={<Filter size={18} />} onClick={() => setOpenFilter(!openFilter)}>
              {statusFilter === 'ALL' ? 'Trạng thái' : `Lọc: ${statusFilter}`}
            </Button>
            {openFilter && (
              <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                {[
                  { label: 'Tất cả', value: 'ALL' },
                  { label: 'Chưa thanh toán', value: 'UNPAID' },
                  { label: 'Nợ một phần', value: 'PARTIAL' },
                  { label: 'Đã hoàn tất', value: 'PAID' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setOpenFilter(false);
                      setPage(1);
                    }}
                    className={`px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm transition-colors ${statusFilter === option.value ? 'bg-blue-50 font-semibold text-blue-600' : 'text-gray-700'}`}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- BẢNG DỮ LIỆU --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-white text-sm">
                <th className="p-4 font-semibold w-16 text-center">STT</th>
                <th className="p-4 font-semibold">Học viên & Lớp học</th>
                <th className="p-4 font-semibold">Nhân viên Sale</th>
                <th className="p-4 font-semibold text-right">Học phí</th>
                <th className="p-4 font-semibold text-right text-yellow-200">Còn nợ</th>
                <th className="p-4 font-semibold text-center">Trạng thái</th>
                <th className="p-4 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.length > 0 ? (
                invoices.map((invoice: any, index: number) => (
                  <tr key={invoice._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 text-gray-500 text-center">{(page - 1) * limit + index + 1}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{invoice.studentId?.fullName}</span>
                        <span className="text-xs text-blue-600 font-semibold">{invoice.classId?.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono mt-1">Mã: {invoice.code}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{invoice.consultantId?.fullName || '---'}</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(invoice.finalAmount)}</td>
                    <td className="p-4 text-right">
                      <span className={`font-bold ${invoice.debt > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                        {formatCurrency(invoice.debt)}
                      </span>
                    </td>
                    <td className="p-4 text-center">{getStatusBadge(invoice.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {invoice.debt > 0 && (
                          <button
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all text-xs font-bold"
                            onClick={() => console.log('Mở Modal Thu Tiền cho', invoice._id)}
                          >
                            <Wallet size={14} /> Thu tiền
                          </button>
                        )}
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400 italic">
                    Không tìm thấy dữ liệu hóa đơn nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          totalPages={Math.ceil((totalCount || 0) / limit)}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
        />
      </div>
    </div>
  );
};

export default InvoiceManagement;
