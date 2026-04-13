// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  gradient: string;
  textColor: string;
  active: boolean;
  onClick: () => void;
}
const StatCard = ({ icon, label, value, gradient, textColor, active, onClick }: StatCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      relative overflow-hidden flex items-center gap-4 p-5 rounded-2xl border-2
      text-left w-full transition-all duration-200 group cursor-pointer
      ${
        active
          ? `${gradient} border-transparent shadow-lg shadow-black/10 scale-[1.02]`
          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md hover:scale-[1.01]'
      }
    `}
  >
    <div
      className={`absolute -right-3 -top-3 w-16 h-16 rounded-full opacity-10
      ${active ? 'bg-white' : 'bg-gray-400'}`}
    />
    <div
      className={`p-2.5 rounded-xl shrink-0
      ${active ? 'bg-white/30' : 'bg-gray-50 group-hover:bg-gray-100'}`}
    >
      <span className={active ? 'text-white' : textColor}>{icon}</span>
    </div>
    <div>
      <p
        className={`text-2xl font-extrabold leading-none
        ${active ? 'text-white' : 'text-gray-800'}`}
      >
        {value ?? <span className="text-gray-300 text-xl">—</span>}
      </p>
      <p className={`text-xs mt-1.5 font-medium ${active ? 'text-white/80' : 'text-gray-500'}`}>{label}</p>
    </div>
  </button>
);

export default StatCard;
