import { StatCardProps } from "../utils/Types/statsType";

export function StatCard({ label, value, icon: Icon, isAmount = false, large = false, className = "", compact = false }: StatCardProps) {
  const base = "bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300";

  // sizing variants: compact (smallest) -> default -> large
  const sizeClass = compact ? "p-0.5" : large ? "p-4" : "p-2";
  const iconClass = compact ? "w-3 h-3 text-red-600" : large ? "w-5 h-5 text-red-600" : "w-4 h-4 text-red-600";
  const labelClass = compact ? "text-[10px] font-medium text-gray-600" : large ? "text-sm font-medium text-gray-600" : "text-xs font-medium text-gray-600";
  const valueClass = compact ? "text-[12px] font-semibold text-gray-900" : large ? "text-base font-semibold text-gray-900" : "text-sm font-semibold text-gray-900";

  return (
    <div className={`${base} ${sizeClass} ${className}`.trim()}>
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-2">
          <Icon className={iconClass} />
          <h4 className={labelClass}>{label}</h4>
        </div>
        <p className={valueClass}>
          {isAmount ? `₱${value.toLocaleString()}` : value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
