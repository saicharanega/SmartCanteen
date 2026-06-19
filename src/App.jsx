import React, { useState, useEffect } from 'react';
import { CanteenProvider, useCanteen } from './context/CanteenContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AccessDenied from './components/AccessDenied';

// Pages
import StudentLogin from './pages/Student/Login';
import PortalLanding from './pages/PortalLanding';
import StudentDashboard from './pages/Student/Dashboard';
import StudentMenu from './pages/Student/Menu';
import StudentCart from './pages/Student/Cart';
import StudentOrders from './pages/Student/Orders';
import StudentProfile from './pages/Student/Profile';
import CashierDashboard from './pages/Cashier/CashierDashboard';
import KitchenDashboard from './pages/Kitchen/KitchenDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import MenuManagement from './pages/Admin/MenuManagement';
import StaffManagement from './pages/Admin/StaffManagement';

function CanteenApp() {
  const { activeRole, isLoggedIn } = useCanteen();
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync navigation on browser popstate (back/forward history keys)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  // Automatically reset the active view when role is set
  useEffect(() => {
    switch (activeRole) {
      case 'student':
        setCurrentView('dashboard');
        break;
      case 'cashier':
        setCurrentView('cashier_dashboard');
        break;
      case 'kitchen':
        setCurrentView('kitchen_dashboard');
        break;
      case 'admin':
        setCurrentView('admin_dashboard');
        break;
      default:
        setCurrentView('dashboard');
    }
  }, [activeRole]);

  // Toggle mobile sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Render active page component
  const renderView = () => {
    // Role-based view guards
    const studentViews = ['dashboard', 'menu', 'cart', 'orders', 'profile'];
    const cashierViews = ['cashier_dashboard'];
    const kitchenViews = ['kitchen_dashboard'];
    const adminViews = ['admin_dashboard', 'admin_menu', 'admin_staff'];

    if (activeRole === 'student' && !studentViews.includes(currentView)) {
      return <AccessDenied returnView="dashboard" />;
    }
    if (activeRole === 'cashier' && !cashierViews.includes(currentView)) {
      return <AccessDenied returnView="cashier_dashboard" />;
    }
    if (activeRole === 'kitchen' && !kitchenViews.includes(currentView)) {
      return <AccessDenied returnView="kitchen_dashboard" />;
    }
    if (activeRole === 'admin' && !adminViews.includes(currentView)) {
      return <AccessDenied returnView="admin_dashboard" />;
    }

    switch (currentView) {
      // Student views
      case 'dashboard':
        return <StudentDashboard setCurrentView={setCurrentView} />;
      case 'menu':
        return <StudentMenu setCurrentView={setCurrentView} />;
      case 'cart':
        return <StudentCart setCurrentView={setCurrentView} />;
      case 'orders':
        return <StudentOrders />;
      case 'profile':
        return <StudentProfile />;
      
      // Cashier views
      case 'cashier_dashboard':
        return <CashierDashboard />;
      
      // Kitchen views
      case 'kitchen_dashboard':
        return <KitchenDashboard />;
      
      // Admin views
      case 'admin_dashboard':
        return <AdminDashboard setCurrentView={setCurrentView} />;
      case 'admin_menu':
        return <MenuManagement />;
      case 'admin_staff':
        return <StaffManagement />;
      
      default:
        return <StudentDashboard setCurrentView={setCurrentView} />;
    }
  };

  // Route Guard: Render specific portal log-in flow or fallback to Gateway Selector
  if (!isLoggedIn) {
    if (currentPath === '/student/login') {
      return <StudentLogin portal="student" navigateTo={navigateTo} />;
    }
    if (currentPath === '/cashier/login') {
      return <StudentLogin portal="cashier" navigateTo={navigateTo} />;
    }
    if (currentPath === '/worker/login') {
      return <StudentLogin portal="kitchen" navigateTo={navigateTo} />;
    }
    if (currentPath === '/admin/login') {
      return <StudentLogin portal="admin" navigateTo={navigateTo} />;
    }
    // Fallback selection landing page
    return <PortalLanding navigateTo={navigateTo} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 relative">
      
      {/* Sidebar - fixed on desktop, absolute drawer on mobile */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Navbar */}
        <Navbar 
          toggleSidebar={toggleSidebar} 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
        />

        {/* Dynamic content page container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-32">
          {renderView()}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default function RootApp() {
  return (
    <CanteenProvider>
      <CanteenApp />
    </CanteenProvider>
  );
}
