import React, { useState, useEffect } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import MenuCard from '../../components/MenuCard';
import { Search, ShoppingBag, ArrowRight, Check } from 'lucide-react';

const Menu = ({ setCurrentView }) => {
  const { menuItems, addToCart, cart } = useCanteen();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Toast notifications state
  const [toast, setToast] = useState(null);
  const [toastTimeout, setToastTimeout] = useState(null);

  // Extract unique categories dynamically
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Trigger toast notification on item add
  const handleAddToCart = (item, quantity) => {
    addToCart(item, quantity);
    
    setToast({
      message: `${quantity}x ${item.name} added to cart!`,
    });

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    const timeout = setTimeout(() => {
      setToast(null);
    }, 2200);
    setToastTimeout(timeout);
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeout) clearTimeout(toastTimeout);
    };
  }, [toastTimeout]);

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Toast Notification (SaaS Feedback) */}
      {toast && (
        <div className="fixed bottom-6 right-6 sm:bottom-auto sm:top-20 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl border border-slate-800 shadow-2xl flex items-center gap-3 animate-slide-in orange-glow-sm">
          <div className="w-8.5 h-8.5 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100">{toast.message}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Shopping Basket updated</p>
          </div>
        </div>
      )}

      {/* Search and Filter Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for tea, samosa, noodles..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        </div>

        {/* Categories Scroller */}
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer
                ${selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-150'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Quick Bar if items are added */}
      {cartItemsCount > 0 && (
        <div className="bg-orange-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-orange-500/20 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">{cartItemsCount} item{cartItemsCount > 1 ? 's' : ''} in cart</p>
              <p className="text-[11px] text-orange-100">Ready to place your digital order?</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('cart')}
            className="flex items-center gap-1 bg-white text-orange-600 px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
          >
            <span>Go to Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Menu Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <MenuCard
              key={item.id}
              item={item}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          <span className="text-4xl block mb-2" role="img" aria-label="empty-plate">🍽️</span>
          <p className="text-sm font-semibold">No food items found matching your filter.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            className="mt-3.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;
