import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  DollarSign,
  FileText,
  CalendarClock,
  CheckCircle2,
  Users,
  UserCheck,
  DoorOpen,
  Sparkles,
  Edit,
  Activity,
} from 'lucide-react';

import useFetch from '../../../../hooks/useFetch';
import { courseService } from '../../../../services/course.service';
import { classService } from '../../../../services/class.service';

import Button from '../../../../components/Button';
import CourseModal from './CourseModal';
import { PATHS } from '../../../../utils/constants';
import type { ICourse } from '../../../../types/course.type';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Fetch thông tin khóa học
  const {
    data: courseData,
    loading: courseLoading,
    error: courseError,
    refetch: fetchCourse,
  } = useFetch(courseService.getCourseById, id as string, [id]);

  // 2. Fetch danh sách lớp học thuộc khóa này
  const { data: classesResponse, loading: classesLoading } = useFetch(
    classService.getClasses,
    { courseId: id, limit: 50 },
    [id],
  );

  const classesList = Array.isArray(classesResponse) ? classesResponse : (classesResponse as any)?.data || [];

  // 3. Phân loại lớp học
  const { activeClasses, upcomingClasses } = useMemo(() => {
    const active = classesList.filter((c: any) => c.status === 'ACTIVE');
    const upcoming = classesList.filter((c: any) => c.status === 'UPCOMING');
    return { activeClasses: active, upcomingClasses: upcoming };
  }, [classesList]);

  const [showEditModal, setShowEditModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleUpdateCourse = async (formData: Partial<ICourse>) => {
    if (!id) return;
    try {
      const res = await courseService.updateCourse(id, formData);
      if (res.success) {
        fetchCourse();
        setShowEditModal(false);
      }
    } catch (error: any) {
      console.error('Lỗi cập nhật khóa học:', error);
      // Bạn có thể thêm Toast/ConfirmModal ở đây giống trang Management
    }
  };

  if (courseLoading)
    return <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải chi tiết khóa học...</div>;
  if (courseError) return <div className="p-8 text-center text-red-500">Lỗi: {courseError}</div>;
  if (!courseData) return <div className="p-8 text-center text-gray-500">Không tìm thấy thông tin khóa học.</div>;

  // Component tái sử dụng cho thẻ Lớp học
  const ClassCard = ({ classItem, type }: { classItem: any; type: 'ACTIVE' | 'UPCOMING' }) => (
    <div
      onClick={() => navigate(PATHS.TRAINING_CLASSES_ID.replace(':id', classItem._id))}
      className="group bg-white border border-gray-100 p-5 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
    >
      <div
        className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full -z-0 opacity-10 transition-colors ${type === 'ACTIVE' ? 'bg-emerald-500' : 'bg-blue-500'}`}
      ></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
          {classItem.name}
        </h4>
        {type === 'ACTIVE' ? (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shrink-0">
            <CheckCircle2 size={12} /> Đang học
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 shrink-0">
            <CalendarClock size={12} /> Sắp mở
          </span>
        )}
      </div>

      <div className="space-y-2.5 relative z-10">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UserCheck size={16} className="text-gray-400" />
          <span className="truncate">
            Giáo viên: <strong className="text-gray-700">{classItem.teacherId?.fullName || 'Chưa phân công'}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DoorOpen size={16} className="text-gray-400" />
          <span className="truncate">
            Phòng: <strong className="text-gray-700">{classItem.roomId?.name || 'Chưa xếp phòng'}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users size={16} className="text-gray-400" />
          <span>
            Sĩ số: <strong className="text-blue-600">{classItem.studentIds?.length || 0}</strong> học viên
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in duration-500">
      {/* Modal Sửa khóa học */}
      <CourseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateCourse}
        initialData={courseData as any}
      />

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Chi tiết khóa học</h1>
            <p className="text-sm text-gray-500 mt-1">Thông tin chương trình và danh sách các lớp</p>
          </div>
        </div>

        <Button variant="primary" icon={<Edit size={18} />} onClick={() => setShowEditModal(true)}>
          Chỉnh sửa khóa học
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* CỘT TRÁI: THÔNG TIN KHÓA HỌC */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-0 opacity-50"></div>

            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <BookOpen size={28} />
              </div>
            </div>

            <div className="relative z-10 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-gray-800 leading-tight mb-2">{courseData.title}</h2>
                <div className="flex items-center gap-2 text-2xl font-bold text-emerald-600 bg-emerald-50 w-max px-3 py-1 rounded-lg border border-emerald-100">
                  <DollarSign size={24} />
                  {formatCurrency(courseData.basePrice)}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-gray-400" />
                  <h3 className="font-bold text-gray-700">Nội dung chương trình (Syllabus)</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {courseData.syllabus || 'Chưa có thông tin nội dung chương trình.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: DANH SÁCH LỚP HỌC */}
        <div className="xl:col-span-2 space-y-8">
          {/* SECTION: LỚP ĐANG HOẠT ĐỘNG */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Activity size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Lớp đang hoạt động</h3>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {activeClasses.length}
              </span>
            </div>

            {classesLoading ? (
              <div className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100"></div>
            ) : activeClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeClasses.map((cls: any) => (
                  <ClassCard key={cls._id} classItem={cls} type="ACTIVE" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed border-gray-200 rounded-2xl text-gray-400">
                <p className="text-sm font-medium">Hiện không có lớp nào đang giảng dạy khóa này.</p>
              </div>
            )}
          </div>

          {/* SECTION: LỚP SẮP KHAI GIẢNG */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Sparkles size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Lớp chuẩn bị ra mắt</h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {upcomingClasses.length}
              </span>
            </div>

            {classesLoading ? (
              <div className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100"></div>
            ) : upcomingClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingClasses.map((cls: any) => (
                  <ClassCard key={cls._id} classItem={cls} type="UPCOMING" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed border-gray-200 rounded-2xl text-gray-400">
                <p className="text-sm font-medium">Chưa có kế hoạch mở thêm lớp mới cho khóa này.</p>
                <Button
                  variant="outline"
                  className="mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => navigate(PATHS.TRAINING_CLASSES)}
                >
                  Tới trang Quản lý lớp để tạo mới
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
