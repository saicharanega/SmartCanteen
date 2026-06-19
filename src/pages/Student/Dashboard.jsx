import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { 
  TrendingUp, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight, 
  UtensilsCrossed, 
  History, 
  User 
} from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import OrderCard from '../../components/OrderCard';

const Dashboard = ({ setCurrentView }) => {
  const { currentUser, orders } = useCanteen();

  // Filter orders for the logged-in student
  const studentOrders = orders.filter(
    order => order.rollNumber === currentUser?.rollNumber
  );

  // Compute stats
  const activeOrdersCount = studentOrders.filter(
    o => o.status === 'PENDING_PAYMENT' || o.status === 'PAID' || o.status === 'READY'
  ).length;

  const completedOrdersCount = studentOrders.filter(
    o => o.status === 'DELIVERED'
  ).length;

  const totalOrdersCount = studentOrders.length;

  // Get recent 2 orders for quick display
  const recentOrders = studentOrders.slice(0, 2);

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-6 md:p-8 text-white orange-glow relative overflow-hidden">
        {/* Background bubbles */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-white/5 rounded-full translate-y-6"></div>

        <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider">
          Student Terminal
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight">
          Welcome back, {currentUser?.name || 'Student'}!
        </h1>
        <p className="text-orange-50 text-sm mt-1 max-w-md">
          Place orders digitally, track queue live, and grab your meal hot and fresh!
        </p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatsCard 
          title="Active Orders" 
          value={activeOrdersCount} 
          icon={TrendingUp}
          changeText="In Preparation"
          changeType="positive"
          description="Live queue"
        />
        <StatsCard 
          title="Completed Orders" 
          value={completedOrdersCount} 
          icon={CheckCircle2}
          changeText="Picked Up"
          changeType="neutral"
          description="Canteen history"
        />
        <StatsCard 
          title="Total Orders" 
          value={totalOrdersCount} 
          icon={ShoppingBag}
          changeText="All Time"
          changeType="neutral"
          description="Placed so far"
        />
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => setCurrentView('menu')}
            className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/20 text-left transition-all group cursor-pointer"
          >
            <div className="p-3 bg-orange-100/60 text-orange-600 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-all">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Browse Menu</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Order Food</p>
            </div>
          </button>

          <button 
            onClick={() => setCurrentView('orders')}
            className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/20 text-left transition-all group cursor-pointer"
          >
            <div className="p-3 bg-amber-100/60 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all">
              <History className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">My Orders</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Track status</p>
            </div>
          </button>

          <button 
            onClick={() => setCurrentView('profile')}
            className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/20 text-left transition-all group cursor-pointer"
          >
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-slate-800 group-hover:text-white transition-all">
              <User className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Student Profile</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Manage Info</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-lg">Recent Orders</h3>
          <button 
            onClick={() => setCurrentView('orders')}
            className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recentOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
            <span className="text-3xl block mb-2" role="img" aria-label="crying-face">😢</span>
            <p className="text-sm font-semibold">You have no recent orders.</p>
            <button 
              onClick={() => setCurrentView('menu')}
              className="mt-3.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Order Food Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
