import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Calendar as CalendarIcon,
  Filter,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Mail,
  CheckSquare,
  QrCode,
  X,
  Lock,
  RefreshCw,
} from 'lucide-react';
import Button from '../../../../components/Button';
import PageHeader from '../../../../components/PageHeader';
import ConfirmModal from '../../../../components/ConfirmModal';
import GlobalLoading from '../../../../components/Loading';
import { formatCurrency } from '../../../../utils/format.util';
import type { IPayroll } from '../../../../types/payRoll.type';

import useFetch from '../../../../hooks/useFetch';
import { payrollService } from '../../../../services/payRoll.service';

const formatMonthDisplay = (monthValue: string) => {
  const [year, month] = monthValue.split('-');
  return `${month}/${year}`;
};

const PayrollManager = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(`${year}-${String(month).padStart(2, '0')}`);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isActioning, setIsActioning] = useState(false);
  const [actionText, setActionText] = useState('');

  // State Modal Edit
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    payload: IPayroll | null;
    tempAllowance: number;
    tempDeduction: number;
  }>({ isOpen: false, payload: null, tempAllowance: 0, tempDeduction: 0 });

  const {
    data: payrollData,
    error,
    loading,
    refetch: fetchPayrollData,
  } = useFetch(payrollService.getPayrolls, { month: selectedMonth }, [selectedMonth]);

  const [qrModal, setQrModal] = useState<{ isOpen: boolean; payload: IPayroll | null }>({
    isOpen: false,
    payload: null,
  });

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'danger' | 'warning' | 'info',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    onConfirm: () => {},
  });

  const closeConfirm = () => setConfirmConfig((prev) => ({ ...prev, isOpen: false }));

  const filteredData = useMemo(() => {
    return payrollData?.filter((item) => {
      const keyword = searchTerm.toLowerCase();

      const matchSearch = (item?.userId?.fullName ?? '').toLowerCase().includes(keyword);

      const matchRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'STAFF' && item.payrollType === 'STAFF') ||
        (roleFilter === 'TEACHER' && item.payrollType.includes('TEACHER'));

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [payrollData, searchTerm, roleFilter, statusFilter]);

  // ---- SUMMARY STATS ----
  const totalPayroll = filteredData?.reduce((sum, item) => sum + item.totalSalary, 0);
  const totalEmployees = filteredData?.length;
  const totalHours = filteredData?.reduce((sum, item) => sum + (item.metrics.teachingHours || 0), 0);
  const paidCount = filteredData?.filter((i) => i.status === 'PAID').length;
  const pendingCount = filteredData?.filter((i) => i.status === 'PENDING').length;

  // ---- SELECT ----
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredData?.filter((item) => item.status === 'PENDING').map((item) => item._id) || []);
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (id: string, status: string) => {
    if (status === 'PAID') return;
    setSelectedRowIds((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
  };

  // ---- ACTIONS ----
  const handleSendPayslips = () => {
    if (selectedRowIds.length === 0) {
      setConfirmConfig({
        isOpen: true,
        title: 'Lưu ý',
        type: 'warning',
        message: 'Vui lòng tích chọn ít nhất 1 nhân sự để gửi email.',
        confirmText: 'Đã hiểu',
        cancelText: '',
        onConfirm: closeConfirm,
      });
      return;
    }
    setConfirmConfig({
      isOpen: true,
      title: 'Gửi thông báo phiếu lương',
      type: 'info',
      message: `Hệ thống sẽ gửi email phiếu lương tháng ${formatMonthDisplay(selectedMonth)} đến ${selectedRowIds.length} nhân sự đã chọn.\n\nBạn có chắc chắn muốn gửi?`,
      confirmText: 'Xác nhận gửi',
      cancelText: 'Hủy bỏ',
      onConfirm: () => {
        sendPayslipEmail(selectedRowIds);
        closeConfirm();
        setSelectedRowIds([]);
        fetchPayrollData();
      },
    });
  };

  const sendPayslipEmail = async (payrollIds: string[]) => {
    setActionText('Đang gửi email phiếu lương...');
    setIsActioning(true);
    try {
      const response = await payrollService.sendPayrollEmail(payrollIds);
      if (response.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          type: 'success',
          message: response.message,
          confirmText: 'Đóng',
          cancelText: '',
          onConfirm: () => {
            closeConfirm();
            setSelectedRowIds([]);
            fetchPayrollData();
          },
        });
      } else {
        setConfirmConfig({
          isOpen: true,
          title: 'Lỗi',
          type: 'danger',
          message: response.message || 'Đã có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.',
          confirmText: 'Đóng',
          cancelText: '',
          onConfirm: closeConfirm,
        });
      }
    } catch (error) {
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        type: 'danger',
        message: `Đã có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.\n\nChi tiết lỗi: ${(error as Error).message}`,
        confirmText: 'Đóng',
        cancelText: '',
        onConfirm: closeConfirm,
      });
    } finally {
      setIsActioning(false);
    }
  };

  const handleMarkAsPaidBatch = async () => {
    if (selectedRowIds.length === 0) {
      setConfirmConfig({
        isOpen: true,
        title: 'Lưu ý',
        type: 'warning',
        message: 'Vui lòng tích chọn ít nhất 1 nhân sự để xác nhận đã trả lương.',
        confirmText: 'Đã hiểu',
        cancelText: '',
        onConfirm: closeConfirm,
      });
      return;
    }
    const pendingSelected = payrollData?.filter((p) => selectedRowIds.includes(p._id) && p.status === 'PENDING').length;
    if (pendingSelected === 0) {
      setConfirmConfig({
        isOpen: true,
        title: 'Lưu ý',
        type: 'warning',
        message: 'Các nhân sự bạn chọn đều đã được thanh toán rồi.',
        confirmText: 'Đóng',
        cancelText: '',
        onConfirm: closeConfirm,
      });
      return;
    }
    try {
      const response = await payrollService.markPayrollsAsPaid(selectedRowIds);
      if (response.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Xác nhận đã chi trả',
          type: 'info',
          message: `Bạn xác nhận đã chuyển khoản thành công cho ${pendingSelected} nhân sự?\n\nSau khi xác nhận, bản ghi sẽ bị khoá (đóng băng) và hệ thống sẽ tự động tạo phiếu chi vào sổ thu chi.`,
          confirmText: 'Đã thanh toán',
          cancelText: 'Hủy bỏ',
          onConfirm: () => {
            setConfirmConfig({
              isOpen: true,
              title: 'Thành công',
              type: 'success',
              message: response.message || 'Đã cập nhật trạng thái thanh toán thành công.',
              confirmText: 'Đóng',
              cancelText: '',
              onConfirm: () => {
                closeConfirm();
                setSelectedRowIds([]);
              },
            });
          },
        });
        fetchPayrollData();
      }
    } catch (error) {
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        type: 'danger',
        message: `Đã có lỗi xảy ra khi cập nhật trạng thái bảng lương. Vui lòng thử lại sau hoặc liên hệ bộ phận IT.\n\nChi tiết lỗi: ${(error as Error).message}`,
        confirmText: 'Đóng',
        cancelText: '',
        onConfirm: closeConfirm,
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      const fileExcelBlob = await payrollService.exportPayrollToExcel(selectedMonth);
      const url = window.URL.createObjectURL(fileExcelBlob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bang_Luong_Thang_${selectedMonth}.xlsx`);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi xuất Excel:', error);
      alert('Có lỗi xảy ra khi xuất file Excel!');
    }
  };

  const handleMarkAsPaidSingle = async (id: string) => {
    setQrModal({ isOpen: false, payload: null });
    try {
      const response = await payrollService.updatePayroll(id, { status: 'PAID' });
      if (response.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          type: 'success',
          message: 'Đã ghi nhận chuyển khoản thành công! Bản ghi đã được khoá và phiếu chi đã được tạo tự động.',
          confirmText: 'Tuyệt vời',
          cancelText: '',
          onConfirm: closeConfirm,
        });

        fetchPayrollData();
      }
    } catch (error) {
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        type: 'danger',
        message: `Đã có lỗi xảy ra khi cập nhật trạng thái bảng lương. Vui lòng thử lại sau hoặc liên hệ bộ phận IT.\n\nChi tiết lỗi: ${(error as Error).message}`,
        confirmText: 'Đóng',
        cancelText: '',
        onConfirm: closeConfirm,
      });
    }
  };

  const handleCreatePayrollForMonth = async (month: string) => {
    setActionText('Đang tính lương, vui lòng chờ...');
    setIsActioning(true);
    try {
      const dataPayrolls = await payrollService.generatePayrollForMonth(month);
      if (dataPayrolls.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          type: 'success',
          message: `Hệ thống đã tổng hợp và tạo mới bảng lương tháng ${formatMonthDisplay(month)} cho toàn bộ nhân sự.\n\nTổng cộng có ${dataPayrolls.count} bản ghi đã được tạo/cập nhật.`,
          confirmText: 'Đóng',
          cancelText: '',
          onConfirm: closeConfirm,
        });
        fetchPayrollData();
      }
    } catch (error) {
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        type: 'danger',
        message: `Đã có lỗi xảy ra khi tạo bảng lương cho tháng ${formatMonthDisplay(month)}. Vui lòng thử lại sau hoặc liên hệ bộ phận IT.\n\nChi tiết lỗi: ${(error as Error).message}`,
        confirmText: 'Đóng',
        cancelText: '',
        onConfirm: closeConfirm,
      });
    } finally {
      setIsActioning(false);
    }
  };

  const handleRecalculatePayroll = () => {
    if (selectedRowIds.length === 0) {
      setConfirmConfig({
        isOpen: true,
        title: 'Lưu ý',
        type: 'warning',
        message: 'Vui lòng tích chọn ít nhất 1 nhân sự để tính lại lương.',
        confirmText: 'Đã hiểu',
        cancelText: '',
        onConfirm: closeConfirm,
      });
      return;
    }
    setConfirmConfig({
      isOpen: true,
      title: 'Tính lại lương cho nhân sự đã chọn',
      type: 'info',
      message: `Hệ thống sẽ tính lại lương tháng ${formatMonthDisplay(selectedMonth)} cho ${selectedRowIds.length} nhân sự đã tích.\n\nDữ liệu sẽ được cập nhật theo chấm công và giờ dạy mới nhất. Bạn có chắc chắn?`,
      confirmText: 'Bắt đầu tính lại',
      cancelText: 'Hủy',
      onConfirm: () => {
        closeConfirm();
        recalculatePayrollForSelected();
      },
    });
  };

  const recalculatePayrollForSelected = async () => {
    setActionText('Đang tính lại lương, vui lòng chờ...');
    setIsActioning(true);
    console.log('selectedRowIds:', selectedRowIds);
    console.log('selectedMonth:', selectedMonth);
    try {
      const result = await payrollService.generatePayrollForUsers(selectedRowIds, selectedMonth);

      if (result.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          type: 'success',
          message: `Đã tính lại lương tháng ${formatMonthDisplay(selectedMonth)} cho ${result.count} nhân sự.\n\n${result.message ?? ''}`,
          confirmText: 'Đóng',
          cancelText: '',
          onConfirm: () => {
            closeConfirm();
            setSelectedRowIds([]);
            fetchPayrollData();
          },
        });
      }
    } catch (error) {
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        type: 'danger',
        message: `Đã có lỗi xảy ra khi tính lại lương. Vui lòng thử lại sau hoặc liên hệ bộ phận IT.\n\nChi tiết lỗi: ${(error as Error).message}`,
        confirmText: 'Đóng',
        cancelText: '',
        onConfirm: closeConfirm,
      });
    } finally {
      setIsActioning(false);
    }
  };

  const handleUpdatePayroll = async (id?: string) => {
    setActionText('Đang cập nhật bảng lương, vui lòng chờ...');
    setIsActioning(true);
    const data = await payrollService.getPayrollById(id || '');
    try {
      if (!data.success || !data.data) return;
      const payload = {
        allowance: editModal.tempAllowance,
        deduction: editModal.tempDeduction,
      };

      const updateData = await payrollService.updatePayroll(id as string, payload);
      if (updateData.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          type: 'success',
          message: updateData.message || 'Đã cập nhật bảng lương thành công.',
          confirmText: 'Đóng',
          cancelText: '',
          onConfirm: () => {
            closeConfirm();
            setEditModal({ isOpen: false, payload: null, tempAllowance: 0, tempDeduction: 0 });
            fetchPayrollData();
          },
        });
      }
    } catch (error) {
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        type: 'danger',
        message: `Đã có lỗi xảy ra khi cập nhật bảng lương. Vui lòng thử lại sau hoặc liên hệ bộ phận IT.\n\nChi tiết lỗi: ${(error as Error).message}`,
        confirmText: 'Đóng',
        cancelText: '',
        onConfirm: closeConfirm,
      });
    } finally {
      setIsActioning(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'PAID') {
      return (
        <span className="flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
          <CheckCircle2 size={13} /> Đã thanh toán
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 shadow-sm">
        <AlertCircle size={13} /> Chờ thanh toán
      </span>
    );
  };

  const renderSalaryBreakdown = (item: IPayroll) => {
    if (item.payrollType === 'STAFF') {
      return (
        <div className="text-xs space-y-1">
          <p className="text-gray-600">
            <span className="font-medium">Lương cứng:</span> {formatCurrency(item.baseSalary)}
          </p>
          <p className="text-blue-600">
            <span className="font-medium">Ngày công:</span> {item.metrics.actualDays}/{item.metrics.standardDays} ngày
          </p>
        </div>
      );
    }
    if (item.payrollType === 'TEACHER_FULL_TIME') {
      const overtime = Math.max(0, item.metrics.teachingHours - (item.metrics.standardHours || 0));
      return (
        <div className="text-xs space-y-1">
          <p className="text-gray-600">
            <span className="font-medium">Lương cứng:</span> {formatCurrency(item.baseSalary)}
          </p>
          <p className="text-indigo-600">
            <span className="font-medium">Giờ dạy:</span> {item.metrics.teachingHours}h / định mức{' '}
            {item.metrics.standardHours}h
          </p>
          {overtime > 0 && (
            <p className="text-emerald-600">
              <span className="font-medium">Vượt giờ:</span> +{overtime}h × {formatCurrency(item.hourlyRate)}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="text-xs space-y-1">
        <p className="text-gray-600">
          <span className="font-medium">Thù lao:</span> {formatCurrency(item.hourlyRate)}/h
        </p>
        <p className="text-indigo-600">
          <span className="font-medium">Tổng giờ dạy:</span> {item.metrics.teachingHours}h
        </p>
      </div>
    );
  };

  const pendingSelectableCount = filteredData?.filter((i) => i.status === 'PENDING').length;
  if (pendingSelectableCount === undefined) return null;
  const allPendingSelected = pendingSelectableCount > 0 && selectedRowIds.length === pendingSelectableCount;

  return (
    <div className="p-8 pb-24 w-full min-h-screen bg-gray-50/50">
      {isActioning && <GlobalLoading text={isActioning ? actionText : 'Đang tải dữ liệu...'} />}
      {qrModal.isOpen && qrModal.payload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
          onClick={() => setQrModal({ isOpen: false, payload: null })}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-blue-600 p-5 text-white text-center relative">
              <button
                onClick={() => setQrModal({ isOpen: false, payload: null })}
                className="absolute top-4 right-4 hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="font-bold text-lg mb-1">Mã QR Chuyển khoản</h3>
              <p className="text-xs text-blue-100">Quét bằng ứng dụng ngân hàng</p>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm mb-5">
                <img
                  src={`https://img.vietqr.io/image/${qrModal.payload.bankInfo?.bankBin}-${qrModal.payload.bankInfo?.accountNo}-compact2.png?amount=${qrModal.payload.totalSalary}&addInfo=${encodeURIComponent('Thanh toan luong T' + formatMonthDisplay(selectedMonth))}&accountName=${encodeURIComponent(qrModal.payload.bankInfo?.accountName || '')}`}
                  alt="VietQR"
                  className="w-64 h-64 object-contain rounded-xl"
                />
              </div>

              <div className="w-full bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm space-y-2 mb-6">
                <div className="flex justify-between items-center pb-2 border-b border-blue-100/50">
                  <span className="text-blue-600/70 font-medium">Người nhận</span>
                  <span className="font-bold text-blue-900">{qrModal.payload.bankInfo?.accountName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-blue-100/50">
                  <span className="text-blue-600/70 font-medium">Ngân hàng</span>
                  <span className="font-bold text-blue-900">{qrModal.payload.bankInfo?.bankName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-blue-100/50">
                  <span className="text-blue-600/70 font-medium">Số tài khoản</span>
                  <span className="font-bold text-blue-900 font-mono tracking-wider">
                    {qrModal.payload.bankInfo?.accountNo}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-blue-600/70 font-medium">Số tiền</span>
                  <span className="font-black text-lg text-blue-700">
                    {formatCurrency(qrModal.payload.totalSalary)}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full py-3.5 rounded-xl shadow-lg shadow-blue-600/20 text-base"
                onClick={() => handleMarkAsPaidSingle(qrModal.payload!._id)}
              >
                Tôi đã chuyển khoản xong
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
      />

      <PageHeader title={`Quản lý Bảng lương — Tháng ${formatMonthDisplay(selectedMonth)}`} />

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Tổng quỹ lương</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalPayroll || 0)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Nhân sự nhận lương</p>
            <p className="text-2xl font-bold text-gray-800">
              {totalEmployees} <span className="text-sm font-normal text-gray-500">người</span>
            </p>

            <p className="text-xs text-gray-400 mt-0.5">
              <span className="text-emerald-500 font-semibold">{paidCount} đã trả</span>
              {' · '}
              <span className="text-amber-500 font-semibold">{pendingCount} chờ duyệt</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Tổng giờ giảng dạy</p>
            <p className="text-2xl font-bold text-gray-800">
              {totalHours} <span className="text-sm font-normal text-gray-500">giờ</span>
            </p>
          </div>
        </div>
      </div>

      {/* ===== TOOLBAR ===== */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex gap-3 items-center flex-wrap flex-1">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 focus-within:border-blue-500 transition-colors">
            <CalendarIcon size={18} className="text-gray-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedRowIds([]);
              }}
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 w-32 cursor-pointer"
            />
          </div>

          <Button
            variant="primary"
            className="bg-blue-600 hover:bg-blue-700 shadow-sm px-4 py-2 text-sm rounded-xl"
            icon={<Calculator size={16} />}
            onClick={() => {
              setConfirmConfig({
                isOpen: true,
                title: 'Khởi tạo Bảng lương',
                type: 'info',
                message: `Hệ thống sẽ tổng hợp dữ liệu chấm công, giờ dạy và tạo bảng lương tháng ${formatMonthDisplay(selectedMonth)} cho toàn bộ nhân sự.\n\nLưu ý: Bản ghi đã tồn tại sẽ được cập nhật lại theo dữ liệu mới nhất. Các bản ghi đã "Đã thanh toán" sẽ không bị ghi đè.`,
                confirmText: 'Bắt đầu tính',
                cancelText: 'Hủy',
                onConfirm: () => {
                  closeConfirm();
                  handleCreatePayrollForMonth(selectedMonth);
                },
              });
            }}
          >
            Tính lương tháng này
          </Button>

          <div className="w-px h-8 bg-gray-200" />

          {/* Tìm kiếm */}
          <div className="relative w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm nhân sự..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Lọc phòng ban */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setSelectedRowIds([]);
              }}
              className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">Tất cả phòng ban</option>
              <option value="STAFF">Khối Văn phòng</option>
              <option value="TEACHER">Khối Giáo viên</option>
            </select>
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Lọc trạng thái */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setSelectedRowIds([]);
              }}
              className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
            </select>
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={<RefreshCw size={18} />}
            onClick={handleRecalculatePayroll}
            className={`transition-all ${
              selectedRowIds.length > 0
                ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 shadow-sm'
                : 'text-gray-400 border-gray-200'
            }`}
          >
            Tính lại lương {selectedRowIds.length > 0 ? `(${selectedRowIds.length})` : ''}
          </Button>
          <Button
            variant="outline"
            icon={<Mail size={18} />}
            onClick={handleSendPayslips}
            className={`transition-all ${selectedRowIds.length > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 shadow-sm' : 'text-gray-400 border-gray-200'}`}
          >
            Gửi Mail {selectedRowIds.length > 0 ? `(${selectedRowIds.length})` : ''}
          </Button>
          <Button
            variant="outline"
            icon={<CheckSquare size={18} />}
            onClick={handleMarkAsPaidBatch}
            className={`transition-all ${selectedRowIds.length > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-sm' : 'text-gray-400 border-gray-200'}`}
          >
            Đã trả lương {selectedRowIds.length > 0 ? `(${selectedRowIds.length})` : ''}
          </Button>
          <Button variant="primary" icon={<Download size={18} />}>
            <span onClick={handleExportExcel}>Xuất Excel</span>
          </Button>
        </div>
      </div>

      {/* ===== BẢNG LƯƠNG ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto mb-12">
        <table className="w-full text-left border-collapse min-w-[1000px] sticky top-0 z-10">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200 sticky top-0 z-10">
              <th className="p-4 font-semibold w-12 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={allPendingSelected}
                  onChange={handleSelectAll}
                  disabled={pendingSelectableCount === 0}
                />
              </th>
              <th className="p-4 font-semibold">Nhân sự</th>
              <th className="p-4 font-semibold w-64">Chi tiết Thông số / Công thức</th>
              <th className="p-4 font-semibold text-right">Phụ cấp / Thưởng</th>
              <th className="p-4 font-semibold text-right text-red-500">Khấu trừ / Phạt</th>
              <th className="p-4 font-semibold text-right text-blue-700">Thực lãnh (VNĐ)</th>
              <th className="p-4 font-semibold text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData && filteredData.length > 0 ? (
              filteredData &&
              filteredData.map((item) => {
                const isPaid = item.status === 'PAID';
                const isSelected = selectedRowIds.includes(item._id);

                return (
                  <tr
                    key={item._id}
                    className={`transition-colors ${
                      isPaid ? 'bg-gray-50/60 opacity-75' : isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="p-4 text-center">
                      {isPaid ? (
                        <Lock size={14} className="text-gray-300 mx-auto" />
                      ) : (
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={isSelected}
                          onChange={() => handleSelectRow(item._id, item.status)}
                        />
                      )}
                    </td>

                    {/* Nhân sự */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-semibold text-gray-800">{item.userId?.fullName ?? 'N/A'}</div>
                          <div className="flex gap-1">
                            <div className="text-xs text-gray-500 mt-0.5">{item.roleName}</div>
                            {item.isEmailSent && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-500 border border-indigo-100 shrink-0">
                                <Mail size={10} /> Đã gửi
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">{renderSalaryBreakdown(item)}</td>

                    {/* Phụ cấp */}
                    <td className="p-4 text-right">
                      {item.allowance > 0 ? (
                        <span className="text-sm font-medium text-emerald-600">+{formatCurrency(item.allowance)}</span>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </td>

                    {/* Khấu trừ */}
                    <td className="p-4 text-right">
                      {item.deduction > 0 ? (
                        <span className="text-sm font-medium text-red-500">-{formatCurrency(item.deduction)}</span>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </td>

                    {/* Thực lãnh + Action buttons */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`text-lg font-bold ${isPaid ? 'text-gray-500' : 'text-gray-800'}`}>
                          {formatCurrency(item.totalSalary)}
                        </span>

                        {!isPaid && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditModal({
                                  isOpen: true,
                                  payload: item,
                                  tempAllowance: item.allowance,
                                  tempDeduction: item.deduction,
                                });
                              }}
                              className="p-2 bg-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white rounded-lg transition-colors shadow-sm"
                              title="Điều chỉnh Phụ cấp / Khấu trừ"
                            >
                              <Calculator size={16} />
                            </button>

                            {item.bankInfo && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQrModal({ isOpen: true, payload: item });
                                }}
                                className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors shadow-sm"
                                title="Tạo mã VietQR chuyển khoản nhanh"
                              >
                                <QrCode size={16} />
                              </button>
                            )}
                          </div>
                        )}

                        {/* PAID: hiển thị icon khoá thay thế nút */}
                        {isPaid && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                            <Lock size={11} />
                            <span>Đã khoá</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="p-4 text-center">
                      <div className="flex justify-center">{renderStatusBadge(item.status)}</div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-500 italic">
                  Không tìm thấy nhân sự nào khớp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editModal.isOpen && editModal.payload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
          onClick={() => setEditModal({ ...editModal, isOpen: false })}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-800">Điều chỉnh lương</h3>
              <button
                onClick={() => setEditModal({ ...editModal, isOpen: false })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6 bg-blue-50 p-4 rounded-xl text-blue-800">
              <p className="font-semibold">{editModal.payload.userId?.fullName || 'N/A'}</p>
              <p className="text-sm opacity-80">{editModal.payload.roleName}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phụ cấp / Thưởng (VNĐ)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editModal.tempAllowance}
                  onChange={(e) => setEditModal({ ...editModal, tempAllowance: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-red-600 mb-1">Khấu trừ / Phạt (VNĐ)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  value={editModal.tempDeduction}
                  onChange={(e) => setEditModal({ ...editModal, tempDeduction: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="pt-4 border-t flex justify-between items-center">
                <span className="font-medium text-gray-600">Lương thực lãnh mới:</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(
                    editModal.payload.totalSalary -
                      editModal.payload.allowance +
                      editModal.payload.deduction +
                      editModal.tempAllowance -
                      editModal.tempDeduction,
                  )}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="w-full py-3"
                onClick={() => setEditModal({ ...editModal, isOpen: false })}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                className="w-full py-3 shadow-lg"
                onClick={() => {
                  setEditModal({ ...editModal, isOpen: false });
                  handleUpdatePayroll(editModal.payload?._id as string);
                }}
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManager;
