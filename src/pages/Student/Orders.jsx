import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import OrderCard from '../../components/OrderCard';
import { Calendar, Filter, HelpCircle } from 'lucide-react';

const Orders = () => {
  const { currentUser, orders } = useCanteen();
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter orders for current student
  const studentOrders = orders.filter(
    order => order.rollNumber === currentUser?.rollNumber
  );

  // Filter based on selected status tab
  const filteredOrders = studentOrders.filter(order => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') {
      return order.status === 'PENDING_PAYMENT' || order.status === 'PAID' || order.status === 'READY';
    }
    return order.status === statusFilter;
  });

  const getTabLabel = (tab) => {
    switch (tab) {
      case 'ALL': return 'All Orders';
      case 'ACTIVE': return 'Preparing & Ready';
      case 'PENDING_PAYMENT': return 'Pending Cash';
      case 'PAID': return 'Paid (Preparing)';
      case 'READY': return 'Ready';
      case 'DELIVERED': return 'Delivered';
      default: return tab;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Filters bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-505 font-bold text-sm uppercase tracking-wide">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filter History</span>
        </div>
        
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
          {['ALL', 'ACTIVE', 'PENDING_PAYMENT', 'PAID', 'READY', 'DELIVERED'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`
                px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap
                ${statusFilter === tab
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-650 hover:bg-slate-100 hover:text-slate-800'
                }
              `}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          <span className="text-4xl block mb-2" role="img" aria-label="crying-face">😢</span>
          <h4 className="font-bold text-slate-800 text-sm">No orders found</h4>
          <p className="text-xs text-slate-450 mt-1">
            {statusFilter === 'ALL' 
              ? 'You have not placed any orders yet.' 
              : `No orders matching status "${statusFilter}".`}
          </p>
        </div>
      )}

      {/* Canteen Queue Info */}
      <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-orange-950 text-xs uppercase tracking-wide">About Canteen Queue Management</h5>
          <p className="text-slate-600 text-xs leading-relaxed mt-1">
            After ordering, monitor this tab. Once status changes to <strong className="text-emerald-700">READY TO PICKUP</strong>, walk up to the counter and show your order number. It's that simple!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Orders;
