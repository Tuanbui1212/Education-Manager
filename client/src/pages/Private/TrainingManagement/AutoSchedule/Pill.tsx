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
      style={
        active
          ? {
              background: activeStyle.bg,
              color: activeStyle.color,
              borderColor: activeStyle.border,
            }
          : undefined
      }
      className={[
        'inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium',
        'border transition-all duration-150 cursor-pointer select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        active
          ? 'border-current shadow-sm scale-[1.03]'
          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export default Pill;
