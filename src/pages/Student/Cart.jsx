import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  CheckCircle, 
  ArrowRight, 
  Utensils, 
  CreditCard, 
  Coins, 
  Loader2,
  Check
} from 'lucide-react';

const Cart = ({ setCurrentView }) => {
  const { cart, updateCartQty, removeFromCart, placeOrder, currentUser } = useCanteen();
  const [successOrder, setSuccessOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online'); // online, cash
  const [isProcessing, setIsProcessing] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState(null);

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'online') {
      setIsProcessing(true);
      try {
        const savedToken = sessionStorage.getItem('smartcanteen_token');
        const orderRes = await fetch('http://localhost:5001/api/payment/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${savedToken}`
          },
          body: JSON.stringify({ amount: calculateTotal() })
        });
        const orderData = await orderRes.json();
        
        if (!orderData.success) {
          setIsProcessing(false);
          alert('Failed to initialize transaction: ' + orderData.message);
          return;
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setIsProcessing(false);
          alert('Could not load Razorpay SDK. Please check your internet connection.');
          return;
        }

        // Open real Razorpay Checkout modal in Test Mode
        const options = {
          key: orderData.keyId,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "SmartCanteen",
          description: "Online Food Checkout",
          order_id: orderData.order.id,
          handler: async function (response) {
            setIsProcessing(true);
            try {
              const verifyRes = await fetch('http://localhost:5001/api/payment/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${savedToken}`
                },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                const newOrder = await placeOrder('online', {
                  paymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature
                });
                if (newOrder) {
                  setSuccessOrder(newOrder);
                }
              } else {
                alert('Online payment validation signature mismatch.');
              }
            } catch (err) {
              console.error(err);
              alert('Verification server contact error.');
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: currentUser?.name || '',
            contact: currentUser?.phoneNumber || ''
          },
          theme: {
            color: "#f97316"
          }
        };
        setIsProcessing(false);
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        setIsProcessing(false);
        console.error(err);
        alert('Initiating online payment transaction failed.');
      }
    } else {
      setIsProcessing(true);
      const order = await placeOrder('cash');
      setIsProcessing(false);
      if (order) {
        setSuccessOrder(order);
      }
    }
  };

  const handleSimulateMockPayment = async (status) => {
    if (status === 'success') {
      setIsProcessing(true);
      const mockPayId = 'pay_mock_' + Math.random().toString(36).substring(2, 11);
      const mockOrderId = mockPaymentData.orderId;
      try {
        const savedToken = sessionStorage.getItem('smartcanteen_token');
        const verifyRes = await fetch('http://localhost:5001/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${savedToken}`
          },
          body: JSON.stringify({
            razorpayOrderId: mockOrderId,
            razorpayPaymentId: mockPayId,
            razorpaySignature: 'sig_mock_123',
            isMock: true
          })
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          const newOrder = await placeOrder('online', {
            paymentId: mockPayId,
            razorpayOrderId: mockOrderId
          });
          if (newOrder) {
            setSuccessOrder(newOrder);
          }
        }
      } catch (err) {
        console.error('Mock verification failed:', err);
      } finally {
        setIsProcessing(false);
        setMockPaymentData(null);
      }
    } else {
      setMockPaymentData(null);
    }
  };

  // 1. Success Screen View
  if (successOrder) {
    const isOnline = successOrder.status === 'PAID';
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center py-12 orange-glow-sm animate-scale-up">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ${
          isOnline ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
        }`}>
          <CheckCircle className="w-10 h-10 stroke-[2.5]" />
        </div>
        
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {isOnline ? 'Order Paid' : 'Order Placed (Pending Payment)'}
        </span>
        
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-3">
          Order #{successOrder.id} Registered
        </h2>
        
        {isOnline ? (
          <p className="text-slate-500 text-sm mt-3 px-4 leading-relaxed">
            Your online payment of <strong className="text-slate-900">₹{successOrder.total}</strong> was successful! The kitchen is preparing your meal.
          </p>
        ) : (
          <p className="text-slate-500 text-sm mt-3 px-4 leading-relaxed">
            Please walk up to the **Canteen billing counter** and pay <strong className="text-slate-900">₹{successOrder.total}</strong> via cash or scan the counter UPI QR.
          </p>
        )}

        {/* Dynamic Simulator Helper Card */}
        <div className="mt-8 p-4 bg-orange-50/50 border border-orange-100 rounded-2xl text-left">
          <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5" />
            <span>Workflow Simulation Guide</span>
          </h4>
          
          {isOnline ? (
            <p className="text-slate-600 text-xs leading-relaxed">
              Switch role to **Kitchen Worker** via the simulator at the bottom. The order will appear in the queue because it is **PAID**. Mark it as **READY**!
            </p>
          ) : (
            <p className="text-slate-600 text-xs leading-relaxed">
              Switch role to **Cashier**. Under *Pending Cash Payments*, select Order #{successOrder.id} and click **MARK AS PAID**. This moves it to the kitchen queue!
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setCurrentView('orders')}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Track Status
          </button>
          
          <button
            onClick={() => setCurrentView('menu')}
            className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 transition-all cursor-pointer"
          >
            <span>Order More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Empty Cart View
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center py-12">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="font-extrabold text-slate-800 text-lg">Your Cart is Empty</h3>
        <p className="text-slate-400 text-xs mt-2 px-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <button
          onClick={() => setCurrentView('menu')}
          className="mt-6 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/10 transition-colors cursor-pointer"
        >
          Explore Menu
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      
      {/* PROCESSING PAYMENT OVERLAY (SaaS Wow Effect) */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-xs w-full bg-white rounded-3xl p-6 text-center shadow-2xl border border-slate-100 flex flex-col items-center justify-center animate-scale-up">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin stroke-[2.5]" />
            <h4 className="font-extrabold text-slate-800 text-base mt-4">Verifying UPI/Card</h4>
            <p className="text-slate-450 text-[10px] uppercase font-bold mt-1.5 tracking-wider">Simulating Gateway Payment</p>
            <p className="text-slate-400 text-[11px] mt-3 leading-normal px-2">
              Authorizing transaction details securely. Please do not refresh.
            </p>
          </div>
        </div>
      )}

      {/* Cart Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Items Table (Left) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-base">Cart Items</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3 px-5">Item</th>
                  <th className="py-3 px-5 text-center">Quantity</th>
                  <th className="py-3 px-5 text-right">Price</th>
                  <th className="py-3 px-5 text-right">Subtotal</th>
                  <th className="py-3 px-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cart.map(item => (
                  <tr key={item.id} className="text-sm hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-slate-100" 
                        />
                        <div>
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateCartQty(item.id, item.quantity - 1)}
                          className="w-7 h-7 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg flex items-center justify-center hover:bg-slate-100 hover:text-slate-700 active:scale-90 transition-all cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-slate-800 w-6 text-center select-none text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.id, item.quantity + 1)}
                          className="w-7 h-7 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg flex items-center justify-center hover:bg-slate-100 hover:text-slate-700 active:scale-90 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right text-slate-650 font-medium">₹{item.price}</td>
                    <td className="py-4 px-5 text-right text-slate-900 font-bold">₹{item.price * item.quantity}</td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-450 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Checkout Billing Settings (Right) */}
        <div className="flex flex-col gap-6">
          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Choose Payment Route</h3>
            
            <div className="flex flex-col gap-3">
              {/* Online Payment Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  paymentMethod === 'online'
                    ? 'border-orange-500 bg-orange-50/15 shadow-sm'
                    : 'border-slate-150 bg-slate-50 hover:bg-slate-100/50'
                }`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${
                  paymentMethod === 'online' ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Online Payment</h4>
                  <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">Instantly process order with UPI, Card, Net Banking</p>
                </div>
                {paymentMethod === 'online' && (
                  <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-orange-500 text-white font-extrabold text-[9px] flex items-center justify-center">✓</span>
                )}
              </button>

              {/* Pay At Counter Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-50/15 shadow-sm'
                    : 'border-slate-150 bg-slate-50 hover:bg-slate-100/50'
                }`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${
                  paymentMethod === 'cash' ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Pay at Counter</h4>
                  <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">Register order instantly, pay Cash at counter to activate</p>
                </div>
                {paymentMethod === 'cash' && (
                  <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-orange-500 text-white font-extrabold text-[9px] flex items-center justify-center">✓</span>
                )}
              </button>
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Order Summary</h3>
            
            <div className="flex flex-col gap-3 py-2 border-y border-slate-50">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Subtotal</span>
                <span>₹{calculateTotal()}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Payment Mode</span>
                <span className="capitalize font-bold text-slate-700">{paymentMethod}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 text-sm">Total Amount</span>
              <span className="text-xl font-extrabold text-orange-600">₹{calculateTotal()}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              <span>
                {paymentMethod === 'online' ? 'Pay & Order Online' : 'Place Counter Order'}
              </span>
            </button>
          </div>
        </div>

        {/* MOCK PAYMENT DIALOG (Razorpay Simulated Sandbox) */}
        {mockPaymentData && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl animate-scale-up relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500 font-extrabold tracking-wider text-sm uppercase px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">Razorpay</span>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sandbox</span>
                </div>
                <button 
                  onClick={() => handleSimulateMockPayment('cancel')}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-xl font-extrabold text-slate-100 mb-1">Simulate Online Payment</h3>
              <p className="text-slate-400 text-xs leading-normal">
                Razorpay API is running in mock configuration mode. You can simulate transaction authentication states below.
              </p>

              <div className="my-5 bg-slate-800/40 rounded-2xl p-4 border border-slate-800 flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Merchant</span>
                  <span className="text-slate-200 font-bold">SmartCanteen Web Portal</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Order Reference</span>
                  <span className="text-slate-200 font-mono font-bold">{mockPaymentData.orderId}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-800/50 pt-2.5">
                  <span className="text-slate-400 font-semibold">Total Payable</span>
                  <span className="text-base font-extrabold text-orange-500">₹{mockPaymentData.amount}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => handleSimulateMockPayment('success')}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-extrabold rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 text-xs flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <span>Authorize & Approve Payment (Success)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateMockPayment('cancel')}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-300 hover:text-white font-bold rounded-xl transition-all text-xs cursor-pointer border-none"
                >
                  Decline / Cancel Transaction
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;
