import React from 'react';
import { Calendar, IndianRupee, Hash, Layers } from 'lucide-react';
import StatusBadge from './StatusBadge';

const OrderCard = ({ order }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">Order #{order.id}</h4>
            <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
              <Calendar className="w-3 h-3" />
              <span>{order.time}</span>
            </div>
          </div>
        </div>
        <div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Items list */}
      <div className="py-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>Items Ordered</span>
        </div>
        <ul className="flex flex-col gap-2">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs">
                  {item.quantity}x
                </span>
                <span className="text-slate-700 font-medium">{item.name}</span>
              </div>
              <span className="text-slate-500 text-xs">₹{item.price * item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Total section */}
      <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
          <IndianRupee className="w-4 h-4 text-slate-400" />
          <span>Total Paid</span>
        </div>
        <span className="text-base font-extrabold text-slate-900">
          ₹{order.total}
        </span>
      </div>
    </div>
  );
};

export default OrderCard;
