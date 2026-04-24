const PALETTE = [
  { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200' },
  { bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-200' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' },
  { bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-200' },
];
export const getColor = (s: string) => PALETTE[(s || ' ').charCodeAt(0) % PALETTE.length];
export const getInitials = (name: string) => {
  const p = (name || '').trim().split(' ').filter(Boolean);
  return p.length < 2 ? (p[0]?.[0] ?? '?').toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

export const genderLabel = (g: string) => (g === 'MALE' ? 'Nam' : g === 'FEMALE' ? 'Nữ' : 'Khác');
export const getStatusDotColor = (status: string) => STATUS_DOTS[status] || 'bg-gray-400';
export const STATUS_DOTS: Record<string, string> = {
  ALL: 'bg-gray-400',
  POTENTIAL: 'bg-amber-400',
  ACTIVE: 'bg-emerald-400',
  RESERVED: 'bg-blue-400',
  INACTIVE: 'bg-rose-400',
};
