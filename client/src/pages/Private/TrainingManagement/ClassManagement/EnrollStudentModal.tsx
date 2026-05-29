import React, { useState, useMemo } from 'react';
import { X, UserPlus, GraduationCap, Info, CalendarClock } from 'lucide-react';
import Button from '../../../../components/Button';
import Combobox from '../../../../components/Combobox';

import { userService } from '../../../../services/user.service';
import { roleService } from '../../../../services/role.service';
import useFetch from '../../../../hooks/useFetch';
import { formatCurrency } from '../../../../utils/format.util';

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  classData: any;
}

const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({ isOpen, onClose, onSubmit, classData }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    dueDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedStudentInfo, setSelectedStudentInfo] = useState<any>(null);

  const { data: rolesData } = useFetch(roleService.getRoles, {}, []);
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];

  function StudentInfo({ id }: { id: string }) {
    const { data } = useFetch(userService.getUserById, id, [id]);

    return <div>{data?.fullName}</div>;
  }

  const studentRoleId = useMemo(() => roles.find((r: any) => r.name?.toLowerCase() === 'student')?._id, [roles]);

  if (!isOpen) return null;

  const handleStudentSearch = async (query: string) => {
    const [resActive, resPotential] = await Promise.all([
      userService.getUsers({
        search: query,
        roleId: studentRoleId,
        limit: 10,
        status: 'ACTIVE',
      }),
      userService.getUsers({
        search: query,
        roleId: studentRoleId,
        limit: 10,
        status: 'POTENTIAL',
      }),
    ]);

    return [...resActive.data, ...resPotential.data];
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.studentId) newErrors.studentId = 'Vui lòng chọn học viên';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      studentId: formData.studentId,
      classId: classData._id,
      finalAmount: classData.courseId.basePrice,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>

      <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] w-full max-w-lg z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-blue-100 ring-1 ring-black/5">
        <div className="bg-primary p-5 text-white flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <UserPlus size={22} className="text-white" />
            </div>
            <h3 className="font-bold text-lg tracking-wide">Ghi danh học viên mới</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors active:scale-95">
            <X size={20} />
          </button>
        </div>

        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {/* Thông tin lớp học */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-xs text-blue-600/80 font-bold uppercase tracking-wider">Đang ghi danh vào lớp:</p>
              <p className="text-base font-bold text-gray-800">{classData.name}</p>
            </div>
            <div className="pt-3 border-t border-blue-200/60 flex justify-between items-center">
              <span className="text-sm text-blue-800 font-semibold">Học phí quy định:</span>
              <span className="text-base font-black text-blue-700">{formatCurrency(classData.courseId.basePrice)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-blue-800 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Hệ thống sẽ tự động tạo hóa đơn với mức học phí cố định và gán doanh thu cho Nhân viên tư vấn đang chăm
              sóc học viên này.
            </p>
          </div>

          <div className="space-y-1">
            <Combobox
              label="Chọn học viên"
              icon={<GraduationCap size={18} className="text-gray-500" />}
              placeholder="Tìm theo tên hoặc SĐT..."
              onSearch={handleStudentSearch}
              onSelect={(student) => {
                setFormData({ ...formData, studentId: student?._id });
                setSelectedStudentInfo(student);
                setErrors({ ...errors, studentId: '' });
              }}
              getDisplayValue={(student) => `${student.fullName} - ${student.phone}`}
              error={errors.studentId}
            />

            {selectedStudentInfo && (
              <div className="text-sm text-gray-600 pl-3 py-1.5 border-l-2 border-blue-500 mt-2 bg-gray-50 rounded-r-lg">
                <span className="font-semibold text-gray-700">Người phụ trách: </span>
                <span className="text-blue-700 font-medium">
                  {(selectedStudentInfo && <StudentInfo id={selectedStudentInfo.student_info.consultantId} />) ||
                    'Chưa phân công (Hệ thống tự quyết định)'}
                </span>
              </div>
            )}
          </div>

          {/* Hẹn ngày thanh toán */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <CalendarClock size={18} className="text-blue-600" /> Hẹn ngày đóng (Hạn chót)
            </label>
            <input
              type="date"
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-gray-700 font-medium bg-gray-50 focus:bg-white"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1.5 italic">* Bỏ trống để hệ thống tự động cho phép nợ 7 ngày.</p>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 py-3 text-sm font-semibold border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap"
              onClick={onClose}
              type="button"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              className="flex-1 py-3 text-sm font-bold bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] whitespace-nowrap"
              type="submit"
            >
              Xác nhận ghi danh
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollStudentModal;
