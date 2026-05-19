import { AlertTriangle, CheckCircle, Info, Trash2, X } from 'lucide-react';
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
      icon: <CheckCircle size={22} strokeWidth={2} />,
      iconColor: 'text-[var(--color-success)]',
      accentBg: 'bg-[var(--color-success-bg)]',
      accentBorder: 'border-[var(--color-success)]',
      accentText: 'text-[var(--color-success)]',
      btnClass: 'bg-[var(--color-success)] hover:opacity-90 text-white shadow-sm',
      topBar: 'bg-[var(--color-success)]',
    },
    danger: {
      icon: <Trash2 size={22} strokeWidth={2} />,
      iconColor: 'text-[var(--color-danger)]',
      accentBg: 'bg-[var(--color-danger-bg)]',
      accentBorder: 'border-[var(--color-danger)]',
      accentText: 'text-[var(--color-danger)]',
      btnClass: 'bg-[var(--color-danger)] hover:opacity-90 text-white shadow-sm',
      topBar: 'bg-[var(--color-danger)]',
    },
    warning: {
      icon: <AlertTriangle size={22} strokeWidth={2} />,
      iconColor: 'text-[var(--color-warning)]',
      accentBg: 'bg-[var(--color-warning-bg)]',
      accentBorder: 'border-[var(--color-warning)]',
      accentText: 'text-[var(--color-warning)]',
      btnClass: 'bg-[var(--color-warning)] hover:opacity-90 text-white shadow-sm',
      topBar: 'bg-[var(--color-warning)]',
    },
    info: {
      icon: <Info size={22} strokeWidth={2} />,
      iconColor: 'text-[var(--color-info)]',
      accentBg: 'bg-[var(--color-info-bg)]',
      accentBorder: 'border-[var(--color-info)]',
      accentText: 'text-[var(--color-info)]',
      btnClass: 'bg-[var(--color-primary-btn)] hover:opacity-90 text-white shadow-sm',
      topBar: 'bg-[var(--color-info)]',
    },
  };

  const c = config[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--color-primary)]/30 backdrop-blur-[2px]"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-[400px] bg-white rounded-xl shadow-xl overflow-hidden
                   animate-in zoom-in-95 fade-in duration-200"
      >
        {/* Top accent bar */}
        <div className={`h-[3px] w-full ${c.topBar}`} />

        {/* Content */}
        <div className="px-6 pt-5 pb-6">
          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Icon badge */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.accentBg}`}>
                <span className={c.iconColor}>{c.icon}</span>
              </div>
              <h3 className="text-[15px] font-semibold text-[var(--color-text-main)] leading-snug pt-0.5">{title}</h3>
            </div>

            {!isLoading && (
              <button
                onClick={onClose}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]
                           hover:bg-gray-100 p-1.5 rounded-lg transition-all ml-2 flex-shrink-0"
                aria-label="Đóng"
              >
                <X size={16} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-4" />

          {/* Message */}
          <p className="text-[13.5px] text-[var(--color-text-secondary)] leading-relaxed mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-2.5 justify-end">
            {cancelText && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                type="button"
                className="h-9 px-4 text-[13px] rounded-lg"
              >
                {cancelText}
              </Button>
            )}

            <Button
              onClick={onConfirm}
              disabled={isLoading}
              type="button"
              className={`h-9 px-4 text-[13px] rounded-lg flex items-center gap-2
                         ${c.btnClass}
                         ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isLoading && (
                <svg
                  className="animate-spin h-3.5 w-3.5 text-current flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
