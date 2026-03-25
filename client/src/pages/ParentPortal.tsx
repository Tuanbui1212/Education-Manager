import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CreditCard,
  User,
  Bell,
  LogOut,
  ChevronDown,
  Clock,
  MapPin,
  QrCode,
  X,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

// --- MOCK DATA (DỮ LIỆU GIẢ LẬP) ---
const MOCK_CHILDREN = [
  { id: '1', name: 'Nguyễn Văn A', grade: 'Lớp 5', avatar: 'A' },
  { id: '2', name: 'Nguyễn Thị B', grade: 'Lớp 8', avatar: 'B' },
];

const MOCK_CLASSES = [
  {
    id: 'c1',
    name: 'Tiếng Anh Giao tiếp Kids 1',
    teacher: 'Ms. Sarah',
    schedule: 'T2, T4 (18:00 - 19:30)',
    room: 'Phòng 201',
  },
  {
    id: 'c2',
    name: 'Toán Tư duy Nâng cao',
    teacher: 'Thầy Hùng',
    schedule: 'T7, CN (08:00 - 09:30)',
    room: 'Phòng 105',
  },
];

const MOCK_INVOICES = [
  { id: 'inv1', title: 'Học phí Tiếng Anh (Tháng 10)', amount: 2500000, dueDate: '2023-10-15', status: 'PENDING' },
  { id: 'inv2', title: 'Giáo trình & Đồng phục', amount: 450000, dueDate: '2023-10-20', status: 'PARTIAL' },
];

