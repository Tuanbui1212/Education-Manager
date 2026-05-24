export const STAT_GRADIENTS = {
  total: { gradient: 'bg-gradient-to-br from-slate-600 to-slate-800', textColor: 'text-slate-600' },
  active: { gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', textColor: 'text-emerald-600' },
  upcoming: { gradient: 'bg-gradient-to-br from-sky-400 to-blue-600', textColor: 'text-sky-600' },
  warning: { gradient: 'bg-gradient-to-br from-amber-400 to-orange-500', textColor: 'text-amber-600' },
  inactive: { gradient: 'bg-gradient-to-br from-rose-400 to-red-500', textColor: 'text-rose-500' },
  neutral: { gradient: 'bg-gradient-to-br from-gray-400 to-gray-600', textColor: 'text-gray-500' },
  purple: { gradient: 'bg-gradient-to-br from-violet-500 to-purple-600', textColor: 'text-violet-600' },
} as const;
