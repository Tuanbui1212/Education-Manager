import { BookOpen, Users } from 'lucide-react';
import type { IClass } from '../../../../types/class.type';
import { formatDate } from '../../../../utils/format.util';
import { CLASS_COLORS } from '../../../../utils/constants';
import Button from '../../../../components/Button';
import ErrorState from '../../../../components/ErrorState';
import TableSkeleton from '../../../../components/TableSkeleton';

function Page1({
  selectedIds,
  onToggle,
  onToggleAll,
  onNext,
  data,
  loading,
  error,
  refetch,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onNext: () => void;
  data: IClass[];
  loading?: boolean;
  error?: any;
  refetch?: () => void;
}) {
  if (error) {
    return <ErrorState msg={error} onRetry={refetch ?? (() => {})} />;
  }

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const count = selectedIds.length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Xếp lịch tự động</h1>
        <p className="text-sm text-gray-500 mt-1">Chọn các lớp chưa có lịch để đưa vào hệ thống xếp lịch.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm sticky top-0 z-10">
              <th className="p-4 w-12 text-center rounded-tl-xl">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  disabled={loading || data.length === 0}
                  className="w-3.5 h-3.5 cursor-pointer rounded accent-white"
                />
              </th>
              <th className="p-4 font-semibold">Lớp học / Khóa học</th>
              <th className="p-4 font-semibold">Giáo viên</th>
              <th className="p-4 font-semibold text-center">Buổi/tuần</th>
              <th className="p-4 font-semibold text-center">Tổng buổi</th>
              <th className="p-4 font-semibold rounded-tr-xl">Khai giảng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <TableSkeleton columns={6} rows={5} />
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <BookOpen size={48} strokeWidth={1} className="opacity-20 mb-3" />
                    <p className="text-sm font-medium">Không có lớp nào chưa có lịch.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((cls, i) => {
                const color = CLASS_COLORS[i % CLASS_COLORS.length];
                const checked = selectedIds.includes(cls._id as string);
                return (
                  <tr
                    key={cls._id}
                    onClick={() => onToggle(cls._id as string)}
                    className={`cursor-pointer transition-colors group ${checked ? 'bg-primary/5' : 'hover:bg-blue-50/50'}`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                        className="w-3.5 h-3.5 cursor-pointer rounded"
                        style={{ accentColor: '#3C3489' }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color.dot }} />
                        <div>
                          <div className="font-semibold text-sm text-gray-800">{cls.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {typeof cls.courseId === 'object' ? (cls.courseId?.title ?? '—') : '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-[180px] truncate">
                      {typeof cls.teacherId === 'object' ? cls.teacherId?.fullName : cls.teacherId}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                        {cls.lessonsPerWeek}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                        {cls.totalLessons}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{formatDate(cls.startDate)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users size={16} className="text-gray-400" />
          {count === 0 ? (
            <span className="text-gray-400">Chưa chọn lớp nào</span>
          ) : (
            <span>
              Đã chọn <strong className="text-primary">{count}</strong> / {data.length} lớp
            </span>
          )}
        </div>
        <Button variant="primary" onClick={onNext} disabled={count === 0}>
          Tiếp tục →
        </Button>
      </div>
    </div>
  );
}

export default Page1;
