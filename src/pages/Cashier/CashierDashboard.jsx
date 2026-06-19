import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { 
  Search, 
  User, 
  CreditCard, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Check, 
  UserCheck, 
  AlertCircle,
  Coins,
  CheckCircle2
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const CashierDashboard = () => {
  const { menuItems, orders, lookupStudent, createCashierOrder, updateOrderStatus } = useCanteen();
  
  const [searchVal, setSearchVal] = useState('');
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  
  const [cashierCart, setCashierCart] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Search student
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    
    const student = await lookupStudent(searchVal.trim());
    setSearchedStudent(student);
    setSearchAttempted(true);
  };

  const handleResetSearch = () => {
    setSearchVal('');
    setSearchedStudent(null);
    setSearchAttempted(false);
  };

  // 2. POS Cart operations
  const addToCashierCart = (item) => {
    setCashierCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setSuccessMessage('');
  };

  const updateQty = (itemId, qty) => {
    if (qty <= 0) {
      setCashierCart(prev => prev.filter(item => item.id !== itemId));
      return;
    }
    setCashierCart(prev =>
      prev.map(item => (item.id === itemId ? { ...item, quantity: qty } : item))
    );
  };

  const removeFromCart = (itemId) => {
    setCashierCart(prev => prev.filter(item => item.id !== itemId));
  };

  const getCartTotal = () => {
    return cashierCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // 3. Generate Order (defaults to PAID immediately at POS register)
  const handleGenerateOrder = async () => {
    if (cashierCart.length === 0) return;
    
    const studentInfo = searchedStudent || {
      name: 'Walk-in Student',
      rollNumber: 'WALKIN',
      phoneNumber: 'N/A',
      department: 'N/A'
    };

    const newOrderId = await createCashierOrder(studentInfo, cashierCart);
    if (newOrderId) {
      setSuccessMessage(`Order #${newOrderId} generated & marked PAID for ${studentInfo.name}!`);
      setCashierCart([]);
      handleResetSearch();
    }
  };

  // Filter pending cash payments (only PENDING_PAYMENT status)
  const pendingPayments = orders.filter(order => order.status === 'PENDING_PAYMENT');

  // Filter completed and other transactions (view-only)
  const recentOrders = orders.filter(order => order.status !== 'PENDING_PAYMENT').slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Section POS Terminal grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* LEFT/CENTER Panel: Student Search & POS Menu Catalog */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          {/* Student Search lookup */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Student lookup</h3>
            
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search Roll Number (e.g. 22BD1A0501) or Phone..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                />
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
                
                {(searchAttempted || searchedStudent) && (
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            <div className="flex gap-2 mt-3 items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Demo Quick Lookups:</span>
              <button
                onClick={async () => { setSearchVal('22BD1A0501'); const s = await lookupStudent('22BD1A0501'); setSearchedStudent(s); setSearchAttempted(true); }}
                className="text-[10px] bg-slate-100 hover:bg-orange-50 hover:text-orange-600 px-2 py-0.5 rounded border border-slate-150 font-bold text-slate-600 transition-colors cursor-pointer"
              >
                Sai Charan (22BD1A0501)
              </button>
              <button
                onClick={async () => { setSearchVal('22BD1A0502'); const s = await lookupStudent('22BD1A0502'); setSearchedStudent(s); setSearchAttempted(true); }}
                className="text-[10px] bg-slate-100 hover:bg-orange-50 hover:text-orange-600 px-2 py-0.5 rounded border border-slate-150 font-bold text-slate-600 transition-colors cursor-pointer"
              >
                Priya Sharma (22BD1A0502)
              </button>
            </div>

            {searchAttempted && (
              <div className="mt-5 border-t border-slate-150 pt-5">
                {searchedStudent ? (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                        {searchedStudent.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base">{searchedStudent.name}</h4>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {searchedStudent.rollNumber} &bull; {searchedStudent.department}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100/60 text-emerald-800 border border-emerald-250/50 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Student Selected</span>
                    </span>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                    <div>
                      <span className="font-bold">Student not found.</span> Proceeding will log order as a <strong className="underline">Walk-in Order</strong>.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* POS Menu Grid */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">POS Cashier Menu</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => item.available && addToCashierCart(item)}
                  disabled={!item.available}
                  className={`
                    p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all relative overflow-hidden group cursor-pointer
                    ${item.available 
                      ? 'border-slate-100 bg-slate-50 hover:bg-orange-50/20 hover:border-orange-200 hover:-translate-y-0.5' 
                      : 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                    }
                  `}
                >
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-white text-slate-500 rounded border border-slate-100">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm mt-2.5 truncate w-full group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </h4>
                  </div>

                  <div className="flex justify-between items-center w-full mt-auto">
                    <span className="font-extrabold text-slate-950 text-base">₹{item.price}</span>
                    {item.available && (
                      <span className="p-1 bg-white border border-slate-200 rounded-lg text-slate-500 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT Column: POS Checkout billing */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">
            New Register Sale
          </h3>

          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {cashierCart.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {cashierCart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs py-1">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400">₹{item.price} each</p>
                    </div>

                    <div className="flex items-center gap-2 mr-3">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-5.5 h-5.5 bg-slate-50 border border-slate-100 text-slate-500 rounded flex items-center justify-center hover:bg-slate-100"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-5.5 h-5.5 bg-slate-50 border border-slate-100 text-slate-500 rounded flex items-center justify-center hover:bg-slate-100"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-right w-12">₹{item.price * item.quantity}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-450 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-50 pt-3">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
                  <span>Subtotal</span>
                  <span>₹{getCartTotal()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                  <span className="font-bold text-slate-800 text-sm">Grand Total</span>
                  <span className="text-xl font-extrabold text-orange-600">₹{getCartTotal()}</span>
                </div>
              </div>

              <button
                onClick={handleGenerateOrder}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/10"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm & Print Bill</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <ShoppingCart className="w-8 h-8 stroke-[1.5] mx-auto mb-2 text-slate-350" />
              <p className="font-bold">Register basket is empty</p>
              <p className="text-[10px] text-slate-400 mt-1">Select catalog items to add.</p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION A: Pending Cash Payments (MARK AS PAID ACTIONS ONLY) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 bg-amber-50/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500 animate-bounce" />
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-none">Pending Counter Payments</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Students waiting to pay cash to release order to kitchen</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-500 text-white rounded-full text-xs font-black">
            {pendingPayments.length} Waiting
          </span>
        </div>

        {pendingPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3.5 px-5">Order #</th>
                  <th className="py-3.5 px-5">Student / Roll</th>
                  <th className="py-3.5 px-5">Items</th>
                  <th className="py-3.5 px-5 text-right">Amount Due</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                {pendingPayments.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">#{order.id}</td>
                    <td className="py-3.5 px-5">
                      <div>
                        <p className="font-bold text-slate-800">{order.studentName}</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">{order.rollNumber}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-600">
                      {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-5 text-right font-extrabold text-orange-600">₹{order.total}</td>
                    <td className="py-3.5 px-5 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'PAID')}
                        className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-[10px] shadow-sm shadow-orange-500/10 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>MARK AS PAID</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-xs font-semibold">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 stroke-[1.5] mx-auto mb-2" />
            <p className="text-slate-750">No pending counter payments!</p>
            <p className="text-[10px] text-slate-400 mt-1">All registered counter sales have been paid.</p>
          </div>
        )}
      </div>

      {/* SECTION B: Recent Transactions Ledger (VIEW ONLY - NO KITCHEN ACTIONS) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-base leading-none">Processed Counter Sales</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Recent cashier transactions audit record (View-only)</p>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cashier Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3.5 px-5">Order #</th>
                <th className="py-3.5 px-5">Student / Roll</th>
                <th className="py-3.5 px-5">Items</th>
                <th className="py-3.5 px-5 text-right">Total</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Preparation Queue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">#{order.id}</td>
                  <td className="py-3.5 px-5">
                    <div>
                      <p className="font-bold text-slate-800">{order.studentName}</p>
                      <p className="text-[10px] text-slate-450 mt-0.5">{order.rollNumber}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-slate-600">
                    {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                  </td>
                  <td className="py-3.5 px-5 text-right font-extrabold text-slate-900">₹{order.total}</td>
                  <td className="py-3.5 px-5 text-center">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="text-[10px] text-slate-400 italic font-medium px-2 block">
                      Kitchen Controlled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default CashierDashboard;
