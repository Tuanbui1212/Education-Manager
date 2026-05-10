import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import useFetch from '../../../hooks/useFetch';
import { attendanceService } from '../../../services/attendance.service';
import { PATHS } from '../../../utils/constants';
import { ExamManager } from './ExamManager';

const TeacherExamPage = () => {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();

  const { data: schedulesData } = useFetch(
    () => attendanceService.getSchedulesByClass({ classId: classId!, page: 1, limit: 1 }),
    null,
    [classId]
  );

  const className = (schedulesData as any)?.[0]?.className || '';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(PATHS.TEACHER_PORTAL)}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-0.5">
            Bài kiểm tra
          </p>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={22} className="text-blue-600" />
            {className ? `${className}` : 'Quản lý bài kiểm tra'}
          </h1>
        </div>
      </div>

      {/* Exam Manager Content */}
      {classId && <ExamManager classId={classId} />}
    </div>
  );
};

export default TeacherExamPage;
