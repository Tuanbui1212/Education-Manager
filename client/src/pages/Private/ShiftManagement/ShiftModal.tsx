import { X, Clock, Type, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

import type { IShiftData, ShiftModalProps } from '../../../types/shift.type';

const ShiftModal = ({ isOpen, onClose, onSubmit, initialData }: ShiftModalProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<IShiftData>(
    initialData || {
      name: '',
      startTime: '',
      endTime: '',
      status: 'ACTIVE',
    },
  );

  const handleChange = (field: keyof IShiftData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên ca học';
    if (!formData.startTime) newErrors.startTime = 'Vui lòng chọn giờ bắt đầu';
    if (!formData.endTime) newErrors.endTime = 'Vui lòng chọn giờ kết thúc';

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'Giờ kết thúc phải lớn hơn giờ bắt đầu';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (isOpen !== prevIsOpen || initialData !== prevInitialData) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);

    if (isOpen) {
      setFormData(
        initialData
          ? { ...initialData }
          : {
              name: '',
              startTime: '',
              endTime: '',
              status: 'ACTIVE',
            },
      );
      setErrors({});
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">{initialData ? 'Cập Nhật Ca Học' : 'Thêm Ca Học Mới'}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tên ca học */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tên ca học <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Type size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="VD: Ca Sáng 1"
                className={`w-full pl-10 pr-4 py-2.5 border ${errors.name ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} rounded-xl focus:ring-4 outline-none transition-all`}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Giờ bắt đầu */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Giờ bắt đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock size={16} className="text-gray-400" />
                </div>
                {/* Dùng type="time" để browser tự sinh ra bộ chọn giờ xịn sò */}
                <input
                  type="time"
                  className={`w-full pl-10 pr-4 py-2.5 border ${errors.startTime ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} rounded-xl focus:ring-4 outline-none transition-all`}
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                />
              </div>
              {errors.startTime && <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>}
            </div>

            {/* Giờ kết thúc */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Giờ kết thúc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock size={16} className="text-gray-400" />
                </div>
                <input
                  type="time"
                  className={`w-full pl-10 pr-4 py-2.5 border ${errors.endTime ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} rounded-xl focus:ring-4 outline-none transition-all`}
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                />
              </div>
              {errors.endTime && <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>}
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Activity size={16} className={formData.status === 'ACTIVE' ? 'text-blue-500' : 'text-gray-400'} />
              </div>
              <select
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
              >
                <option value="ACTIVE">Đang áp dụng</option>
                <option value="INACTIVE">Ngừng áp dụng</option>
              </select>
            </div>
          </div>

          {/* Footer Modal */}
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
            >
              {initialData ? 'Lưu thay đổi' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftModal;
