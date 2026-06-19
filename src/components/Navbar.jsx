import React, { useState } from 'react';
import { Menu, ShoppingCart, User, Bell, ShieldAlert } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  return date.toLocaleDateString();
};

const Navbar = ({ toggleSidebar, currentView, setCurrentView }) => {
  const { 
    activeRole, 
    currentUser, 
    cart, 
    isLoggedIn, 
    inAppNotifications, 
    unreadCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useCanteen();
  const [showNotifications, setShowNotifications] = useState(false);

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Student Dashboard';
      case 'menu':
        return 'Canteen Menu';
      case 'cart':
        return 'Shopping Cart';
      case 'orders':
        return 'Order History';
      case 'profile':
        return 'Student Profile';
      case 'cashier_dashboard':
        return 'Cashier POS Terminal';
      case 'kitchen_dashboard':
        return 'Kitchen Live Order Queue';
      case 'admin_dashboard':
        return 'Admin Analytics Dashboard';
      case 'admin_menu':
        return 'Admin Menu Catalog Management';
      default:
        return 'SmartCanteen';
    }
  };

  const getRoleBadgeColor = () => {
    switch (activeRole) {
      case 'student':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'cashier':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'kitchen':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'admin':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm">
      {/* Mobile Drawer Trigger & Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar} 
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 md:hidden transition-colors cursor-pointer"
          title="Toggle navigation"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>
        
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-none">
            {getViewTitle()}
          </h2>
          <p className="text-[10px] text-slate-400 font-medium hidden sm:block mt-0.5">
            SmartCanteen — Order Smart. Skip the Queue.
          </p>
        </div>
      </div>

      {/* Utilities Section */}
      <div className="flex items-center gap-3.5">
        {/* Role simulation indicator */}
        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getRoleBadgeColor()} hidden sm:inline-block`}>
          {activeRole} view
        </span>

        {/* Student actions */}
        {activeRole === 'student' && (
          <>
            {/* Quick Cart Shortcut */}
            <button 
              onClick={() => setCurrentView('cart')}
              className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all relative cursor-pointer"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2]" />
              {cart.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-orange-500 text-white font-extrabold text-[9px] flex items-center justify-center border border-white pulse-animation">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </>
        )}

        {/* Notifications dropdown & bell */}
        {activeRole === 'student' && isLoggedIn && (
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
                showNotifications ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center border border-white pulse-animation">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden py-1">
                <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => {
                        markAllNotificationsAsRead();
                        setShowNotifications(false);
                      }}
                      className="text-[10px] font-extrabold text-orange-600 hover:text-orange-700 uppercase tracking-wider cursor-pointer bg-transparent border-0"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {inAppNotifications.length > 0 ? (
                    inAppNotifications.map(notification => (
                      <div 
                        key={notification._id} 
                        className={`p-3.5 transition-colors text-left flex gap-2.5 items-start ${
                          notification.isRead ? 'bg-white' : 'bg-orange-50/20'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <p className="text-xs font-extrabold text-slate-800 leading-tight">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <button 
                                onClick={() => markNotificationAsRead(notification._id)}
                                className="text-[9px] font-extrabold text-orange-500 hover:text-orange-600 shrink-0 cursor-pointer bg-transparent border-0"
                              >
                                Read
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-normal font-medium break-words">
                            {notification.message}
                          </p>
                          <p className="text-[9px] text-slate-450 mt-1.5 font-semibold">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 font-semibold text-xs">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User profile dropdown simulator */}
        <div className="flex items-center gap-2 border-l border-slate-100 pl-3.5">
          {activeRole === 'student' && isLoggedIn && currentUser ? (
            <button 
              onClick={() => setCurrentView('profile')}
              className="flex items-center gap-2 text-left group hover:opacity-85 cursor-pointer"
            >
              <div className="w-8.5 h-8.5 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center shadow-sm text-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate w-24">
                  {currentUser.name}
                </p>
                <p className="text-[9px] text-slate-400 font-semibold tracking-wider">
                  {currentUser.rollNumber}
                </p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8.5 h-8.5 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-700 leading-tight capitalize">
                  {activeRole} Staff
                </p>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                  Staff terminal
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
