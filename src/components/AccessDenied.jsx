import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';

const AccessDenied = ({ returnView }) => {
  const { logoutStudent } = useCanteen();

  const handleReset = () => {
    // Reset view state to default dashboard view
    window.location.reload();
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center py-12 relative overflow-hidden animate-scale-up">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl"></div>

        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-550 border border-rose-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShieldAlert className="w-10 h-10 stroke-[2]" />
        </div>

        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700">
          Access Blocked
        </span>

        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-3">
          Access Denied
        </h2>

        <p className="text-slate-500 text-sm mt-3 px-4 leading-relaxed">
          Unauthorized privilege level. You do not have permission to access this administrative terminal panel.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Dashboard</span>
          </button>
          
          <button
            onClick={logoutStudent}
            className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer border-none"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