// Hàm format tiền tệ (nếu bạn đã có trong utils thì import vào dùng)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- COMPONENT CHÍNH ---
const ParentPortal = () => {
  // State quản lý bé đang được chọn (Lấy bé đầu tiên làm mặc định)
  const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0]);
  const [showChildDropdown, setShowChildDropdown] = useState(false);

  // State quản lý Modal Thanh toán
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Hàm mở Modal thanh toán
  const handleOpenPayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  // Hàm giả lập bấm "Tôi đã thanh toán"
  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentModalOpen(false);
      alert('Hệ thống đang xác nhận thanh toán của bạn. Cảm ơn bạn!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* 1. HEADER DÀNH RIÊNG CHO PHỤ HUYNH */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                <GraduationCap size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">EduCenter</h1>
                <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">Parent Portal</p>
              </div>
            </div>

            {/* Child Selector & Actions */}
            <div className="flex items-center gap-6">
              {/* Chọn bé */}
              <div className="relative">
                <button
                  onClick={() => setShowChildDropdown(!showChildDropdown)}
                  className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 py-2 px-4 rounded-full border border-gray-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {selectedChild.avatar}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800">Hồ sơ: {selectedChild.name}</p>
                    <p className="text-xs text-gray-500">{selectedChild.grade}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {/* Dropdown chọn bé */}
                {showChildDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chuyển đổi hồ sơ</p>
                    </div>
                    {MOCK_CHILDREN.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          setSelectedChild(child);
                          setShowChildDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 p-4 hover:bg-blue-50 transition-colors ${selectedChild.id === child.id ? 'bg-blue-50/50' : ''}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${selectedChild.id === child.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {child.avatar}
                        </div>
                        <div className="text-left">
                          <p
                            className={`text-sm font-bold ${selectedChild.id === child.id ? 'text-blue-700' : 'text-gray-800'}`}
                          >
                            {child.name}
                          </p>
                          <p className="text-xs text-gray-500">{child.grade}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification & Logout */}
              <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <Bell size={24} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
              <button className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-red-600 font-medium transition-colors">
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Lời chào & Thống kê nhanh */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          {/* Họa tiết nền */}
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <ShieldCheck size={250} />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Xin chào Phụ huynh bé {selectedChild.name}! 👋</h2>
            <p className="text-blue-100 mb-8 max-w-2xl text-lg">
              Chào mừng bạn đến với cổng thông tin. Dưới đây là tình hình học tập và các khoản phí cần lưu ý.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">Đang theo học</p>
                  <p className="text-2xl font-bold">{MOCK_CLASSES.length} Lớp</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CreditCard size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tổng cần thanh toán</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(MOCK_INVOICES.reduce((acc, curr) => acc + curr.amount, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CÁC LỚP HỌC */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-600" />
              Lớp học của bé {selectedChild.name}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_CLASSES.map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Đang học</span>
                </div>
                <h4 className="font-bold text-lg text-gray-800 mb-4 line-clamp-2">{cls.name}</h4>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <User size={16} className="text-gray-400" />
                    <span className="font-medium">{cls.teacher}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    <span>{cls.schedule}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{cls.room}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HỌC PHÍ & THANH TOÁN */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="text-blue-600" />
              Khoản phí chờ thanh toán
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {MOCK_INVOICES.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {MOCK_INVOICES.map((invoice, index) => (
                  <div
                    key={invoice.id}
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">{invoice.title}</h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} /> Hạn chót: {invoice.dueDate}
                          </span>
                          <span className="flex items-center gap-1">
                            Mã HĐ:{' '}
                            <span className="font-mono text-gray-700 font-medium">#{invoice.id.toUpperCase()}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3 md:min-w-[200px]">
                      <p className="font-black text-2xl text-red-600">{formatCurrency(invoice.amount)}</p>
                      <button
                        onClick={() => handleOpenPayment(invoice)}
                        className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-600/20"
                      >
                        <QrCode size={18} /> Thanh toán ngay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                <CheckCircle2 size={48} className="text-green-500 mb-3" />
                <p className="font-medium text-lg text-gray-800">Tuyệt vời!</p>
                <p>Bạn không có khoản phí nào đang nợ.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 3. FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <GraduationCap size={28} />
              <span className="text-xl font-bold">EduCenter</span>
            </div>
            <p className="text-sm">
              Đồng hành cùng sự phát triển toàn diện của học sinh. Mang đến môi trường giáo dục hiện đại và chuyên
              nghiệp.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Hỗ trợ Phụ huynh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Hướng dẫn thanh toán
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Quy định học phí
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Câu hỏi thường gặp (FAQ)
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone size={16} /> 1900 1234 (Ext: 1 cho Kế toán)
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} /> hotrophuhuynh@educenter.edu.vn
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="shrink-0 mt-1" /> 123 Đường ABC, Quận X, TP. Y
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          &copy; {new Date().getFullYear()} EduCenter. Đã đăng ký bản quyền.
        </div>
      </footer>

      {/* 4. MODAL THANH TOÁN (GIẢ LẬP MÃ QR) */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z- flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
            onClick={() => setIsPaymentModalOpen(false)}
          ></div>

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-6 text-white text-center relative">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold mb-1">Thanh toán Học phí</h3>
              <p className="text-blue-100 text-sm">Quét mã QR qua ứng dụng Ngân hàng/Ví điện tử</p>
            </div>

            <div className="p-8 flex flex-col items-center">
              <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Nội dung thanh toán</p>
                <p className="font-bold text-gray-800 line-clamp-1">{selectedInvoice.title}</p>
                <div className="flex justify-between items-end mt-3">
                  <p className="text-sm text-gray-500">Mã: {selectedInvoice.id.toUpperCase()}</p>
                  <p className="font-black text-2xl text-blue-600">{formatCurrency(selectedInvoice.amount)}</p>
                </div>
              </div>

              {/* KHU VỰC MÃ QR GIẢ LẬP */}
              <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-3xl mb-6 relative group">
                {/* Thay thế ảnh này bằng thẻ <img> chứa mã VietQR hoặc ZaloPay thực tế khi tích hợp */}
                <div className="w-48 h-48 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                  <QrCode size={64} className="mb-2" />
                  <span className="text-xs font-medium">Mã QR VietQR/ZaloPay</span>
                </div>

                {/* Hiệu ứng quét mô phỏng */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent h-1/2 rounded-3xl animate-[bounce_2s_infinite]"></div>
              </div>

              <p className="text-sm text-center text-gray-600 mb-8 max-w-[250px]">
                Mở ứng dụng Ngân hàng hoặc ZaloPay để quét mã. Giao dịch sẽ được cập nhật tự động.
              </p>

              <button
                disabled={isProcessing}
                onClick={handleConfirmPayment}
                className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95 disabled:bg-gray-400"
              >
                {isProcessing ? (
                  <>Chờ một lát...</>
                ) : (
                  <>
                    Tôi đã chuyển khoản xong <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentPortal;
