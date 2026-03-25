import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Clock, DoorOpen, UserCheck } from 'lucide-react';
import Button from '../../../../components/Button';
import InputField from '../../../../components/InputField';
import Combobox from '../../../../components/Combobox';

import { userService } from '../../../../services/user.service';
import { classService } from '../../../../services/class.service';
import { roomService } from '../../../../services/room.service';
import { shiftService } from '../../../../services/shift.service';

import type { ISchedule, ScheduleModalProps } from '../../../../types/schedule.type';
import { format } from 'date-fns';

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<Partial<ISchedule>>({
        classId: '',
        shiftId: '',
        roomId: '',
        teacherId: undefined,
        date: format(new Date(), 'yyyy-MM-dd'),
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    classId: typeof initialData.classId === 'object' ? initialData.classId._id : initialData.classId,
                    shiftId: typeof initialData.shiftId === 'object' ? initialData.shiftId._id : initialData.shiftId,
                    roomId: typeof initialData.roomId === 'object' ? initialData.roomId._id : initialData.roomId,
                    teacherId: typeof initialData.teacherId === 'object' ? (initialData.teacherId?._id || undefined) : (initialData.teacherId || undefined),
                    date: initialData.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                });
            } else {
                setFormData({
                    classId: '',
                    shiftId: '',
                    roomId: '',
                    teacherId: undefined,
                    date: format(new Date(), 'yyyy-MM-dd'),
                });
            }
            setErrors({});
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.classId) newErrors.classId = 'Vui lòng chọn lớp học';
        if (!formData.shiftId) newErrors.shiftId = 'Vui lòng chọn ca học';
        if (!formData.roomId) newErrors.roomId = 'Vui lòng chọn phòng học';
        if (!formData.date) newErrors.date = 'Vui lòng chọn ngày học';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleClassSearch = async (query: string) => {
        const res = await classService.getClasses({ search: query, limit: 10 });
        return res.data || [];
    };

    const handleShiftSearch = async (query: string) => {
        const res = await shiftService.getShifts({ search: query, limit: 10 });
        return res.data || [];
    };

    const handleRoomSearch = async (query: string) => {
        const res = await roomService.getRooms({ search: query, limit: 10 });
        return res.data || [];
    };

    const handleTeacherSearch = async (query: string) => {
        const res = await userService.getUsers({ search: query, roleId: '69a955701a7df7d94923859d', limit: 10 });
        return res.data || [];
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-primary p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">{initialData ? 'Chỉnh sửa lịch học' : 'Tạo lịch học mới'}</h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Combobox
                            label="Lớp học"
                            icon={<Users size={16} />}
                            placeholder="Tìm kiếm lớp học..."
                            onSearch={handleClassSearch}
                            onSelect={(item) => setFormData({ ...formData, classId: item?._id })}
                            getDisplayValue={(item) => item.name}
                            error={errors.classId}
                            onFocus={() => clearError('classId')}
                            initialValue={typeof initialData?.classId === 'object' ? initialData.classId.name : ''}
                        />

                        <Combobox
                            label="Ca học"
                            icon={<Clock size={16} />}
                            placeholder="Tìm kiếm ca học..."
                            onSearch={handleShiftSearch}
                            onSelect={(item) => setFormData({ ...formData, shiftId: item?._id })}
                            getDisplayValue={(item) => item.name}
                            error={errors.shiftId}
                            onFocus={() => clearError('shiftId')}
                            initialValue={typeof initialData?.shiftId === 'object' ? initialData.shiftId.name : ''}
                        />

                        <Combobox
                            label="Phòng học"
                            icon={<DoorOpen size={16} />}
                            placeholder="Tìm kiếm phòng học..."
                            onSearch={handleRoomSearch}
                            onSelect={(item) => setFormData({ ...formData, roomId: item?._id })}
                            getDisplayValue={(item) => item.name}
                            error={errors.roomId}
                            onFocus={() => clearError('roomId')}
                            initialValue={typeof initialData?.roomId === 'object' ? initialData.roomId.name : ''}
                        />

                        <Combobox
                            label="Giảng viên (Tùy chọn)"
                            icon={<UserCheck size={16} />}
                            placeholder="Tìm kiếm giảng viên..."
                            onSearch={handleTeacherSearch}
                            onSelect={(item) => setFormData({ ...formData, teacherId: item?._id })}
                            getDisplayValue={(item) => item.fullName}
                            error={errors.teacherId}
                            onFocus={() => clearError('teacherId')}
                            initialValue={typeof initialData?.teacherId === 'object' ? initialData.teacherId.fullName : ''}
                        />

                        <InputField
                            label="Ngày học"
                            type="date"
                            icon={<Calendar size={16} />}
                            value={String(formData.date)}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            error={errors.date}
                            onFocus={() => clearError('date')}
                        />
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-gray-100">
                        <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} type="button">
                            Hủy
                        </Button>
                        <Button variant="primary" className="flex-1 rounded-xl" type="submit">
                            {initialData ? 'Lưu thay đổi' : 'Tạo lịch học'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleModal;
