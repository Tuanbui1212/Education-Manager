import { useState, useEffect } from 'react';
import { X, DoorOpen, Users, Activity } from 'lucide-react';
import Button from '../../../components/Button';
import InputField from '../../../components/InputField';
import SelectField from '../../../components/SelectField';

import type { IRoom, RoomStatus, RoomModalProps } from '../../../types/room.type';

const RoomModal = ({ isOpen, onClose, onSubmit, initialData }: RoomModalProps) => {
    const [formData, setFormData] = useState<Partial<IRoom>>({
        name: '',
        capacity: 0,
        status: 'ACTIVE',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({ ...initialData });
            } else {
                setFormData({
                    name: '',
                    capacity: 0,
                    status: 'ACTIVE',
                });
            }
            setErrors({});
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Vui lòng nhập tên phòng';
        } else if (formData.name.length > 50) {
            newErrors.name = 'Tên phòng không quá 50 ký tự';
        }

        if (!formData.capacity) {
            newErrors.capacity = 'Vui lòng nhập sức chứa';
        } else if (formData.capacity <= 0) {
            newErrors.capacity = 'Sức chứa phải lớn hơn 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof IRoom, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field as string]) {
            setErrors({ ...errors, [field as string]: '' });
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-primary p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">{initialData ? 'Chỉnh sửa phòng học' : 'Thêm phòng học mới'}</h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form
                    className="p-6 space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!validateForm()) return;
                        onSubmit(formData);
                    }}
                >
                    <InputField
                        label="Tên phòng"
                        icon={<DoorOpen size={16} />}
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={errors.name}
                        placeholder="Vd: Phòng A101..."
                    />

                    <InputField
                        label="Sức chứa (học sinh)"
                        icon={<Users size={16} />}
                        type="number"
                        value={formData.capacity || ''}
                        onChange={(e) => handleChange('capacity', Number(e.target.value))}
                        error={errors.capacity}
                        placeholder="Vd: 30"
                    />

                    <SelectField
                        label="Trạng thái"
                        icon={<Activity size={16} />}
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value as RoomStatus)}
                    >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="MAINTENANCE">Bảo trì</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                    </SelectField>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} type="button">
                            Hủy
                        </Button>
                        <Button variant="primary" className="flex-1 rounded-xl" type="submit">
                            {initialData ? 'Lưu thay đổi' : 'Tạo phòng học'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoomModal;
