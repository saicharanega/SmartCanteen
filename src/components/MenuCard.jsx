import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag, AlertCircle, Check } from 'lucide-react';

const MenuCard = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!item.available) return;
    onAddToCart(item, quantity);
    setQuantity(1); // reset after add
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-all duration-300 flex flex-col justify-between group ${
      item.available 
        ? 'hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5' 
        : 'opacity-65 filter grayscale border-slate-200'
    }`}>
      <div className="relative overflow-hidden aspect-[4/3] bg-slate-100">
        {/* Category tag */}
        <span className="absolute top-3 left-3 z-10 text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-white/95 text-slate-800 rounded-full shadow-sm">
          {item.category}
        </span>
        
        {/* Out of stock overlay */}
        {!item.available && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-white p-3 text-center">
            <AlertCircle className="w-8 h-8 text-amber-400 mb-1" />
            <span className="font-bold text-sm tracking-wide uppercase">Out of Stock</span>
            <span className="text-[10px] text-slate-200">Unavailable today</span>
          </div>
        )}

        {/* Zooming image */}
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-slate-800 text-lg group-hover:text-orange-500 transition-colors">
            {item.name}
          </h4>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            ₹{item.price}
          </p>
        </div>

        {item.available ? (
          <div className="mt-4 flex flex-col gap-2">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-1">
              <button 
                onClick={decrement}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-800 transition-all active:scale-95"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              
              <span className="font-bold text-slate-800 text-sm w-8 text-center select-none">
                {quantity}
              </span>
              
              <button 
                onClick={increment}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-800 transition-all active:scale-95"
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button 
              onClick={handleAdd}
              className={`w-full py-2.5 px-4 font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-300 cursor-pointer ${
                added 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
                  : 'bg-orange-500 hover:bg-orange-600 hover:shadow-md hover:shadow-orange-500/20 active:scale-[0.98]'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <button 
              disabled
              className="w-full py-2.5 px-4 bg-slate-100 text-slate-400 font-semibold rounded-xl flex items-center justify-center gap-2 border border-slate-200 cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Out of Stock</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuCard;
