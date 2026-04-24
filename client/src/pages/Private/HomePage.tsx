import React from 'react';
import { Users, BookOpen, DollarSign, FileText, PlusCircle, CreditCard, UserPlus } from 'lucide-react';

const HomePage = () => {
  // Dữ liệu giả lập (Sau này bạn sẽ call API từ Backend để đắp vào)
  const stats = [
    { title: 'Tổng Học Sinh', value: '1,250', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Lớp Đang Mở', value: '45', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-100' },
    {
      title: 'Doanh Thu Tháng',
      value: '125,000,000 đ',
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    { title: 'Hóa Đơn Chờ T.Toán', value: '12', icon: FileText, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const recentTransactions = [
    { id: 'TX001', student: 'Nguyễn Văn A', amount: '2,500,000 đ', status: 'PAID', date: '24/04/2026' },
    { id: 'TX002', student: 'Trần Thị B', amount: '1,200,000 đ', status: 'UNPAID', date: '23/04/2026' },
    { id: 'TX003', student: 'Lê Văn C', amount: '3,000,000 đ', status: 'PAID', date: '23/04/2026' },
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
            <button className="w-full flex items-center p-3 text-sm text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
              <UserPlus className="w-5 h-5 mr-3" /> Thêm học sinh mới
            </button>
            <button className="w-full flex items-center p-3 text-sm text-gray-700 bg-gray-50 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors">
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
            <a href="/cashbook" className="text-sm text-blue-600 hover:underline">
              Xem tất cả
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="pb-3 font-medium">Mã GD</th>
                  <th className="pb-3 font-medium">Học sinh</th>
                  <th className="pb-3 font-medium">Số tiền</th>
                  <th className="pb-3 font-medium">Trạng thái</th>
                  <th className="pb-3 font-medium">Ngày</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentTransactions.map((tx, idx) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{tx.id}</td>
                    <td className="py-3 text-gray-600">{tx.student}</td>
                    <td className="py-3 font-semibold text-gray-800">{tx.amount}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{tx.date}</td>
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
