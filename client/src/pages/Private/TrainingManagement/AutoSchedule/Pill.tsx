function Pill({
  label,
  active,
  activeStyle,
  onClick,
}: {
  label: string;
  active: boolean;
  activeStyle: { bg: string; color: string; border: string };
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        cursor: 'pointer',
        border: active ? `0.5px solid ${activeStyle.border}` : '0.5px solid #ccc',
        background: active ? activeStyle.bg : '#fff',
        color: active ? activeStyle.color : '#666',
        fontWeight: active ? 600 : 400,
        transition: 'all .15s',
      }}
    >
      {label}
    </button>
  );
}

export default Pill;
