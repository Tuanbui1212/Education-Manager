import { Loader2 } from 'lucide-react';

function LoadingOverlay({ tip, step, total }: { tip?: string; step?: number; total?: number }) {
  return (
    <>
      <style>{`
        @keyframes loadingSlide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(60%); }
          100% { transform: translateX(220%); }
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .loading-bar  { animation: loadingSlide  1.6s cubic-bezier(.4,0,.2,1) infinite; }
        .loading-overlay { animation: overlayFadeIn .2s ease both; }
        .loading-card    { animation: cardSlideUp  .25s ease both; }
      `}</style>

      <div className="loading-overlay fixed inset-0 z-[999] flex items-center justify-center bg-gray-50/90 backdrop-blur-sm">
        <div className="loading-card bg-white border border-gray-100 rounded-2xl shadow-xl px-8 py-6 w-full max-w-sm">
          {/* Icon + text */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Loader2 size={18} className="text-emerald-600 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-tight">Đang tính toán...</p>
              <p className="text-xs text-gray-400 mt-0.5">{tip ?? 'Vui lòng chờ giây lát!'}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-gray-100 rounded-full h-1 overflow-hidden relative">
            <div className="loading-bar absolute inset-y-0 left-0 w-[38%] bg-emerald-500 rounded-full" />
          </div>

          {/* Step counter */}
          {step !== undefined && total !== undefined && (
            <p className="text-[11px] text-gray-400 text-right mt-3">
              {step} / {total} bước hoàn thành
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default LoadingOverlay;
