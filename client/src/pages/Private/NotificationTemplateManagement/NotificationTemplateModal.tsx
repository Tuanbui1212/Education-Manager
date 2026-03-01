import { useState, useEffect } from 'react';
import { X, Type, FileText, Share2 } from 'lucide-react';
import Button from '../../../components/Button';
import InputField from '../../../components/InputField';
import SelectField from '../../../components/SelectField';

import type { INotificationTemplate, NotificationType, NotificationTemplateModalProps } from '../../../types/notificationTemplate.type';

const NotificationTemplateModal = ({ isOpen, onClose, onSubmit, initialData }: NotificationTemplateModalProps) => {
    const [formData, setFormData] = useState<Partial<INotificationTemplate>>({
        title: '',
        content: '',
        type: 'EMAIL',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({ ...initialData });
            } else {
                setFormData({
                    title: '',
                    content: '',
                    type: 'EMAIL',
                });
            }
            setErrors({});
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title?.trim()) {
            newErrors.title = 'Vui lòng nhập tiêu đề';
        } else if (formData.title.length > 150) {
            newErrors.title = 'Tiêu đề không quá 150 ký tự';
        }

        if (!formData.content?.trim()) {
            newErrors.content = 'Vui lòng nhập nội dung';
        }

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
                        <textarea
                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[200px] ${errors.content ? 'border-red-500' : 'border-gray-200'
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
