import { TrendingUp, TrendingDown } from 'lucide-react';

function StatCard({ title, value, icon: Icon, trend, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: color + '15' }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" 
               style={{ 
                 backgroundColor: trend > 0 ? '#dcfce7' : '#fee2e2',
                 color: trend > 0 ? '#16a34a' : '#dc2626'
               }}>
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

export default StatCard;