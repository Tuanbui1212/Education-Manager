import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import Button from './Button';

export type ConfirmModalType = 'success' | 'danger' | 'warning' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: ConfirmModalType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isLoading = false,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const config = {
    success: {
      icon: <CheckCircle className="text-[var(--color-success,#22c55e)]" size={48} />,
      bgIcon: 'bg-[var(--color-success-bg,#dcfce7)]',
      btnColor: 'bg-[var(--color-success,#22c55e)] hover:brightness-110 text-white transition-all',
    },
    danger: {
      icon: <AlertTriangle className="text-[var(--color-danger,#ef4444)]" size={48} />,
      bgIcon: 'bg-[var(--color-danger-bg,#fee2e2)]',
      btnColor: 'bg-[var(--color-danger,#ef4444)] hover:brightness-110 text-white transition-all',
    },
    warning: {
      icon: <AlertTriangle className="text-[var(--color-warning,#f59e0b)]" size={48} />,
      bgIcon: 'bg-[var(--color-warning-bg,#fef3c7)]',
      btnColor: 'bg-[var(--color-warning,#f59e0b)] hover:brightness-110 text-white transition-all',
    },
    info: {
      icon: <Info className="text-[var(--color-info,#3b82f6)]" size={48} />,
      bgIcon: 'bg-[var(--color-info-bg,#dbeafe)]',
      btnColor: 'bg-[var(--color-primary)] hover:brightness-110 text-white transition-all',
    },
  };

  const currentConfig = config[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      ></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6 sm:p-8 flex flex-col items-center relative">
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        )}

        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${currentConfig.bgIcon} animate-in fade-in zoom-in duration-300`}
        >
          {currentConfig.icon}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-8 px-2 leading-relaxed">{message}</p>

        <div className="flex gap-3 w-full">
          {cancelText && (
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11 text-sm font-semibold"
              onClick={onClose}
              type="button"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          )}

          <button
            className={`flex-1 rounded-xl h-11 text-sm font-semibold shadow-sm transition-all flex justify-center items-center gap-2 ${currentConfig.btnColor} ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4 text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
