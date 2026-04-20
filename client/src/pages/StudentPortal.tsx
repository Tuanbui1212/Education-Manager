import { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  BookOpen,
  Calendar,
  CreditCard,
  User,
  MapPin,
  QrCode,
  X,
  CheckCircle2,
  ShieldCheck,
  UserIcon,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  ClipboardList,
} from 'lucide-react';
import { startOfWeek, addDays, subWeeks, addWeeks, format, isSameDay } from 'date-fns';

import { vi } from 'date-fns/locale';
import { ClassStatus } from '../types/class.type';

import { PATHS } from '../utils/constants';
import { CLASS_STATUS_CONFIG } from '../utils/constants';
import { getDecodedToken } from '../utils/auth';

import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';

import { classService } from '../services/class.service';
import { scheduleService } from '../services/schedule.service';
import { shiftService } from '../services/shift.service';
import { invoiceService } from '../services/invoice.service';
import { paymentService } from '../services/payment.service';

const MOCK_INVOICES = [
  { id: 'inv1', title: 'Học phí Tiếng Anh (Tháng 10)', amount: 2500000, dueDate: '2023-10-15', status: 'PENDING' },
  { id: 'inv2', title: 'Giáo trình & Đồng phục', amount: 450000, dueDate: '2023-10-20', status: 'PARTIAL' },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// --- COMPONENT CHÍNH ---
const StudentPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activeTab, setActiveTab] = useState<'classes' | 'timetable' | 'invoices'>('classes');

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const handleClassClick = (cls: any) => {
    navigate(PATHS.STUDENT_ATTENDANCE.replace(':id', cls._id));
  };

  const currentUser = getDecodedToken();
  const { data: classesRaw, totalCount } = useFetch(classService.getClassesByStudentId, currentUser?.id, [
    currentUser?.id,
  ]);

  const classesData = useMemo(() => {
    if (!classesRaw) return [];
    if (!debouncedSearch.trim()) return classesRaw;
    const q = debouncedSearch.toLowerCase();
    return classesRaw.filter((cls: any) => cls.name?.toLowerCase().includes(q));
  }, [classesRaw, debouncedSearch]);

  const handlePrevWeek = () => setCurrentWeekStart((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeekStart((prev) => addWeeks(prev, 1));
  const handleCurrentWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const { data: shiftsData } = useFetch(shiftService.getShifts, { limit: 100 }, []);
  const shiftsList = useMemo(() => {
    const list = Array.isArray(shiftsData) ? shiftsData : (shiftsData as any)?.data || [];
    return list.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
  }, [shiftsData]);

  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const {
    data: invoicesRaw,
    loading: invoiceLoading,
    refetch: fetchInvoices,
  } = useFetch(invoiceService.getInvoicesByStudentId, { studentId: currentUser?.id }, [currentUser?.id]);

  const pendingInvoices = useMemo(() => {
    if (!invoicesRaw) return [];

    return invoicesRaw.filter((inv: any) => ['UNPAID', 'PARTIAL', 'OVERDUE'].includes(inv.status));
  }, [invoicesRaw]);

  console.log('invoicesRaw', invoicesRaw);

  useEffect(() => {
    if (!classesData || !Array.isArray(classesData) || classesData.length === 0) {
      setScheduleData([]);
      return;
    }
    const fetchAllSchedules = async () => {
      setScheduleLoading(true);
      try {
        const promises = classesData.map((cls: any) => scheduleService.getSchedules({ classId: cls._id, limit: 1000 }));
        const results = await Promise.all(promises);
        const allSchedules = results.flatMap((result: any) => {
          return Array.isArray(result) ? result : result.data || [];
        });
        setScheduleData(allSchedules);
      } catch (error) {
        console.error('Lỗi tải lịch học:', error);
      } finally {
        setScheduleLoading(false);
      }
    };
    fetchAllSchedules();
  }, [classesData, currentWeekStart]);

  const getScheduleForCell = (date: Date, shiftId: string) => {
    return scheduleData?.find((schedule: any) => {
      const scheduleDate = new Date(schedule.date);
      const isSameDate = isSameDay(scheduleDate, date);
      const isSameShift =
        typeof schedule.shiftId === 'object' ? schedule.shiftId._id === shiftId : schedule.shiftId === shiftId;
      return isSameDate && isSameShift;
    });
  };

  const handlePaymentWithVNPAY = async (invoiceId: string) => {
    try {
      setIsProcessing(true);
      const response = await paymentService.createVnpayUrl(invoiceId);
      const paymentUrl = response.data?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error('Lỗi: Không lấy được đường dẫn thanh toán!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi kết nối VNPAY');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayInstallment = async (invoiceId: string) => {
    try {
      setIsProcessing(true);
      const response = await paymentService.createVnpayUrlForInstallment(invoiceId);
      const paymentUrl = response.data?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error('Lỗi: Không lấy được đường dẫn thanh toán!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi kết nối VNPAY');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const rspCode = searchParams.get('vnp_ResponseCode');

    if (rspCode) {
      if (rspCode === '00') {
        toast.success('Thanh toán học phí thành công! Hệ thống đã ghi nhận.');
        fetchInvoices();
      } else {
        toast.error('Giao dịch thanh toán đã bị hủy hoặc thất bại.');
      }

      const paramsToClear = [
        'vnp_Amount',
        'vnp_BankCode',
        'vnp_BankTranNo',
        'vnp_CardType',
        'vnp_OrderInfo',
        'vnp_PayDate',
        'vnp_ResponseCode',
        'vnp_TmnCode',
        'vnp_TransactionNo',
        'vnp_TransactionStatus',
        'vnp_TxnRef',
        'vnp_SecureHash',
      ];

      paramsToClear.forEach((param) => searchParams.delete(param));

      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, fetchInvoices]);

  return (
    <>
      <>
        <section className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <ShieldCheck size={250} />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Xin chào! 👋</h2>
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
                  <p className="text-2xl font-bold">{totalCount} Lớp</p>
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

        {/* --- TABS NAVIGATION --- */}
        <div className="flex mb-8 mt-6 overflow-x-auto custom-scrollbar pb-2">
          <div className="bg-white border border-gray-200 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-xs">
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-6 py-2.5 cursor-pointer rounded-xl justify-center min-w-[140px] text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'classes'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 active:scale-95'
              }`}
            >
              <BookOpen size={18} />
              Lớp học
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-6 py-2.5 cursor-pointer rounded-xl justify-center min-w-[140px] text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'timetable'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 active:scale-95'
              }`}
            >
              <CalendarIcon size={18} />
              Lịch học
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-6 py-2.5 cursor-pointer rounded-xl justify-center min-w-[140px] text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'invoices'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600 active:scale-95'
              }`}
            >
              <CreditCard size={18} />
              Học phí
            </button>
          </div>
        </div>

        {/* Classes */}
        {activeTab === 'classes' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <>
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="text-blue-600" />
                  Lớp học
                </h3>
                <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm lớp học..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classesData?.map((cls: any) => {
                  const statusCfg = CLASS_STATUS_CONFIG[cls.status] ?? CLASS_STATUS_CONFIG[ClassStatus.ACTIVE];
                  return (
                    <div
                      key={cls._id}
                      onClick={() => handleClassClick(cls)}
                      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <BookOpen size={24} />
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      <h4 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {cls.name}
                      </h4>
                      <p className="text-sm text-gray-400 font-medium mb-4">
                        {typeof cls.courseId === 'object' && cls.courseId !== null ? (cls.courseId as any).title : '—'}
                      </p>

                      <div className="space-y-2 border-t border-gray-50 pt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User size={14} className="text-gray-400 shrink-0" />
                          <span className="truncate">
                            {typeof cls.teacherId === 'object' && cls.teacherId !== null
                              ? (cls.teacherId as any).fullName
                              : 'Chưa phân công'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin size={14} className="text-gray-400 shrink-0" />
                          <span className="truncate">
                            {typeof cls.roomId === 'object' && cls.roomId !== null
                              ? (cls.roomId as any).name
                              : 'Chưa xếp phòng'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-1 text-blue-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        <ClipboardList size={15} />
                        <span>Xem lịch điểm danh</span>
                        <ChevronRight size={15} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          </section>
        )}

        {/* Timetable */}
        {activeTab === 'timetable' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex flex-wrap justify-between items-center gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Lịch học của tôi</h3>
                  <p className="text-xs text-gray-500">Quản lý các lớp học tôi đang tham gia</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-inner">
                <button
                  onClick={handlePrevWeek}
                  className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-blue-600 hover:shadow-sm"
                  title="Tuần trước"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={handleCurrentWeek}
                  className="px-4 py-2 font-bold text-sm bg-white text-blue-700 rounded-lg shadow-sm border border-blue-100"
                >
                  {format(weekDays[0], 'dd/MM/yyyy')} - {format(weekDays[6], 'dd/MM/yyyy')}
                </button>

                <button
                  onClick={handleNextWeek}
                  className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-blue-600 hover:shadow-sm"
                  title="Tuần sau"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-r border-gray-200 bg-gray-50 w-[100px] text-center font-bold text-gray-600">
                        <Clock size={18} className="mx-auto text-gray-400" />
                      </th>
                      {weekDays.map((day, index) => (
                        <th
                          key={index}
                          className="p-3 border-b border-r border-gray-200 bg-primary text-white text-center w-[12.8%]"
                        >
                          <div className="text-sm font-bold uppercase tracking-wider">
                            {format(day, 'EEEE', { locale: vi })}
                          </div>
                          <div className="text-xs text-violet-200 mt-1">{format(day, 'dd/MM/yyyy')}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleLoading ? (
                      Array.from({ length: 5 }).map((_, rIdx) => (
                        <tr key={rIdx}>
                          <td className="p-4 border-b border-r border-gray-200 bg-gray-50/50">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                          </td>
                          {Array.from({ length: 7 }).map((_, cIdx) => (
                            <td key={cIdx} className="p-2 border-b border-r border-gray-100">
                              <div className="h-24 bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : shiftsList.length > 0 ? (
                      shiftsList.map((shift: any) => (
                        <tr key={shift._id} className="group/row">
                          <td className="p-3 border-b border-r border-gray-200 bg-gray-50 text-center align-middle group-hover/row:bg-gray-100 transition-colors">
                            <div className="font-bold text-gray-700 text-sm">{shift.name}</div>
                            <div className="text-[11px] text-gray-500 font-medium mt-1 bg-white px-2 py-0.5 rounded-md border border-gray-200 inline-block shadow-sm">
                              {shift.startTime} - {shift.endTime}
                            </div>
                          </td>

                          {weekDays.map((day, index) => {
                            const cellSchedule = getScheduleForCell(day, shift._id);

                            return (
                              <td
                                key={index}
                                className="p-2 border-b border-r border-gray-100 bg-white align-top relative"
                              >
                                {cellSchedule ? (
                                  <div className="h-full bg-violet-50 border border-violet-200 rounded-xl p-3 cursor-pointer hover:bg-violet-100 hover:shadow-md transition-all group/card flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-1">
                                      <h4 className="font-bold text-sm text-violet-800 line-clamp-2 group-hover/card:text-violet-900">
                                        {cellSchedule.classId?.name || 'N/A'}
                                      </h4>
                                    </div>

                                    <div className="mt-auto space-y-1.5 pt-2 border-t border-violet-200/60">
                                      <div className="flex items-center gap-1.5 text-xs text-violet-700 font-medium">
                                        <UserIcon size={12} className="text-violet-500" />
                                        <span className="truncate">
                                          {cellSchedule.teacherId?.fullName || 'Chưa phân công'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                        <BookOpen size={12} className="text-gray-400" />
                                        <span className="truncate uppercase font-bold">{shift.name}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                        <MapPin size={12} className="text-gray-400" />
                                        <span className="truncate uppercase font-bold">
                                          {cellSchedule.roomId?.name}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  // TRỐNG LỊCH
                                  <div className="h-full min-h-[100px] rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 hover:bg-gray-50 transition-all border border-dashed border-transparent hover:border-gray-300">
                                    <span className="text-xs text-gray-400 font-medium italic">Trống</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-10 text-center text-gray-500">
                          Không có dữ liệu ca học. Vui lòng cấu hình ca học trước.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* HỌC PHÍ & THANH TOÁN */}
        {activeTab === 'invoices' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CreditCard className="text-blue-600" />
                Khoản phí chờ thanh toán
              </h3>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {pendingInvoices.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {pendingInvoices?.map((invoice, index) => (
                    <div
                      key={invoice._id}
                      className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold
                ${invoice.status === 'PARTIAL' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}
                        >
                          <span>{index + 1}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800 text-lg">{invoice.classId?.name}</h4>
                            {invoice.status === 'PARTIAL' && (
                              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-200">
                                Trả góp
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} /> Hạn chót: {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              Mã HĐ:{' '}
                              <span className="font-mono text-gray-700 font-medium">#{invoice.code.toUpperCase()}</span>
                            </span>
                          </div>

                          {invoice.status === 'PARTIAL' && invoice.installmentConfig?.nextDueDate && (
                            <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                              <Clock size={12} />
                              Hạn kỳ này:{' '}
                              <span className="font-semibold">
                                {format(new Date(invoice.installmentConfig.nextDueDate), 'dd/MM/yyyy')}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-3 md:min-w-[220px]">
                        <div className="flex flex-col md:items-end">
                          <p
                            className={`font-black text-2xl
                  ${invoice.status === 'PARTIAL' ? 'text-amber-600' : 'text-red-600'}`}
                          >
                            {formatCurrency(invoice.debt)}
                          </p>
                          {invoice.status === 'PARTIAL' && invoice.installmentConfig?.amountPerMonth && (
                            <p className="text-md text-gray-400 mt-0.5">
                              Kỳ này:{' '}
                              <span className="font-semibold text-gray-600">
                                {formatCurrency(invoice.installmentConfig.amountPerMonth)}
                              </span>
                            </p>
                          )}
                        </div>

                        {invoice.status === 'PARTIAL' ? (
                          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <button
                              onClick={() => handlePayInstallment(invoice._id)}
                              className="flex-1 md:flex-none px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-amber-500/20 text-sm"
                            >
                              <QrCode size={16} /> Trả kỳ này
                            </button>

                            <button
                              onClick={() => handlePaymentWithVNPAY(invoice._id)}
                              className="flex-1 md:flex-none px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-gray-300 text-sm"
                            >
                              <CheckCircle2 size={16} /> Tất toán
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePaymentWithVNPAY(invoice._id)}
                            className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-600/20"
                          >
                            <QrCode size={18} /> Thanh toán ngay
                          </button>
                        )}
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
        )}
      </>
    </>
  );
};

export default StudentPortal;
