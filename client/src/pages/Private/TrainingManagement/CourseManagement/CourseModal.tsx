import { useState, useEffect } from 'react';
import { X, Type, DollarSign, FileText } from 'lucide-react';
import Button from '../../../../components/Button';
import InputField from '../../../../components/InputField';

import type { ICourse, CourseModalProps } from '../../../../types/course.type';

const CourseModal = ({ isOpen, onClose, onSubmit, initialData }: CourseModalProps) => {
    const [formData, setFormData] = useState<Partial<ICourse>>({
        title: '',
        basePrice: 0,
        syllabus: '',
        totalLessons: 0,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({ ...initialData });
            } else {
                setFormData({
                    title: '',
                    basePrice: 0,
                    syllabus: '',
                    totalLessons: 0,
                });
            }
            setErrors({});
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title?.trim()) {
            newErrors.title = 'Vui lòng nhập tiêu đề khóa học';
        } else if (formData.title.length < 2 || formData.title.length > 150) {
            newErrors.title = 'Tiêu đề phải từ 2 đến 150 ký tự';
        }

        if (formData.basePrice === undefined || formData.basePrice <= 0) {
            newErrors.basePrice = 'Giá khóa học phải lớn hơn 0';
        }

        if (!formData.syllabus?.trim()) {
            newErrors.syllabus = 'Vui lòng nhập nội dung (syllabus)';
        }

        if (!formData.totalLessons || formData.totalLessons <= 0 || !Number.isInteger(formData.totalLessons)) {
            newErrors.totalLessons = 'Tổng số bài học phải là số nguyên lớn hơn 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof ICourse, value: any) => {
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
                    <h3 className="text-xl font-bold">{initialData ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}</h3>
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
                        label="Tiêu đề khóa học"
                        icon={<Type size={16} />}
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        error={errors.title}
                        placeholder="Vd: Khóa học lập trình ReactJS..."
                    />

                    <InputField
                        label="Giá cơ bản (VNĐ)"
                        icon={<DollarSign size={16} />}
                        type="number"
                        value={formData.basePrice || ''}
                        onChange={(e) => handleChange('basePrice', Number(e.target.value))}
                        error={errors.basePrice}
                        placeholder="Vd: 5000000"
                    />

                    <InputField
                        label="Tổng số buổi học"
                        icon={<FileText size={16} />}
                        type="number"
                        value={formData.totalLessons || ''}
                        onChange={(e) => handleChange('totalLessons', Number(e.target.value))}
                        error={errors.totalLessons}
                        placeholder="Vd: 24"
                    />

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <FileText size={16} /> Nội dung (Syllabus)
                        </label>
                        <textarea
                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[150px] ${errors.syllabus ? 'border-red-500' : 'border-gray-200'
                                }`}
                            value={formData.syllabus || ''}
                            onChange={(e) => handleChange('syllabus', e.target.value)}
                            placeholder="Nhập nội dung chi tiết khóa học..."
                        ></textarea>
                        {errors.syllabus && <p className="text-red-500 text-xs mt-1">{errors.syllabus}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} type="button">
                            Hủy
                        </Button>
                        <Button variant="primary" className="flex-1 rounded-xl" type="submit">
                            {initialData ? 'Lưu thay đổi' : 'Tạo khóa học'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseModal;
