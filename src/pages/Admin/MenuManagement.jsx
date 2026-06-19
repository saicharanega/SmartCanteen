import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { Plus, Edit2, Trash2, X, AlertTriangle, ToggleLeft, ToggleRight, Check } from 'lucide-react';

const MenuManagement = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability } = useCanteen();

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('ADD'); // ADD, EDIT
  const [currentItem, setCurrentItem] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Snacks');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');

  // 1. Open Modal
  const openAddModal = () => {
    setModalMode('ADD');
    setName('');
    setPrice('');
    setCategory('Snacks');
    setImage('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('EDIT');
    setCurrentItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category);
    setImage(item.image);
    setError('');
    setIsModalOpen(true);
  };

  // 2. Submit Action
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item Name is required.');
      return;
    }
    
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid price greater than ₹0.');
      return;
    }

    const itemPayload = {
      name: name.trim(),
      price: parsedPrice,
      category,
      image: image.trim() || undefined
    };

    let result;
    if (modalMode === 'ADD') {
      result = await addMenuItem(itemPayload);
    } else {
      result = await updateMenuItem({ ...currentItem, ...itemPayload });
    }

    if (result && !result.success) {
      setError(result.message || 'Operation failed');
    } else {
      setIsModalOpen(false);
    }
  };

  // 3. Delete Action
  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      const result = await deleteMenuItem(itemId);
      if (result && !result.success) {
        alert(result.message || 'Failed to delete item');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Canteen Menu Catalog</h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Define recipes, prices and daily stocks</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-orange-500/10"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add Food Item</span>
        </button>
      </div>

      {/* Menu Management Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3.5 px-5">Image</th>
                <th className="py-3.5 px-5">Item Name</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5 text-right">Price</th>
                <th className="py-3.5 px-5 text-center">Stock Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
              {menuItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                  {/* Image column */}
                  <td className="py-3 px-5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`w-12 h-10 object-cover rounded-lg border border-slate-100 ${
                        !item.available && 'grayscale opacity-60'
                      }`}
                    />
                  </td>
                  {/* Name column */}
                  <td className="py-3 px-5">
                    <div className="font-extrabold text-slate-800 text-sm">{item.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">ID: #{item.id}</div>
                  </td>
                  {/* Category column */}
                  <td className="py-3 px-5">
                    <span className="px-2 py-0.5 bg-slate-150 border border-slate-200/50 text-slate-650 rounded text-[9px] font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                  </td>
                  {/* Price column */}
                  <td className="py-3 px-5 text-right font-black text-slate-900 text-sm">₹{item.price}</td>
                  {/* Availability column */}
                  <td className="py-3 px-5 text-center">
                    <button
                      onClick={() => toggleItemAvailability(item.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold rounded-full cursor-pointer transition-all border ${
                        item.available
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250/60 hover:bg-emerald-100/60'
                          : 'bg-rose-50 text-rose-700 border-rose-250/60 hover:bg-rose-100/60'
                      }`}
                      title={item.available ? 'Click to make Out of Stock' : 'Click to make Available'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                      <span>{item.available ? 'In Stock' : 'Out of Stock'}</span>
                    </button>
                  </td>
                  {/* Actions column */}
                  <td className="py-3 px-5 text-right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-slate-450 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-450 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl relative overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-50">
              <h4 className="font-extrabold text-slate-800 text-lg">
                {modalMode === 'ADD' ? 'Add New Food Item' : 'Edit Menu Item'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 pl-0.5">
                  Item Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder="e.g. Samosa, Veg Sandwich"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 pl-0.5">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => { setPrice(e.target.value); setError(''); }}
                    placeholder="e.g. 20"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 pl-0.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all cursor-pointer"
                  >
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Fast Food">Fast Food</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 pl-0.5 flex justify-between">
                  <span>Image URL (Optional)</span>
                  <span className="text-[10px] text-slate-450 uppercase font-normal">Leaves default if blank</span>
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-xs font-medium outline-none transition-all"
                />
              </div>

              {/* Submit Buttons */}
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{modalMode === 'ADD' ? 'Create Item' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
