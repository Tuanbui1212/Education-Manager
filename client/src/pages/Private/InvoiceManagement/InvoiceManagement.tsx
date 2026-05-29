import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Bell,
  BellRing,
  BellOff,
  Eye,
  Printer,
  RotateCcw,
  XCircle,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { formatCurrency, formatDate } from '../../../utils/format.util';
import { PATHS } from '../../../utils/constants';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';
import { invoiceService } from '../../../services/invoice.service';

import PaymentWizardModal from './PaymentWizardModal';

import TablePagination from '../../../components/TablePagination';
import ConfirmModal from '../../../components/ConfirmModal';
import SkeletonRow from '../../../components/SkeletonRow';
import EmptyState from '../../../components/EmptyState';
import StatusBadge from '../../../components/StatusBadge';

import type { IInvoice, InvoiceStatus, InvoiceConfig } from '../../../types/invoice.type';

const TABS: { id: InvoiceStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'UNPAID', label: 'Chờ thu phí' },
  { id: 'PARTIAL', label: 'Đang trả góp' },
  { id: 'OVERDUE', label: 'Quá hạn' },
  { id: 'PAID', label: 'Đã hoàn thành' },
  { id: 'CANCELLED', label: 'Đã hủy' },
  { id: 'REFUNDED', label: 'Đã hoàn tiền' },
];

