// components/KpiCard.tsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  growth?: number; // % so với kỳ trước, undefined = không hiển thị
  icon: ReactNode;
  iconBg: string; // Tailwind class, vd: "bg-blue-50"
  iconColor: string; // Tailwind class, vd: "text-blue-500"
  valueColor?: string; // Tailwind class cho số tiền
  subtitle?: string; // Dòng phụ nhỏ bên dưới
  loading?: boolean;
}

const KpiCard = ({
  title,
  value,
  growth,
  icon,
  iconBg,
  iconColor,
  valueColor = 'text-text-main',
  subtitle,
  loading = false,
}: KpiCardProps) => {
  const renderGrowth = () => {
    if (growth === undefined) return null;
    if (growth > 0)
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <TrendingUp size={12} /> +{growth}%
        </span>
      );
    if (growth < 0)
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
          <TrendingDown size={12} /> {growth}%
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
        <Minus size={12} /> 0%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-7 w-36 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-20 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor}`}>{icon}</div>
      </div>

      <p className={`text-2xl font-bold tracking-tight mb-2 ${valueColor}`}>{value}</p>

      <div className="flex items-center gap-2 flex-wrap">
        {renderGrowth()}
        {subtitle && <span className="text-xs text-text-secondary">{subtitle}</span>}
      </div>
    </div>
  );
};

export default KpiCard;
