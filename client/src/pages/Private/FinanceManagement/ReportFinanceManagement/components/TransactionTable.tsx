import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useState } from 'react';
import type { ITransaction, IExpenditure } from '../../../../../services/report.service';
import { formatCurrency, formatDate } from '../../../../../utils/format.util';
import TablePagination from '../../../../../components/TablePagination';

type TabId = 'INCOME' | 'EXPENSE';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'INCOME', label: 'Thu nhập', icon: <ArrowDownCircle size={14} className="text-emerald-500" /> },
  { id: 'EXPENSE', label: 'Chi phí', icon: <ArrowUpCircle size={14} className="text-red-500" /> },
];

const EXPENDITURE_TYPE_LABEL: Record<string, string> = {
  SALARY_TEACHER: 'Lương giáo viên',
  SALARY_SALE: 'Lương tư vấn',
  OPERATION: 'Chi phí vận hành',
};

const PAYMENT_METHOD_BADGE: Record<string, string> = {
  'Chuyển khoản': 'bg-blue-50 text-blue-600',
  'Tiền mặt': 'bg-amber-50 text-amber-600',
};

interface TransactionTableProps {
  transactions: ITransaction[];
  expenditures: IExpenditure[];
  txPage: number;
  setTxPage: (p: number) => void;
  exPage: number;
  setExPage: (p: number) => void;
  txTotal: number;
  exTotal: number;
  limit: number;
  setLimit: (l: number) => void;
  loading?: boolean;
}

const TransactionTable = ({
  transactions,
  expenditures,
  txPage,
  setTxPage,
  exPage,
  setExPage,
  txTotal,
  exTotal,
  limit,
  setLimit,
  loading = false,
}: TransactionTableProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('INCOME');

  const txTotalPages = Math.ceil(txTotal / limit);
  const exTotalPages = Math.ceil(exTotal / limit);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tab Header */}
      <div className="flex items-center gap-1 px-5 pt-5 border-b border-gray-100 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.icon} {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md" />}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-blue-500 animate-pulse font-medium text-sm">Đang tải dữ liệu...</div>
        ) : activeTab === 'INCOME' ? (
          // ---- BẢNG THU NHẬP ----
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold">Mã GD / Ngày</th>
                <th className="p-4 font-semibold">Học viên</th>
                <th className="p-4 font-semibold">Lớp</th>
                <th className="p-4 font-semibold text-right">Số tiền</th>
                <th className="p-4 font-semibold text-center">Phương thức</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-gray-800 text-sm">{tx.code}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.date)}</p>
                    </td>
                    <td className="p-4 font-medium text-gray-700 text-sm">{tx.studentName}</td>
                    <td className="p-4 text-sm text-gray-500">{tx.className}</td>
                    <td className="p-4 text-right font-bold text-emerald-600">{formatCurrency(tx.amount)}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PAYMENT_METHOD_BADGE[tx.paymentMethod] || 'bg-gray-100 text-gray-500'}`}
                      >
                        {tx.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                    Không có dữ liệu thu nhập.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          // ---- BẢNG CHI PHÍ ----
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold">Ngày</th>
                <th className="p-4 font-semibold">Loại chi phí</th>
                <th className="p-4 font-semibold">Người nhận</th>
                <th className="p-4 font-semibold">Mô tả</th>
                <th className="p-4 font-semibold text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenditures.length > 0 ? (
                expenditures.map((ex) => (
                  <tr key={ex._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-500">{formatDate(ex.date)}</td>
                    <td className="p-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600">
                        {EXPENDITURE_TYPE_LABEL[ex.type] || ex.type}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-700 text-sm">{ex.receiverName}</td>
                    <td className="p-4 text-sm text-gray-500">{ex.description}</td>
                    <td className="p-4 text-right font-bold text-red-500">{formatCurrency(ex.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                    Không có dữ liệu chi phí.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <TablePagination
        totalPages={activeTab === 'INCOME' ? txTotalPages : exTotalPages}
        page={activeTab === 'INCOME' ? txPage : exPage}
        setPage={activeTab === 'INCOME' ? setTxPage : setExPage}
        limit={limit}
        setLimit={setLimit}
      />
    </div>
  );
};

export default TransactionTable;
