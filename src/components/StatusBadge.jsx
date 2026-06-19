import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return {
          bg: 'bg-amber-50 text-amber-750 border-amber-250/60',
          dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse',
          label: 'PENDING COUNTER PAYMENT'
        };
      case 'PAID':
        return {
          bg: 'bg-blue-50 text-blue-750 border-blue-250/60',
          dot: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse',
          label: 'PAID (IN PREPARATION)'
        };
      case 'READY':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-250/60',
          dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse',
          label: 'READY TO PICKUP'
        };
      case 'DELIVERED':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
          label: 'DELIVERED'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
          label: status
        };
    }
  };

  const { bg, dot, label } = getStyles();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full border ${bg} transition-all duration-300`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
