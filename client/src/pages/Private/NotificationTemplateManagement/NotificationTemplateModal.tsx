import { useState } from 'react';
import { X, Type, FileText, Share2, Activity } from 'lucide-react';
import Button from '../../../components/Button';
import InputField from '../../../components/InputField';
import SelectField from '../../../components/SelectField';

import type {
  INotificationTemplate,
  NotificationType,
  NotificationTemplateModalProps,
} from '../../../types/notificationTemplate.type';

export const SYSTEM_TEMPLATE_CODES: { value: string; label: string }[] = [
  { value: 'REMIND_DEBT', label: 'Gửi thông báo nhắc nợ học phí' },
  { value: 'ENROLL_SUCCESS', label: 'Chào mừng ghi danh thành công' },
  { value: 'PAYMENT_SUCCESS', label: 'Xác nhận đã thanh toán' },
  { value: 'CLASS_OPENING', label: 'Thông báo khai giảng lớp mới' },
  { value: 'INSTALLMENT_CREATED', label: 'Thông báo tạo lịch trả góp' },
  { value: 'REMIND_INSTALLMENT', label: 'Thông báo lịch trả góp' },
  { value: 'FORGOT_PASSWORD', label: 'Xác nhận quên mật khẩu' },
];

const NotificationTemplateModal = ({ isOpen, onClose, onSubmit, initialData }: NotificationTemplateModalProps) => {
  const [formData, setFormData] = useState<Partial<INotificationTemplate>>({
    code: SYSTEM_TEMPLATE_CODES[0].value,
    title: '',
    content: '',
    type: 'EMAIL',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
              code: SYSTEM_TEMPLATE_CODES[0].value,
              title: '',
              content: '',
              type: 'EMAIL',
            },
      );
      setErrors({});
    }
  }

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code) newErrors.code = 'Vui lòng chọn sự kiện';
    if (!formData.title?.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    if (!formData.content?.trim()) newErrors.content = 'Vui lòng nhập nội dung';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof INotificationTemplate, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as string]) {
      setErrors({ ...errors, [field as string]: '' });
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">{initialData ? 'Chỉnh sửa mẫu thông báo' : 'Thêm mẫu thông báo mới'}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validateForm()) return;
            onSubmit(formData);
          }}
        >
          <SelectField
            label="Sự kiện áp dụng"
            icon={<Activity size={16} />}
            value={formData.code || ''}
            onChange={(e) => handleChange('code', e.target.value)}
            disabled={!!initialData} // Không cho sửa code nếu đang Edit
          >
            {SYSTEM_TEMPLATE_CODES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </SelectField>

          <InputField
            label="Tiêu đề"
            icon={<Type size={16} />}
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            placeholder="Vd: Nhắc nhở đóng học phí..."
          />

          <SelectField
            label="Loại thông báo"
            icon={<Share2 size={16} />}
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value as NotificationType)}
          >
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
          </SelectField>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FileText size={16} /> Nội dung
            </label>
            <p className="text-[11px] text-blue-500 mb-2 font-medium">
              * Mẹo: Dùng biến như {'{{studentName}}'}, {'{{debtAmount}}'}, {'{{dueDate}}'} để điền tự động.
            </p>
            <textarea
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[200px] ${
                errors.content ? 'border-red-500' : 'border-gray-200'
              }`}
              value={formData.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Nhập nội dung mẫu thông báo..."
            ></textarea>
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} type="button">
              Hủy
            </Button>
            <Button variant="primary" className="flex-1 rounded-xl" type="submit">
              {initialData ? 'Lưu thay đổi' : 'Tạo mẫu mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationTemplateModal;
