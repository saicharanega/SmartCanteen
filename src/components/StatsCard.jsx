import React from 'react';

const StatsCard = ({ title, value, icon: Icon, changeText, changeType = 'positive', description }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      {/* Decorative top orange border on hover */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2 tracking-tight">{value}</h3>
          
          {changeText && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                changeType === 'positive' 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : changeType === 'negative' 
                  ? 'bg-rose-50 text-rose-600' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {changeText}
              </span>
              {description && <span className="text-slate-400 text-[10px]">{description}</span>}
            </div>
          )}
        </div>
        
        <div className="p-3 bg-orange-50 text-orange-500 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
          <Icon className="w-6 h-6 stroke-[2]" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
