import React from 'react';
import { User, CreditCard, ChefHat, ShieldAlert, ArrowRight } from 'lucide-react';

const PortalLanding = ({ navigateTo }) => {
  const portals = [
    {
      title: '🎓 Student Portal',
      description: 'Order food, make online payments, track order status, and manage profile.',
      icon: User,
      path: '/student/login',
      badge: 'Student',
      themeColor: 'from-orange-500 to-amber-500',
      textColor: 'text-orange-500',
      bgColor: 'bg-orange-50/40',
      borderColor: 'border-orange-100/60'
    },
    {
      title: '💰 Cashier Portal',
      description: 'Verify cash payments, register walk-in orders, and look up student details.',
      icon: CreditCard,
      path: '/cashier/login',
      badge: 'Cashier Staff',
      themeColor: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-50/40',
      borderColor: 'border-blue-100/60'
    },
    {
      title: '👨‍🍳 Kitchen Portal',
      description: 'Receive incoming orders, view food prep queues, and mark orders ready.',
      icon: ChefHat,
      path: '/worker/login',
      badge: 'Kitchen Crew',
      themeColor: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50/40',
      borderColor: 'border-emerald-100/60'
    },
    {
      title: '👨‍💼 Admin Portal',
      description: 'Access revenue metrics, view reset logs, manage staff, and modify menu catalogs.',
      icon: ShieldAlert,
      path: '/admin/login',
      badge: 'Administrator',
      themeColor: 'from-rose-500 to-pink-500',
      textColor: 'text-rose-500',
      bgColor: 'bg-rose-50/40',
      borderColor: 'border-rose-100/60'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background visual flourishes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-center my-auto">
        {/* Header Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-slate-100 rounded-3xl shadow-md mb-4 text-3xl">
            🍽️
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            SmartCanteen
          </h1>
          <p className="text-orange-600 text-xs font-extrabold tracking-wider uppercase mt-1">
            Order Smart. Skip the Queue.
          </p>
        </div>

        {/* Portals Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {portals.map((portal, idx) => {
            const IconComponent = portal.icon;
            return (
              <button
                key={idx}
                onClick={() => navigateTo(portal.path)}
                className="flex flex-col justify-between text-left p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-350 group cursor-pointer hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Active hover accent gradient bar */}
                <div className={`absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r ${portal.themeColor} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${portal.bgColor} ${portal.textColor} transition-all duration-300 group-hover:scale-110`}>
                      <IconComponent className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${portal.bgColor} ${portal.textColor}`}>
                      {portal.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-850 group-hover:text-orange-550 transition-colors">
                    {portal.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {portal.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-orange-500 transition-all duration-300 mt-6 pl-1">
                  <span>Enter Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="text-center text-slate-450 text-[11px] font-bold tracking-wide mt-12">
        © {new Date().getFullYear()} SmartCanteen — Secure Multi-Role Portal System.
      </footer>
    </div>
  );
};

export default PortalLanding;
