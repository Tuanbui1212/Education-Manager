function LoadingOverlay({ tip, step, total }: { tip?: string; step?: number; total?: number }) {
  return (
    <>
      <style>{`
        @keyframes loadingSlide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(60%); }
          100% { transform: translateX(220%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .loading-bar { animation: loadingSlide 1.6s cubic-bezier(.4,0,.2,1) infinite; }
        .loading-card { animation: fadeIn .3s ease both; }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(245,244,241,.93)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
        }}
      >
        <div
          className="loading-card"
          style={{
            background: '#fff',
            border: '0.5px solid rgba(0,0,0,.1)',
            borderRadius: 14,
            padding: '28px 36px',
            minWidth: 300,
            maxWidth: 340,
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#E1F5EE',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* swap with your spinner icon */}
              <span style={{ fontSize: 14, color: '#0F6E56' }}>↻</span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Đang tính toán...</p>
              <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{tip ?? 'Vui lòng chờ giây lát!'}</p>
            </div>
          </div>

          <div
            style={{ background: '#f0f0ed', borderRadius: 100, height: 4, overflow: 'hidden', position: 'relative' }}
          >
            <div
              className="loading-bar"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '38%',
                background: '#1D7A4A',
                borderRadius: 100,
              }}
            />
          </div>

          {step !== undefined && total !== undefined && (
            <p style={{ margin: '14px 0 0', fontSize: 11, color: '#aaa', textAlign: 'right' }}>
              {step} / {total} bước hoàn thành
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default LoadingOverlay;
