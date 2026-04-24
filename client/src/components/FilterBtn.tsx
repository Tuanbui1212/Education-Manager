import { ChevronDown, X } from 'lucide-react';

interface FilterBtnProps {
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  accentColor: string;
  onToggle: () => void;
  onClear: () => void;
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
}
const FilterBtn = ({
  isActive,
  label,
  icon,
  isOpen,
  accentColor,
  onToggle,
  onClear,
  children,
  containerRef,
}: FilterBtnProps) => (
  <div className="relative shrink-0" ref={containerRef}>
    <button
      type="button"
      onClick={onToggle}
      className={`
        flex items-center gap-2 pl-3.5 pr-3 py-2 rounded-xl border text-sm font-medium
        transition-all whitespace-nowrap
        ${
          isActive
            ? `bg-primary text-white border-transparent shadow-md shadow-primary/30`
            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <span className={isActive ? 'text-white/80' : 'text-gray-400'}>{icon}</span>
      {label}
      {isActive ? (
        <X
          size={13}
          className="ml-0.5 opacity-80 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        />
      ) : (
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      )}
    </button>
    {isOpen && (
      <div
        className="absolute top-[calc(100%+6px)] right-0 min-w-[190px] bg-white
        border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5"
      >
        {children}
      </div>
    )}
  </div>
);

export default FilterBtn;
