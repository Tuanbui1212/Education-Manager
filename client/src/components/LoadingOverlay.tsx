function LoadingOverlay({ tip }: { tip?: string }) {
  return (
    <>
      <style>{`
        @keyframes loadingSlide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(60%); }
          100% { transform: translateX(200%); }
        }
        .loading-bar-anim {
          animation: loadingSlide 1.4s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(245,245,243,.92)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '0.5px solid #ddd',
            borderRadius: 14,
            padding: '32px 40px',
            minWidth: 320,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,.08)',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 12 }}>⚙️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>
            Đang gọi Backend tính toán...
          </div>

          <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>{tip ?? 'Vui lòng chờ giây lát!'}</div>
          <div style={{ background: '#eee', borderRadius: 20, height: 6, overflow: 'hidden' }}>
            <div
              className="loading-bar-anim"
              style={{ height: 6, borderRadius: 20, background: '#1D7A4A', width: '40%' }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default LoadingOverlay;
