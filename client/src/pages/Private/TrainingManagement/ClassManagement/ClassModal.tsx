import React, { useState, useEffect } from 'react';
import { X, BookOpen, UserCheck, DoorOpen, GraduationCap, Trash2, Link, Plus } from 'lucide-react';
import Button from '../../../../components/Button';
import InputField from '../../../../components/InputField';
import SelectField from '../../../../components/SelectField';
import Combobox from '../../../../components/Combobox';

import { userService } from '../../../../services/user.service';
import { courseService } from '../../../../services/course.service';
import { roomService } from '../../../../services/room.service';

import type { IClass, ClassModalProps } from '../../../../types/class.type';
import { ClassStatus } from '../../../../types/class.type';

const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<Partial<IClass>>({
        name: '',
        courseId: '',
        teacherId: '',
        roomId: '',
        studentIds: [],
        documents: [],
        status: ClassStatus.ACTIVE,
    });

    const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
    const [linkInput, setLinkInput] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    courseId: typeof initialData.courseId === 'object' ? initialData.courseId._id : initialData.courseId,
                    teacherId: typeof initialData.teacherId === 'object' ? initialData.teacherId._id : initialData.teacherId,
                    roomId: typeof initialData.roomId === 'object' ? initialData.roomId._id : initialData.roomId,
                    studentIds: initialData.studentIds?.map(s => typeof s === 'object' ? s._id : s) || [],
                    documents: initialData.documents || [],
                });
            } else {
                setFormData({
                    name: '',
                    courseId: '',
                    teacherId: '',
                    roomId: '',
                    studentIds: [],
                    documents: [],
                    status: ClassStatus.ACTIVE,
                });
                setSelectedStudents([]);
            }
            setErrors({});
            setLinkInput('');
        }
    }, [isOpen, initialData]);

    // Handle initial students if they come as objects
    useEffect(() => {
        if (initialData?.studentIds) {
            const studentObjs = initialData.studentIds.filter(s => typeof s === 'object');
            setSelectedStudents(studentObjs);
        }
    }, [initialData]);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.trim()) newErrors.name = 'Tên lớp học là bắt buộc';
        if (!formData.courseId) newErrors.courseId = 'Vui lòng chọn khóa học';
        if (!formData.teacherId) newErrors.teacherId = 'Vui lòng chọn giáo viên';
        if (!formData.roomId) newErrors.roomId = 'Vui lòng chọn phòng học';

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

    const handleTeacherSearch = async (query: string) => {
        const response = await userService.getUsers({ search: query, roleId: '69a955701a7df7d94923859d', limit: 10 });
        return response.data;
    };

    const handleStudentSearch = async (query: string) => {
        const response = await userService.getUsers({ search: query, roleId: '69a955701a7df7d9492385a0', limit: 10 });
        return response.data;
    };

    const handleCourseSearch = async (query: string) => {
        const response = await courseService.getCourses({ search: query, limit: 10 });
        return response.data || [];
    };

    const handleRoomSearch = async (query: string) => {
        const response = await roomService.getRooms({ search: query, limit: 10 });
        return response.data || [];
    };

    const addStudent = (student: any) => {
        if (student && !formData.studentIds?.includes(student._id)) {
            setFormData({
                ...formData,
                studentIds: [...(formData.studentIds || []), student._id]
            });
            setSelectedStudents([...selectedStudents, student]);
        }
    };

    const removeStudent = (studentId: string) => {
        setFormData({
            ...formData,
            studentIds: formData.studentIds?.filter(id => id !== studentId)
        });
        setSelectedStudents(selectedStudents.filter(s => s._id !== studentId));
    };

    const addDocument = () => {
        if (linkInput.trim()) {
            setFormData({
                ...formData,
                documents: [...(formData.documents || []), linkInput.trim()]
            });
            setLinkInput('');
        }
    };

    const removeDocument = (index: number) => {
        setFormData({
            ...formData,
            documents: formData.documents?.filter((_, i) => i !== index)
        });
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

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-primary p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">{initialData ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}</h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[85vh] overflow-y-auto custom-scrollbar" onSubmit={handleSubmit}>
                    <div className="space-y-6 md:col-span-1">
                        <InputField
                            label="Tên lớp học"
                            icon={<BookOpen size={16} />}
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            onFocus={() => clearError('name')}
                            error={errors.name}
                            placeholder="Vd: Lớp ReactJS nâng cao - K12"
                        />

                        <Combobox
                            label="Khóa học"
                            icon={<BookOpen size={16} />}
                            placeholder="Tìm kiếm khóa học..."
                            onSearch={handleCourseSearch}
                            onSelect={(course) => setFormData({ ...formData, courseId: course?._id })}
                            onFocus={() => clearError('courseId')}
                            getDisplayValue={(course) => course?.title}
                            error={errors.courseId}
                            initialValue={typeof initialData?.courseId === 'object' ? initialData.courseId.title : ''}
                        />

                        <Combobox
                            label="Giáo viên"
                            icon={<UserCheck size={16} />}
                            placeholder="Tìm kiếm giáo viên..."
                            onSearch={handleTeacherSearch}
                            onSelect={(teacher) => setFormData({ ...formData, teacherId: teacher?._id })}
                            onFocus={() => clearError('teacherId')}
                            getDisplayValue={(teacher) => teacher?.fullName}
                            error={errors.teacherId}
                            initialValue={typeof initialData?.teacherId === 'object' ? initialData.teacherId.fullName : ''}
                        />

                        <Combobox
                            label="Phòng học"
                            icon={<DoorOpen size={16} />}
                            placeholder="Tìm kiếm phòng học..."
                            onSearch={handleRoomSearch}
                            onSelect={(room) => setFormData({ ...formData, roomId: room?._id })}
                            onFocus={() => clearError('roomId')}
                            getDisplayValue={(room) => room?.name}
                            error={errors.roomId}
                            initialValue={typeof initialData?.roomId === 'object' ? initialData.roomId.name : ''}
                        />

                        <SelectField
                            label="Trạng thái"
                            value={formData.status || ClassStatus.ACTIVE}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as ClassStatus })}
                        >
                            <option value={ClassStatus.ACTIVE}>Đang hoạt động</option>
                            <option value={ClassStatus.MAINTENANCE}>Bảo trì</option>
                            <option value={ClassStatus.INACTIVE}>Ngừng hoạt động</option>
                        </SelectField>
                    </div>

                    <div className="space-y-6 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 h-full flex flex-col">
                            <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <GraduationCap size={18} className="text-primary" /> Danh sách học viên ({selectedStudents.length})
                            </label>

                            <div className="mb-4">
                                <Combobox
                                    label=""
                                    placeholder="Thêm học viên vào lớp..."
                                    onSearch={handleStudentSearch}
                                    onSelect={addStudent}
                                    onFocus={() => clearError('students')}
                                    getDisplayValue={(student) => student.fullName}
                                    error={errors.students}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-[150px] max-h-[300px] space-y-2 pr-2 custom-scrollbar">
                                {selectedStudents.length > 0 ? (
                                    selectedStudents.map((student) => (
                                        <div key={student._id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 group hover:border-primary/50 transition-all shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                                                    {student.fullName.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{student.fullName}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeStudent(student._id)}
                                                className="text-gray-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 opacity-60">
                                        <GraduationCap size={32} strokeWidth={1.5} />
                                        <p className="text-xs italic">Chưa có học viên nào</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 h-full flex flex-col">
                            <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <Link size={18} className="text-primary" /> Tài liệu/Liên kết ({(formData.documents || []).length})
                            </label>

                            <div className="flex gap-2 mb-4">
                                <div className="flex-1">
                                    <InputField
                                        label=""
                                        placeholder="Dán liên kết tài liệu..."
                                        value={linkInput}
                                        onChange={(e) => setLinkInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addDocument();
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={addDocument}
                                    className="h-[46px] w-[46px] mt-px bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-[150px] max-h-[300px] space-y-2 pr-2 custom-scrollbar">
                                {(formData.documents || []).length > 0 ? (
                                    (formData.documents || []).map((doc, index) => (
                                        <div key={index} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 group hover:border-primary/50 transition-all shadow-sm">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                                    <Link size={14} />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 truncate">{doc}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeDocument(index)}
                                                className="text-gray-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 opacity-60">
                                        <Link size={32} strokeWidth={1.5} />
                                        <p className="text-xs italic">Chưa có tài liệu nào</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-3 flex gap-3 pt-6 border-t border-gray-100">
                        <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} type="button">
                            Hủy
                        </Button>
                        <Button variant="primary" className="flex-1 rounded-xl" type="submit">
                            {initialData ? 'Lưu thay đổi' : 'Tạo lớp học'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassModal;
