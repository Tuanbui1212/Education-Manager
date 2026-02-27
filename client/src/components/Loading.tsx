import { Loader2 } from 'lucide-react';

const GlobalLoading = ({ text = 'Đang tải dữ liệu...' }: { text?: string }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col justify-center items-center gap-4 animate-in zoom-in-95 duration-200">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />

        {text && <span className="text-sm font-medium text-[var(--color-text-secondary)] animate-pulse">{text}</span>}
      </div>
    </div>
  );
};

export default GlobalLoading;
