function MetricCard({ label, value, highlight, sub }) {
  return (
    <div
      style={{
        background: highlight ? '#0f172a' : '#f8fafc',
        border: '0.5px solid #e2e8f0',
        borderRadius: 14,
        padding: '14px 16px',
      }}
    >
      <p style={{ fontSize: 11, color: highlight ? '#94a3b8' : '#64748b', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 700, color: highlight ? '#fff' : '#1e293b', margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

export default MetricCard;
