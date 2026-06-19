import React, { useEffect } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { 
  TrendingUp, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ArrowRight,
  MessageSquare,
  CreditCard,
  Coins,
  Utensils,
  Award,
  ShieldAlert,
  Bell
} from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';

const AdminDashboard = ({ setCurrentView }) => {
  const { orders, adminAnalytics, topItems, fetchAdminAnalytics } = useCanteen();

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  // Hourly mock data for SVG chart
  const HOURLY_SALES = [
    { hour: '09 AM', amount: 80, height: 25 },
    { hour: '10 AM', amount: 160, height: 45 },
    { hour: '11 AM', amount: 240, height: 60 },
    { hour: '12 PM', amount: 680, height: 95 }, // Lunch peak
    { hour: '01 PM', amount: 790, height: 100 }, // Peak
    { hour: '02 PM', amount: 410, height: 75 },
    { hour: '03 PM', amount: 120, height: 35 },
    { hour: '04 PM', amount: 90, height: 20 }
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Analytics Stats Grid - 9 statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <StatsCard 
          title="Total Orders Today" 
          value={adminAnalytics?.totalOrders || 0} 
          icon={TrendingUp}
          changeText="All Transactions"
          changeType="neutral"
          description="today"
        />
        <StatsCard 
          title="Total Revenue Today" 
          value={`₹${adminAnalytics?.totalRevenue || 0}`} 
          icon={IndianRupee}
          changeText="Paid Sales"
          changeType="positive"
          description="today"
        />
        <StatsCard 
          title="Online Revenue" 
          value={`₹${adminAnalytics?.onlineRevenue || 0}`} 
          icon={CreditCard}
          changeText="Razorpay Paid"
          changeType="positive"
          description="today"
        />
        <StatsCard 
          title="Cash Revenue" 
          value={`₹${adminAnalytics?.cashRevenue || 0}`} 
          icon={Coins}
          changeText="Counter Sales"
          changeType="neutral"
          description="today"
        />
        <StatsCard 
          title="Pending Payments" 
          value={adminAnalytics?.pendingPaymentsCount || 0} 
          icon={Clock}
          changeText="Cashier Awaiting"
          changeType="negative"
          description="today"
        />
        <StatsCard 
          title="Kitchen Queue" 
          value={adminAnalytics?.paidCount || 0} 
          icon={Utensils}
          changeText="Status: PAID"
          changeType="neutral"
          description="preparing"
        />
        <StatsCard 
          title="Ready for Pickup" 
          value={adminAnalytics?.readyCount || 0} 
          icon={CheckCircle2}
          changeText="Status: READY"
          changeType="positive"
          description="waiting"
        />
        <StatsCard 
          title="Completed Orders" 
          value={adminAnalytics?.deliveredCount || 0} 
          icon={CheckCircle2}
          changeText="Status: DELIVERED"
          changeType="positive"
          description="delivered"
        />
        <StatsCard 
          title="WhatsApp Sent" 
          value={adminAnalytics?.whatsappSent || 0} 
          icon={MessageSquare}
          changeText="WhatsApp Success"
          changeType="positive"
          description="delivered"
        />
        <StatsCard 
          title="WhatsApp Failed" 
          value={adminAnalytics?.whatsappFailed || 0} 
          icon={MessageSquare}
          changeText="Outbound Errors"
          changeType={adminAnalytics?.whatsappFailed > 0 ? "negative" : "neutral"}
          description="failed"
        />
        <StatsCard 
          title="In-App Alerts" 
          value={adminAnalytics?.inAppSentToday || 0} 
          icon={Bell}
          changeText="Today's Website Alerts"
          changeType="positive"
          description="created"
        />
        <StatsCard 
          title="System Unread Alerts" 
          value={adminAnalytics?.totalUnreadInApp || 0} 
          icon={ShieldAlert}
          changeText="Pending Action"
          changeType={adminAnalytics?.totalUnreadInApp > 0 ? "negative" : "neutral"}
          description="unread"
        />
      </div>

      {/* Revenue Trend Chart Section */}
      {adminAnalytics?.hourlySales && adminAnalytics.hourlySales.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base leading-none">Hourly Sales Trend</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Live updates showing Peak Canteen Rush Hours</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-505 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Today</span>
            </div>
          </div>

          {/* Beautiful custom CSS/SVG representation of chart */}
          <div className="relative h-60 mt-4 flex items-end justify-between gap-2.5 sm:gap-6 border-b border-slate-150 pb-2.5">
            {/* Grid lines background */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50 z-0 pr-4">
              <div className="w-full border-t border-slate-100 h-0 text-[9px] text-slate-400 font-bold">Max</div>
              <div className="w-full border-t border-slate-100 h-0 text-[9px] text-slate-400 font-bold">75%</div>
              <div className="w-full border-t border-slate-100 h-0 text-[9px] text-slate-400 font-bold">50%</div>
              <div className="w-full border-t border-slate-100 h-0 text-[9px] text-slate-400 font-bold">25%</div>
            </div>

            {/* Bar display */}
            {adminAnalytics.hourlySales.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group z-10">
                <div className="relative w-full flex flex-col justify-end h-40">
                  
                  {/* Hover value bubble */}
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow scale-0 group-hover:scale-100 transition-transform origin-bottom duration-150 z-20 whitespace-nowrap">
                    ₹{data.amount}
                  </span>

                  {/* Animated bar */}
                  <div 
                    style={{ height: `${data.height}%` }}
                    className="w-full rounded-t-lg bg-orange-100 hover:bg-orange-500 border-t border-orange-200/50 hover:border-orange-500/80 transition-all duration-500 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-orange-400/20 to-transparent group-hover:from-white/20"></div>
                  </div>
                </div>
                
                <span className="text-[10px] font-bold text-slate-500 tracking-tight mt-2">{data.hour}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two column grid layout for ledger and top items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Ledger */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-none">Recent Transactions</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Audit log of all canteen operations</p>
              </div>
              <button 
                onClick={() => setCurrentView('admin_menu')}
                className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-all cursor-pointer"
              >
                <span>Manage Menu Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="py-3.5 px-5">Order #</th>
                    <th className="py-3.5 px-5">Customer Profile</th>
                    <th className="py-3.5 px-5">Items Purchased</th>
                    <th className="py-3.5 px-5 text-right">Amount</th>
                    <th className="py-3.5 px-5 text-center">Status</th>
                    <th className="py-3.5 px-5">Time Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                  {orders && orders.length > 0 ? (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900">#{order.id}</td>
                        <td className="py-3.5 px-5">
                          <div>
                            <p className="font-extrabold text-slate-800">{order.studentName}</p>
                            <p className="text-[10px] text-slate-450 mt-0.5">{order.rollNumber}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-medium text-slate-650">
                          {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                        </td>
                        <td className="py-3.5 px-5 text-right font-extrabold text-slate-900">₹{order.total}</td>
                        <td className="py-3.5 px-5 text-center">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3.5 px-5 text-slate-400 font-medium">{order.time}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 font-semibold">
                        No orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Most Ordered Items Today Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-50 pb-4 mb-4">
              <h3 className="font-bold text-slate-800 text-base leading-none">Top Ordered Items Today</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Canteen favorites sorted by sales volume</p>
            </div>

            <div className="flex flex-col gap-4.5">
              {topItems && topItems.length > 0 ? (
                topItems.map((item, index) => {
                  const maxQty = Math.max(...topItems.map(i => i.totalQuantity));
                  const percentage = maxQty > 0 ? (item.totalQuantity / maxQty) * 100 : 0;
                  return (
                    <div key={item._id || index} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-orange-50 text-orange-600 font-extrabold text-[10px] flex items-center justify-center border border-orange-100 shrink-0">
                            {index + 1}
                          </span>
                          <span className="truncate max-w-[120px]">{item.name}</span>
                        </span>
                        <span className="text-slate-500 font-medium text-[11px]">{item.totalQuantity} sold</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${percentage}%` }}
                          className="h-full bg-orange-500 rounded-full"
                        ></div>
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>Rank #{index + 1}</span>
                        <span>Revenue: ₹{item.revenue}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                  No orders processed today.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-orange-50/50 border border-orange-100 rounded-2xl flex items-center gap-3">
            <Award className="w-5.5 h-5.5 text-orange-500 shrink-0 stroke-[2.5]" />
            <div>
              <p className="text-[10px] font-extrabold text-orange-800 uppercase tracking-wider">Kitchen Favorite</p>
              <p className="text-slate-650 text-xs mt-0.5 font-semibold leading-normal">
                {topItems && topItems.length > 0 
                  ? `${topItems[0].name} is today's best seller!` 
                  : 'Awaiting first sales transactions...'}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
