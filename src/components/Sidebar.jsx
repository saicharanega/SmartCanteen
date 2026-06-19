import React from 'react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingBag, 
  History, 
  User, 
  CreditCard, 
  ChefHat, 
  BarChart3, 
  Coffee,
  LogOut,
  UserPlus
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';

const Sidebar = ({ currentView, setCurrentView, isOpen, toggleSidebar }) => {
  const { activeRole, cart, logoutStudent, isLoggedIn } = useCanteen();

  // Define nav links based on active role
  const getNavLinks = () => {
    switch (activeRole) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'menu', label: 'View Menu', icon: UtensilsCrossed },
          { id: 'cart', label: 'My Cart', icon: ShoppingBag, badge: cart.length > 0 ? cart.length : null },
          { id: 'orders', label: 'My Orders', icon: History },
          { id: 'profile', label: 'My Profile', icon: User }
        ];
      case 'cashier':
        return [
          { id: 'cashier_dashboard', label: 'Cashier Terminal', icon: CreditCard }
        ];
      case 'kitchen':
        return [
          { id: 'kitchen_dashboard', label: 'Kitchen Orders', icon: ChefHat }
        ];
      case 'admin':
        return [
          { id: 'admin_dashboard', label: 'Admin Metrics', icon: BarChart3 },
          { id: 'admin_menu', label: 'Menu Catalog', icon: Coffee },
          { id: 'admin_staff', label: 'Staff Accounts', icon: UserPlus }
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  const handleLinkClick = (id) => {
    setCurrentView(id);
    if (toggleSidebar) toggleSidebar(); // Close mobile drawer
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out border-r border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div>
          {/* Logo Section */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2.5">
            <span className="text-2xl" role="img" aria-label="canteen-logo">🍽️</span>
            <div>
              <h1 className="font-extrabold text-lg text-white leading-tight tracking-tight">SmartCanteen</h1>
              <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Skip the Queue</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in Sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-bold text-orange-400 text-xs">
                {activeRole.substring(0, 2).toUpperCase()}
              </div>
              <div className="truncate w-32 text-left">
                <p className="text-xs font-bold text-slate-200 truncate capitalize">{activeRole} Mode</p>
                <p className="text-[9px] text-slate-500 truncate">Secure Session</p>
              </div>
            </div>

            {isLoggedIn && (
              <button 
                onClick={logoutStudent}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
