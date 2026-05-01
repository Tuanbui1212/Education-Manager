import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, BookOpen, DollarSign, FileText, PlusCircle, CreditCard, UserPlus } from 'lucide-react';
import { PATHS } from '../../utils/constants';
import useFetch from '../../hooks/useFetch';
import { userService } from '../../services/user.service';
import { classService } from '../../services/class.service';
import { cashbookService } from '../../services/cashbook.service';
import { transactionService } from '../../services/transaction.service';
import { formatCurrency, formatDate } from '../../utils/format.util';
import { PAYMENT_CONFIG } from '../../utils/constants';

const HomePage = () => {
  const navigate = useNavigate();
  const now = new Date();

  const { totalCount: totalCountStudent } = useFetch(
    userService.getAllStudents,
    { status: 'ACTIVE', limit: 1, page: 1 },
    [],
  );
  const { totalCount: totalCountClass } = useFetch(
    classService.getClasses,
    { status: 'ACTIVE', limit: 1, page: 1 },
    [],
  );

  const { data: recentTransactions, summary } = useFetch(
    transactionService.getTransactions,
    { limit: 10, page: 1, month: now.getMonth() + 1, year: now.getFullYear() },
    [],
  );

  const stats = [
    { title: 'Tổng Học Sinh', value: totalCountStudent, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Lớp Đang Mở', value: totalCountClass, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-100' },
    {
      title: 'Doanh Thu Tháng',
      value: formatCurrency(summary?.totalIn | 0),
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    { title: 'Hóa Đơn Chờ T.Toán', value: '12', icon: FileText, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
        <p className="text-gray-500">Chào mừng bạn trở lại, đây là tình hình trung tâm hôm nay.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className={`p-4 rounded-full ${stat.bg} mr-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Thao tác nhanh</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate(PATHS.TRAINING_STUDENT_CREATE)}
              className="w-full flex items-center p-3 text-sm text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              <UserPlus className="w-5 h-5 mr-3" /> Thêm học sinh mới
            </button>
            <button
              onClick={() => navigate(PATHS.TRAINING_CLASSES)}
              className="w-full flex items-center p-3 text-sm text-gray-700 bg-gray-50 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
            >
              <PlusCircle className="w-5 h-5 mr-3" /> Mở lớp học mới
            </button>
            <button className="w-full flex items-center p-3 text-sm text-gray-700 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
              <CreditCard className="w-5 h-5 mr-3" /> Lập hóa đơn thu tiền
            </button>
          </div>
        </div>

        {/* Recent Transactions / Sổ quỹ mini */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Giao dịch gần đây</h2>
            <Link to={PATHS.FINANCE_TRANSACTIONS} className="text-sm text-blue-600 hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="pb-3 font-medium">Mã GD</th>
                  <th className="pb-3 font-medium">Người thực hiện</th>
                  <th className="pb-3 font-medium">Số tiền</th>
                  <th className="pb-3 font-medium">Hình thức</th>
                  <th className="pb-3 font-medium">Ngày</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentTransactions?.map((tx, idx) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{tx.code}</td>
                    <td className="py-3 text-gray-600">{tx.processedBy?.fullName}</td>
                    <td className="py-3 font-semibold text-gray-800">{formatCurrency(tx.amount)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          PAYMENT_CONFIG[tx.paymentMethod].className || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {PAYMENT_CONFIG[tx.paymentMethod]?.label || 'Không xác định'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
