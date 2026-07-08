import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="card p-6 flex flex-col transition-all duration-300 hover:shadow-card-hover group relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-brand-500/5 blur-2xl group-hover:bg-brand-500/10 transition-colors duration-500"></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-surface-400 text-sm font-medium">{title}</h3>
        <div className="p-2.5 bg-surface-700/50 text-brand-400 rounded-xl shadow-inner border border-surface-600/50">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between relative z-10">
        <h2 className="text-3xl font-bold text-slate-100">{value}</h2>
        {trend && (
          <span className={`flex items-center text-sm font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.isPositive ? (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path></svg>
            )}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
