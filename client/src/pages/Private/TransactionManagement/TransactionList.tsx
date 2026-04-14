import React, { useEffect, useState } from 'react';
import { transactionService } from '../../../services/transaction.service';
import type { ITransaction } from '../../../types/transaction.type';
import { formatCurrency } from '../../../utils/format.util';
import { format } from 'date-fns';
import TablePagination from '../../../components/TablePagination';
import { Search, FileText, Printer, User, Calendar } from 'lucide-react';

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const paymentMethodConfig: Record<string, { label: string; color: string }> = {
    CASH: { label: 'TIỀN MẶT', color: 'bg-orange-100 text-orange-600' },
    TRANSFER: { label: 'CHUYỂN KHOẢN', color: 'bg-blue-100 text-blue-600' },
    CARD: { label: 'QUẸT THẺ', color: 'bg-purple-100 text-purple-600' },
    VNPAY: { label: 'VNPAY', color: 'bg-sky-100 text-sky-700' },
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // 4. Đảm bảo transactionService hỗ trợ nhận tham số { page, limit }
      const res = await transactionService.getTransactions({ page, limit });
      if (res.success) {
        setTransactions(res.data);
        setTotal(res.total);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách giao dịch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lịch sử Giao dịch</h1>
          <p className="text-gray-500 text-sm">Quản lý và theo dõi các phiếu thu học phí</p>
        </div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          Tổng thu: {total} phiếu
        </div>
      </div>

      {/* FILTER BOX */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo mã phiếu, tên học viên..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all">
          Lọc ngày
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Mã Phiếu</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Học viên / Hóa đơn</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ngày thu</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Số tiền</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Hình thức</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Người thu</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400 italic">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400 italic">
                  Chưa có giao dịch nào
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-blue-600">{tx.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{(tx.studentId as any)?.fullName}</span>
                      <span className="text-xs text-gray-400">Mã HD: {(tx.invoiceId as any)?.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {format(new Date(tx.createdAt), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-emerald-600">{formatCurrency(tx.amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const config = paymentMethodConfig[tx.paymentMethod] || {
                        label: 'KHÁC',
                        color: 'bg-gray-100 text-gray-600',
                      };

                      return (
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${config.color}`}>
                          {config.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={14} className="text-gray-400" />
                      {(tx.processedBy as any)?.fullName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                      title="In phiếu thu"
                    >
                      <Printer size={18} />
                    </button>
                  </td>
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

export default TransactionList;
