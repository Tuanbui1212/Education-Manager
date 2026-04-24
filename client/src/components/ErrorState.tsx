import { RefreshCw, X } from 'lucide-react';

const ErrorState = ({ msg, onRetry }: { msg: string; onRetry: () => void }) => (
  <div className="p-16 flex flex-col items-center gap-3">
    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
      <X size={26} className="text-red-400" />
    </div>
    <p className="font-semibold text-red-500">Không thể tải dữ liệu</p>
    <p className="text-xs text-gray-400 max-w-xs text-center">{msg}</p>
    <button
      onClick={onRetry}
      className="mt-2 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200
        rounded-xl text-sm font-medium text-gray-600 hover:border-gray-400 transition-colors"
    >
      <RefreshCw size={14} /> Thử lại
    </button>
  </div>
);

export default ErrorState;
