import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Calendar, Bell, BellRing, BellOff } from 'lucide-react';

import { formatCurrency, formatDate } from '../../../utils/format.util';
import type { IInvoice, InvoiceStatus, InvoiceConfig } from '../../../types/invoice.type';

import useFetch from '../../../hooks/useFetch';
import { invoiceService } from '../../../services/invoice.service';

import PaymentWizardModal from './PaymentWizardModal';

const TABS: { id: InvoiceStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'UNPAID', label: 'Chờ thu phí' },
  { id: 'PARTIAL', label: 'Đang trả góp' },
  { id: 'OVERDUE', label: 'Quá hạn' },
  { id: 'PAID', label: 'Đã hoàn thành' },
];

const InvoiceManagement = () => {
  const [activeTab, setActiveTab] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null);

  const queryParams = activeTab === 'ALL' ? { limit: 20 } : { status: activeTab, limit: 20 };
  const { data: response, loading } = useFetch(invoiceService.getInvoices, queryParams, [activeTab]);

  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [prevResponse, setPrevResponse] = useState<any>(null);

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

  const renderStatus = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold whitespace-nowrap">
            Đã thanh toán
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold whitespace-nowrap">
            Đang trả góp
          </span>
        );
      case 'UNPAID':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold whitespace-nowrap">
            Chờ thu phí
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold whitespace-nowrap animate-pulse">
            Quá hạn
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold whitespace-nowrap">
            Đã hủy
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold whitespace-nowrap">
            Hoàn tiền
          </span>
        );
      default:
        return null;
    }
  };

  // ==========================================
  // LOGIC HIỂN THỊ BADGE BÊN NGOÀI BẢNG
  // ==========================================
  const renderNotificationBadge = (inv: IInvoice) => {
    // Không hiện nhắc nợ nếu đã thanh toán xong hoặc bị hủy
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Công nợ</h1>
            <p className="text-sm text-gray-500 mt-1">Hệ thống theo dõi dòng tiền kế toán</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
              <Filter size={16} /> Lọc
            </button>
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm HD, Tên HV..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 mt-4 overflow-x-auto custom-scrollbar">
          <div className="flex gap-8 px-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4 font-semibold">Hóa Đơn / Hạn Chót</th>
                  <th className="p-4 font-semibold">Học Viên / Khóa</th>
                  <th className="p-4 font-semibold text-right">Tổng Tiền</th>
                  <th className="p-4 font-semibold text-right">Đã Thu</th>
                  <th className="p-4 font-semibold text-right text-red-600">Còn Nợ</th>
                  <th className="p-4 font-semibold text-center">Trạng Thái</th>
                  <th className="p-4 font-semibold text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-blue-500 animate-pulse font-medium">
                      Đang tải dữ liệu công nợ...
                    </td>
                  </tr>
                ) : invoices.length > 0 ? (
                  invoices.map((inv) => {
                    if (!inv) return null;
                    const paid = (inv.finalAmount || 0) - (inv.debt || 0);

                    return (
                      <tr key={inv._id as string} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-gray-900">{inv?.code || 'N/A'}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar size={12} /> {inv?.dueDate ? formatDate(inv.dueDate as string) : 'Chưa cập nhật'}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-gray-900">
                            {(inv?.studentId as any)?.fullName || 'Chưa cập nhật'}
                          </p>
                          <p className="text-xs text-gray-500">{(inv?.classId as any)?.name || 'Chưa phân lớp'}</p>
                        </td>
                        <td className="p-4 text-right font-medium text-gray-500">
                          {formatCurrency(inv?.finalAmount || 0)}
                        </td>
                        <td className="p-4 text-right font-medium text-emerald-600">{formatCurrency(paid)}</td>
                        <td className="p-4 text-right font-bold text-red-600">{formatCurrency(inv?.debt || 0)}</td>
                        <td className="p-4 text-center">
                          {renderStatus(inv?.status)}
                          {renderNotificationBadge(inv)}
                        </td>
                        <td className="p-4 text-right">
                          {inv?.debt > 0 && inv.status !== 'CANCELLED' && inv.status !== 'REFUNDED' ? (
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                              Thu tiền
                            </button>
                          ) : (
                            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                              <MoreVertical size={20} />
                            </button>
                          )}
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
          </div>
        </div>

        {selectedInvoice && (
          <PaymentWizardModal
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default InvoiceManagement;
