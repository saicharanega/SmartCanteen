import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { ChefHat, Check, Flame, Clock, ClipboardList, CheckCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const KitchenDashboard = () => {
  const { orders, updateOrderStatus } = useCanteen();

  // Active queue: status is 'PAID' (orders only appear in kitchen queue once they are paid)
  const activeOrders = orders.filter(order => order.status === 'PAID');
  
  // Ready queue: status is 'READY' (waiting for student pickup)
  const readyOrders = orders.filter(order => order.status === 'READY');

  return (
    <div className="flex flex-col gap-6">
      {/* Kitchen status overview */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <ChefHat className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Kitchen Live Queue</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Prepare PAID orders and coordinate collections</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-155 rounded-xl">
            <Flame className="w-4 h-4 text-blue-500 animate-bounce" />
            <div>
              <span className="text-[10px] text-slate-450 font-bold block uppercase">Preparing (PAID)</span>
              <span className="text-sm font-black text-slate-805">{activeOrders.length} orders</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <div>
              <span className="text-[10px] text-slate-450 font-bold block uppercase">Ready (Pickup)</span>
              <span className="text-sm font-black text-slate-805">{readyOrders.length} orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Queues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUMN 1: Preparing Queue (PAID status only) */}
        <div className="bg-slate-100/50 border border-slate-200/60 rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-slate-500" />
                <span>Preparing Queue (Paid)</span>
              </h4>
            </div>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-extrabold">
              {activeOrders.length} Queue
            </span>
          </div>

          {activeOrders.length > 0 ? (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] pr-1">
              {activeOrders.map(order => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl p-5 border-2 border-blue-500/20 shadow-md orange-glow-sm relative overflow-hidden transition-all hover:border-blue-500"
                >
                  {/* Glowing blue stripe on left */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>

                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">Order #{order.id}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-bold">
                          PAID
                        </span>
                      </div>
                      <p className="text-slate-505 font-semibold text-xs mt-1.5">
                        For: <span className="text-slate-700 font-bold">{order.studentName}</span> ({order.rollNumber})
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-slate-450 text-[10px] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{order.time}</span>
                    </div>
                  </div>

                  {/* Order items list */}
                  <div className="my-4 py-3 border-y border-slate-50 flex flex-col gap-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-xs font-black">
                            {item.quantity}x
                          </span>
                          <span className="text-slate-800">{item.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.category || 'Food'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'READY')}
                      className="w-full sm:w-auto py-2.5 px-5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark as READY</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/50 p-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <span className="text-3xl block mb-2" role="img" aria-label="happy-cook">👨‍🍳</span>
              <p className="text-sm font-bold text-slate-700">Kitchen is Clean!</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">No paid orders currently waiting for preparation.</p>
            </div>
          )}
        </div>

        {/* COLUMN 2: Ready for pickup (READY status) */}
        <div className="bg-slate-100/50 border border-slate-200/60 rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-slate-505" />
                <span>Ready for Pickup</span>
              </h4>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-extrabold">
              {readyOrders.length} Ready
            </span>
          </div>

          {readyOrders.length > 0 ? (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] pr-1">
              {readyOrders.map(order => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:border-slate-300"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>

                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Order #{order.id}</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">
                        Student: <span className="text-slate-700 font-bold">{order.studentName}</span>
                      </p>
                    </div>
                    <div>
                      <StatusBadge status="READY" />
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="my-4 py-3 border-y border-slate-50 flex flex-col gap-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded text-xs font-bold">
                            {item.quantity}x
                          </span>
                          <span>{item.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                      className="w-full sm:w-auto py-2.5 px-5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark as DELIVERED</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/50 p-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <span className="text-3xl block mb-2" role="img" aria-label="clock">⏰</span>
              <p className="text-sm font-bold text-slate-700">Queue is Clear</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">No orders are currently waiting for pickup.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default KitchenDashboard;
