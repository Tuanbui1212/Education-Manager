import { Filter, Inbox, X } from 'lucide-react';

interface EmptyStateProps {
  isFiltered: boolean;
  onReset: () => void;
  colSpan?: number;
  emptyText?: string;
  filteredText?: string;
  icon?: React.ReactNode;
}

const EmptyState = ({
  isFiltered,
  onReset,
  colSpan = 9,
  emptyText = 'Chưa có dữ liệu nào',
  filteredText = 'Không có kết quả phù hợp',
  icon,
}: EmptyStateProps) => (
  <tr>
    <td colSpan={colSpan}>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center">
            {icon ?? <Inbox size={34} className="text-blue-300" />}
          </div>
          {isFiltered && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
              <Filter size={11} className="text-white" />
            </div>
          )}
        </div>
        <p className="font-bold text-gray-600 text-base">{isFiltered ? filteredText : emptyText}</p>
        <p className="text-sm text-gray-400 mt-1.5 text-center max-w-xs leading-relaxed">
          {isFiltered ? 'Thử thay đổi từ khoá hoặc bộ lọc.' : 'Bắt đầu bằng cách thêm mục đầu tiên.'}
        </p>
        {isFiltered && (
          <button
            onClick={onReset}
            className="mt-4 px-4 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl font-medium transition-colors flex items-center gap-1.5"
          >
            <X size={13} /> Xóa bộ lọc
          </button>
        )}
      </div>
    </td>
  </tr>
);

export default EmptyState;
