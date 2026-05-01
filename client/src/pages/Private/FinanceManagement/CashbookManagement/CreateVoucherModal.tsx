import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Button from '../../../../components/Button';
import { transactionService } from '../../../../services/transaction.service';
import { expenditureService } from '../../../../services/expenditure.service';
import type { PaymentMethod } from '../../../../types/transaction.type';

// ==================== TYPES ====================

type VoucherType = 'IN' | 'OUT';

interface IVoucherForm {
  type: VoucherType;
  category: string;
  amount: string;
  description: string;
  paymentMethod: PaymentMethod;
}

interface CreateVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ==================== CONSTANTS ====================

const IN_CATEGORIES = [
  { value: 'Bán tài liệu/Sách', label: 'Bán tài liệu / Sách' },
  { value: 'Thu khác', label: 'Thu khác' },
];

const OUT_CATEGORIES = [
  { value: 'Văn phòng phẩm', label: 'Văn phòng phẩm' },
  { value: 'Chi phí Marketing', label: 'Chi phí Marketing / Ads' },
  { value: 'Bảo trì / Sửa chữa', label: 'Bảo trì / Sửa chữa' },
  { value: 'Tạm ứng lương', label: 'Tạm ứng lương' },
  { value: 'Chi khác', label: 'Chi khác' },
];

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'TRANSFER', label: 'Chuyển khoản' },
  { value: 'CARD', label: 'Quẹt thẻ' },
];

const DEFAULT_FORM: IVoucherForm = {
  type: 'OUT',
  category: '',
  amount: '',
  description: '',
  paymentMethod: 'CASH',
};

// ==================== COMPONENT ====================

const CreateVoucherModal: React.FC<CreateVoucherModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState<IVoucherForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setForm(DEFAULT_FORM);
    setError(null);
    onClose();
  };

  const handleTypeChange = (type: VoucherType) => {
    setForm({ ...DEFAULT_FORM, type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setError('Số tiền không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      if (form.type === 'IN') {
        console.log('form:', form);
        await transactionService.createTransactionTest({
          amount,
          note: form.description,
          paymentMethod: form.paymentMethod,
        });
      } else {
        // await expenditureService.create({
        //   type: 'OPERATION',
        //   category: form.category,
        //   amount,
        //   description: form.description,
        //   paymentMethod: form.paymentMethod,
        // });
      }

      handleClose();
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const categories = form.type === 'IN' ? IN_CATEGORIES : OUT_CATEGORIES;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-600 p-5 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white">Tạo Phiếu Thu / Chi Thủ Công</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Toggle IN / OUT */}
          <div className="flex gap-4 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                form.type === 'IN' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
              }`}
              onClick={() => handleTypeChange('IN')}
            >
              <ArrowUpRight size={16} /> Tạo Phiếu Thu
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                form.type === 'OUT' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'
              }`}
              onClick={() => handleTypeChange('OUT')}
            >
              <ArrowDownRight size={16} /> Tạo Phiếu Chi
            </button>
          </div>

          {/* Số tiền + Hình thức */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Số tiền (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Hình thức <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Danh mục */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="" disabled>
                -- Chọn danh mục --
              </option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nội dung */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nội dung diễn giải <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Nhập lý do thu/chi..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="w-full py-3" onClick={handleClose}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" className="w-full py-3 shadow-lg" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu Giao Dịch'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVoucherModal;
