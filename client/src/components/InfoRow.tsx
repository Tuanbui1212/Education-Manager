function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400 m-0 mb-0.5">{label}</p>
      <p className="text-xs font-semibold text-slate-700 m-0">{value || '—'}</p>
    </div>
  );
}

export default InfoRow;