const InvoiceManagement = () => {
  const navigation = useNavigate();

  const [activeTab, setActiveTab] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [prevResponse, setPrevResponse] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const [filterMinDebt, setFilterMinDebt] = useState('');
  const [filterMaxDebt, setFilterMaxDebt] = useState('');
  const [filterDueDateFrom, setFilterDueDateFrom] = useState('');
  const [filterDueDateTo, setFilterDueDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'refund' | 'cancel' | null;
    invoice: IInvoice | null;
  }>({ isOpen: false, type: null, invoice: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleRefund = async () => {
    if (!confirmModal.invoice) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await invoiceService.refundInvoice(confirmModal.invoice._id as string);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === confirmModal.invoice!._id ? { ...inv, status: 'REFUNDED' as InvoiceStatus } : inv,
        ),
      );
      setActionSuccess(`Hoàn tiền hóa đơn ${confirmModal.invoice.code} thành công!`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Hoàn tiền thất bại. Vui lòng thử lại.';
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirmModal.invoice) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await invoiceService.cancelInvoice(confirmModal.invoice._id as string);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === confirmModal.invoice!._id ? { ...inv, status: 'CANCELLED' as InvoiceStatus } : inv,
        ),
      );
      setActionSuccess(`Hủy hóa đơn ${confirmModal.invoice.code} thành công!`); // ← thêm dòng này
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Hủy hóa đơn thất bại. Vui lòng thử lại.';
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const debouncedMinDebt = useDebounce(filterMinDebt, 500);
  const debouncedMaxDebt = useDebounce(filterMaxDebt, 500);
  const debouncedDueDateFrom = useDebounce(filterDueDateFrom, 500);
  const debouncedDueDateTo = useDebounce(filterDueDateTo, 500);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const queryParams = {
    page,
    limit,
    ...(activeTab !== 'ALL' && { status: activeTab }),
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    ...(debouncedMinDebt && { minDebt: debouncedMinDebt }),
    ...(debouncedMaxDebt && { maxDebt: debouncedMaxDebt }),
    ...(debouncedDueDateFrom && { dueDateFrom: debouncedDueDateFrom }),
    ...(debouncedDueDateTo && { dueDateTo: debouncedDueDateTo }),
  };

  const {
    data: response,
    loading,
    totalCount,
    refetch,
  } = useFetch(invoiceService.getInvoices, queryParams, [
    activeTab,
    page,
    limit,
    debouncedMinDebt,
    debouncedMaxDebt,
    debouncedDueDateFrom,
    debouncedDueDateTo,
    debouncedSearchTerm,
  ]);

  const totalPages = Math.ceil((totalCount || 0) / limit);
  if (response !== prevResponse) {
    setPrevResponse(response);

    const resData = response as any;
    let fetchedList: any[] = [];

    if (Array.isArray(resData)) {
      fetchedList = resData;
    } else if (resData?.invoices && Array.isArray(resData.invoices)) {
      fetchedList = resData.invoices;
    } else if (resData?.data && Array.isArray(resData.data)) {
      fetchedList = resData.data;
    } else if (resData?.data?.invoices && Array.isArray(resData.data.invoices)) {
      fetchedList = resData.data.invoices;
    }

    setInvoices(fetchedList.filter(Boolean));
  }

  const handlePaymentSuccess = (
    id: string,
    newDebt: number,
    newStatus: InvoiceStatus,
    newConfig?: InvoiceConfig,
    newRemindCount?: number,
    newLastRemindedAt?: string,
  ) => {
    setInvoices(
      invoices.map((inv) =>
        inv?._id === id
          ? ({
            ...inv,
            debt: newDebt,
            status: newStatus,
            ...(newConfig && { installmentConfig: newConfig }),
            ...(newRemindCount !== undefined && { remindCount: newRemindCount }),
            ...(newLastRemindedAt !== undefined && { lastRemindedAt: newLastRemindedAt as any }),
          } as unknown as IInvoice)
          : inv,
      ),
    );
  };

  const renderNotificationBadge = (inv: IInvoice) => {
    if (inv.status === 'PAID' || inv.status === ('CANCELLED' as any) || inv.status === ('REFUNDED' as any)) {
      return null;
    }

    const lastRemindedDate = inv?.lastRemindedAt ? new Date(inv.lastRemindedAt) : null;
    const now = new Date();
    const daysSinceLastRemind = lastRemindedDate
      ? (now.getTime() - lastRemindedDate.getTime()) / (1000 * 3600 * 24)
      : null;
    const canRemind = daysSinceLastRemind === null || daysSinceLastRemind >= 5;

    if (!inv.remindCount || inv.remindCount === 0) {
      return (
        <div className="flex items-center gap-1 mt-1.5 justify-center text-[10px] font-medium text-gray-400">
          <Bell size={12} /> Chưa nhắc nợ
        </div>
      );
    }

    if (canRemind) {
      return (
        <div
          className="flex items-center gap-1 mt-1.5 justify-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 mx-auto w-fit shadow-sm"
          title={`Đã nhắc nợ ${inv.remindCount} lần. Có thể nhắc tiếp.`}
        >
          <BellRing size={12} /> Sẵn sàng nhắc
        </div>
      );
    } else {
      const daysLeft = Math.ceil(5 - daysSinceLastRemind!);
      return (
        <div
          className="flex items-center gap-1 mt-1.5 justify-center text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200 mx-auto w-fit shadow-sm"
          title={`Đã nhắc nợ ${inv.remindCount} lần. Phải chờ thêm ${daysLeft} ngày.`}
        >
          <BellOff size={12} /> Chờ {daysLeft} ngày
        </div>
      );
    }
  };

  const isFiltering = filterMinDebt || filterMaxDebt || filterDueDateFrom || filterDueDateTo;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 xl:p-8 2xl:px-12">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1700px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl xl:text-3xl font-bold text-gray-900">Quản lý Công nợ</h1>
            <p className="text-sm xl:text-base text-gray-500 mt-1">Hệ thống theo dõi dòng tiền kế toán</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isFiltering ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
            >
              <Filter size={16} />
              Lọc{' '}
              {isFiltering &&
                `(${[filterMinDebt, filterMaxDebt, filterDueDateFrom, filterDueDateTo].filter(Boolean).length})`}
            </button>
            <div className="relative flex-1 sm:w-64 xl:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm HD, Tên HV..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {showFilter && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 xl:p-5 shadow-sm">
            <div className="flex flex-wrap xl:grid xl:grid-cols-5 gap-4 items-end">
              {/* Khoảng nợ */}
              <div className="flex flex-col gap-1 min-w-[140px]">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nợ tối thiểu</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filterMinDebt}
                  onChange={(e) => {
                    setFilterMinDebt(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-[140px]">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nợ tối đa</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={filterMaxDebt}
                  onChange={(e) => {
                    setFilterMaxDebt(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Khoảng hạn chót */}
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hạn chót từ</label>
                <input
                  type="date"
                  value={filterDueDateFrom}
                  onChange={(e) => {
                    setFilterDueDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hạn chót đến</label>
                <input
                  type="date"
                  value={filterDueDateTo}
                  onChange={(e) => {
                    setFilterDueDateTo(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Xóa bộ lọc */}
              {isFiltering && (
                <button
                  onClick={() => {
                    setFilterMinDebt('');
                    setFilterMaxDebt('');
                    setFilterDueDateFrom('');
                    setFilterDueDateTo('');
                  }}
                  className="px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        )}

        <div className="border-b border-gray-200 mt-4 overflow-x-auto custom-scrollbar">
          <div className="flex gap-8 px-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={`whitespace-nowrap pb-4 text-sm font-semibold transition-colors relative ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px] xl:text-[13.5px] 2xl:text-sm">
              <thead>
                <tr className="bg-primary text-white text-sm">
                  <th className="px-5 py-3.5 font-semibold">Hóa Đơn / Hạn Chót</th>
                  <th className="px-5 py-3.5 font-semibold">Học Viên / Khóa</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Tổng Tiền</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Đã Thu</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Còn Nợ</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Trạng Thái</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : invoices.length > 0 ? (
                  invoices.map((inv) => {
                    if (!inv) return null;
                    const paid = (inv.finalAmount || 0) - (inv.debt || 0);

                    return (
                      <tr key={inv._id as string} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 xl:p-5">
                          <p className="font-medium text-gray-900">{inv?.code || 'N/A'}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar size={12} /> {inv?.dueDate ? formatDate(inv.dueDate as string) : 'Chưa cập nhật'}
                          </p>
                        </td>
                        <td className="p-4 xl:p-5">
                          <p
                            className="font-medium text-gray-900"
                            onClick={() =>
                              navigation(PATHS.TRAINING_STUDENT_ID.replace(':id', (inv?.studentId as any)?._id || ''))
                            }
                            style={{ cursor: 'pointer' }}
                          >
                            {(inv?.studentId as any)?.fullName || 'Chưa cập nhật'}
                          </p>
                          <p className="text-xs text-gray-500">{(inv?.classId as any)?.name || 'Chưa phân lớp'}</p>
                        </td>
                        <td className="p-4 xl:p-5 text-right font-medium text-gray-500">
                          {formatCurrency(inv?.finalAmount || 0)}
                        </td>
                        <td className="p-4 xl:p-5 text-right font-medium text-emerald-600">{formatCurrency(paid)}</td>
                        <td className="p-4 xl:p-5 text-right font-bold text-red-600">
                          {formatCurrency(inv?.debt || 0)}
                        </td>
                        <td className="p-4 xl:p-5 text-center">
                          <StatusBadge
                            status={inv.status}
                            label={
                              inv.status === 'PAID'
                                ? 'Đã thanh toán'
                                : inv.status === 'PARTIAL'
                                  ? 'Đang trả góp'
                                  : inv.status === 'UNPAID'
                                    ? 'Chờ thu phí'
                                    : inv.status === 'OVERDUE'
                                      ? 'Quá hạn'
                                      : inv.status === 'REFUNDED'
                                        ? 'Hoàn tiền'
                                        : 'Đã hủy'
                            }
                            pulse={inv.status === 'OVERDUE'}
                          />
                          {renderNotificationBadge(inv)}
                        </td>
                        <td className="p-4 xl:p-5 text-right">
                          {inv?.debt > 0 && inv.status !== 'CANCELLED' && inv.status !== 'REFUNDED' ? (
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                              Thu tiền
                            </button>
                          ) : inv?.status !== 'CANCELLED' && inv?.status !== 'REFUNDED' ? ( // ← bỏ {} thừa, dùng ternary tiếp
                            <div
                              className="relative inline-block"
                              ref={openMenuId === (inv._id as string) ? menuRef : null}
                            >
                              <button
                                onClick={() =>
                                  setOpenMenuId(openMenuId === (inv._id as string) ? null : (inv._id as string))
                                }
                                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                              >
                                <MoreVertical size={20} />
                              </button>

                              {openMenuId === (inv._id as string) && (
                                <div className="absolute right-0 z-50 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                  {inv.status === 'PAID' && (
                                    <>
                                      <div className="border-t border-gray-100" />
                                      <button
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          setConfirmModal({ isOpen: true, type: 'refund', invoice: inv });
                                        }}
                                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                                      >
                                        <RotateCcw size={15} />
                                        Hoàn tiền
                                      </button>

                                      <button
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          setConfirmModal({ isOpen: true, type: 'cancel', invoice: inv });
                                        }}
                                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                      >
                                        <XCircle size={15} />
                                        Hủy hóa đơn
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : null}{' '}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Không có dữ liệu trong mục này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <TablePagination totalPages={totalPages} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
          </div>
        </div>

        {selectedInvoice && (
          <PaymentWizardModal
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onSuccess={handlePaymentSuccess}
          />
        )}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => {
            if (!actionLoading) {
              setConfirmModal({ isOpen: false, type: null, invoice: null });
              setActionError(null);
              setActionSuccess(null);
            }
          }}
          onConfirm={
            actionError || actionSuccess
              ? () => {
                setConfirmModal({ isOpen: false, type: null, invoice: null });
                setActionError(null);
                setActionSuccess(null);
              }
              : confirmModal.type === 'refund'
                ? handleRefund
                : handleCancel
          }
          isLoading={actionLoading}
          type={
            actionSuccess ? 'success' : actionError ? 'danger' : confirmModal.type === 'refund' ? 'warning' : 'danger'
          }
          title={
            actionSuccess
              ? 'Thành công!'
              : actionError
                ? 'Không thể thực hiện'
                : confirmModal.type === 'refund'
                  ? 'Xác nhận hoàn tiền'
                  : 'Xác nhận hủy hóa đơn'
          }
          message={
            actionSuccess
              ? actionSuccess
              : actionError
                ? actionError
                : confirmModal.type === 'refund'
                  ? `Bạn có chắc muốn hoàn tiền hóa đơn ${confirmModal.invoice?.code}?`
                  : `Bạn có chắc muốn hủy hóa đơn ${confirmModal.invoice?.code}?`
          }
          confirmText={
            actionSuccess || actionError ? 'Đã hiểu' : confirmModal.type === 'refund' ? 'Hoàn tiền' : 'Hủy hóa đơn'
          }
          cancelText={actionSuccess || actionError ? '' : 'Hủy'}
        />
      </div>
    </div>
  );
};

export default InvoiceManagement;
