import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  User as UserIcon,
  Users,
  Edit,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react';

import useFetch from '../../../../hooks/useFetch';
import { classService } from '../../../../services/class.service';
import Button from '../../../../components/Button';
import SearchInput from '../../../../components/SearchInput';
import ConfirmModal from '../../../../components/ConfirmModal';
import ClassModal from './ClassModal';
import { PATHS } from '../../../../utils/constants';
import type { IClass } from '../../../../types/class.type';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: classData,
    loading,
    error,
    refetch: fetchClass,
  } = useFetch(classService.getClassById, id as string, [id]);

  const [searchInput, setSearchInput] = useState('');
  const [showClassModal, setShowClassModal] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
    onConfirm: () => {},
  });

  const handleUpdateClass = async (formData: Partial<IClass>) => {
    if (!id) return;
    try {
      const res = await classService.updateClass(id, formData);
      if (res.success) {
        setConfirmConfig({
          isOpen: true,
          title: 'Thành công',
          message: 'Cập nhật thông tin lớp học thành công!',
          type: 'success',
          onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
        });
        fetchClass();
        setShowClassModal(false);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!';
      setConfirmConfig({
        isOpen: true,
        title: 'Lỗi',
        message: detailError,
        type: 'danger',
        onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
      });
    }
  };

  const studentIds = classData?.studentIds;

  const filteredStudents = useMemo(() => {
    if (!studentIds) return [];
    if (!searchInput.trim()) return studentIds;

    const lowerSearch = searchInput.toLowerCase();
    return studentIds.filter(
      (student: any) =>
        student.fullName?.toLowerCase().includes(lowerSearch) ||
        student.phone?.includes(lowerSearch) ||
        student.email?.toLowerCase().includes(lowerSearch),
    );
  }, [studentIds, searchInput]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải thông tin lớp học...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
  if (!classData) return <div className="p-8 text-center text-gray-500">Không tìm thấy thông tin lớp học.</div>;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold uppercase tracking-wider shadow-sm">
            <CheckCircle2 size={16} /> Đang hoạt động
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-sm font-bold uppercase tracking-wider shadow-sm">
            <CheckCircle2 size={16} /> Đã hoàn thành
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-bold uppercase tracking-wider shadow-sm">
            <Clock size={16} /> {status}
          </span>
        );
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in duration-500">
      {showClassModal && (
        <ClassModal
          isOpen={showClassModal}
          onClose={() => setShowClassModal(false)}
          onSubmit={handleUpdateClass}
          initialData={classData as any}
        />
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Đóng"
        cancelText=""
      />

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
            title="Quay lại danh sách"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{classData.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Chi tiết lớp học và danh sách học viên</p>
          </div>
        </div>

        <Button variant="primary" icon={<Edit size={18} />} onClick={() => setShowClassModal(true)}>
          Chỉnh sửa thông tin
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50"></div>

            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <BookOpen size={28} />
              </div>
              {renderStatusBadge(classData.status)}
            </div>

            <div className="relative z-10 space-y-5">
              <div className="flex flex-col gap-1 border-b border-gray-50 pb-4">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Khóa học</span>
                <div className="flex items-center gap-2 text-gray-800 font-medium">
                  <BookOpen size={16} className="text-indigo-400" />
                  <span>{classData.courseId?.title || 'Chưa cập nhật'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 border-b border-gray-50 pb-4">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Giáo viên phụ trách
                </span>
                <div
                  className="flex items-center gap-2 text-gray-800 font-medium cursor-pointer"
                  onClick={() => navigate(PATHS.HR_TEACHERS_ID.replace(':id', classData.teacherId?._id || ''))}
                >
                  <UserIcon size={16} className="text-blue-400" />
                  <span>{classData.teacherId?.fullName || 'Chưa phân công'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 border-b border-gray-50 pb-4">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phòng học</span>
                <div className="flex items-center gap-2 text-gray-800 font-medium">
                  <MapPin size={16} className="text-rose-400" />
                  <span>{classData.roomId?.name || 'Chưa xếp phòng / Học Online'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tài liệu đính kèm</span>
                <div className="flex items-center gap-2 text-gray-800 font-medium">
                  <FileText size={16} className="text-emerald-400" />
                  <span>{classData.documents?.length || 0} tài liệu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Danh sách Học viên</h3>
                <span className="ml-2 text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                  {classData.studentIds?.length || 0}
                </span>
              </div>

              <div className="w-64">
                <SearchInput
                  type="text"
                  placeholder="Tìm tên, SĐT học viên..."
                  value={searchInput}
                  setSearchInput={setSearchInput}
                  setPage={() => {}}
                />
              </div>
            </div>

            <div className="flex-1">
              {filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredStudents.map((student: any) => (
                    <div
                      key={student._id || student}
                      className="group flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm bg-gray-50/50 hover:bg-white transition-all cursor-pointer"
                      onClick={() => navigate(PATHS.TRANINING_STUDENT_ID.replace(':id', student._id))}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-inner">
                        {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                          {student.fullName || 'Học viên ẩn danh'}
                        </span>
                        <span className="text-xs text-gray-500 truncate mt-0.5">
                          {student.phone || student.email || `ID: ${student._id?.slice(-6) || student.slice(-6)}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30">
                  <Users size={48} className="mb-4 opacity-20" />
                  <p className="text-base font-medium text-gray-500 mb-1">
                    {searchInput
                      ? 'Không tìm thấy học viên nào khớp với từ khóa.'
                      : 'Lớp học này chưa có học viên nào.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;
